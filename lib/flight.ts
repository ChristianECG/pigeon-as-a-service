/**
 * Flight physics for RFC 1149 avian carriers.
 *
 * ETA CALCULATION
 * ---------------
 * Base speed: 50 km/h (typical homing pigeon cruise).
 * Wind adjustment: headwind/tailwind component projected onto flight bearing.
 *   effective_speed = base_speed + wind_component (clamped to [20, 80] km/h)
 * Rest stops: 1 hour per 6 hours of flight (pigeons require sleep).
 * NXPIGEON probability: flat 5% per transmission (configurable via NXPIGEON_RATE).
 *   Cause is selected randomly from RFC 1149 §11 threat taxonomy.
 *
 * POSITION IN FLIGHT
 * ------------------
 * Position is NOT stored in the database. It is computed on demand:
 *   progress = (now - dispatched_at) / (eta_at - dispatched_at)
 *   position = great_circle_interpolate(origin, destination, progress)
 * This keeps the DB lean and avoids stale coordinates.
 *
 * WIND DATA
 * ---------
 * Queried from Open-Meteo at 3 waypoints along the great circle route
 * (25%, 50%, 75% of distance). The mean headwind component is used.
 */

import { greatCircleDistance, greatCircleInterpolate, bearing } from "./geo";

const BASE_SPEED_KMH = 50;
const MAX_SPEED_KMH = 80;
const MIN_SPEED_KMH = 20;
const REST_HOURS_PER_FLIGHT_HOURS = 1 / 6;

// Flat probability of carrier loss per transmission. Configurable.
export const NXPIGEON_RATE = 0.05;

// RFC 1149 §11 threat taxonomy — causes for carrier loss.
const FAILURE_CAUSES = [
  "Hawk-in-the-Middle (HitM) attack — carrier intercepted by apex predator mid-flight (§11.1)",
  "Pigeon spoofing detected — ring authentication failed on arrival (§11.2)",
  "Loft hijacking — destination loft under adversarial control (§11.3)",
  "Denial of Flight (DoF) — destination loft capacity exhausted by volumetric attack (§11.4)",
  "Migration season routing anomaly — carrier deviated from trained route (§11.5)",
  "Physical layer threat — felid interception at loft perimeter (§11.6)",
  "Replay attack via taxidermied carrier — vitality check failed on arrival (§11.7)",
  "Zone Signing Key compromise — TCP intercepted during key rollover (§11.8)",
  "Covert Feather Channel detected — carrier quarantined pending ornithological review (§11.9)",
] as const;

export interface WindSample {
  windSpeedMs: number;
  windDirectionDeg: number;
}

// Samples wind at a point using Open-Meteo (no API key required).
export async function fetchWindAt(
  lat: number,
  lon: number
): Promise<WindSample> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&forecast_days=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return {
      windSpeedMs: data.current?.wind_speed_10m ?? 0,
      windDirectionDeg: data.current?.wind_direction_10m ?? 0,
    };
  } catch {
    return { windSpeedMs: 0, windDirectionDeg: 0 };
  }
}

// Projects wind onto flight bearing. Positive = tailwind, negative = headwind.
function windComponent(
  windSpeedMs: number,
  windDirectionDeg: number,
  flightBearingDeg: number
): number {
  const windBearing = (windDirectionDeg + 180) % 360; // wind flows FROM this direction
  const angleDiff =
    ((flightBearingDeg - windBearing + 540) % 360) - 180;
  return windSpeedMs * 3.6 * Math.cos((angleDiff * Math.PI) / 180); // ms → km/h
}

export interface FlightPlan {
  distanceKm: number;
  flightHours: number;
  etaMs: number; // milliseconds from dispatch
  meanWindMs: number; // average wind speed along route (informational)
  nxpigeon: boolean;
  failureReason: string | null; // RFC §11 cause if nxpigeon, else null
}

export async function calculateFlightPlan(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<FlightPlan> {
  const distanceKm = greatCircleDistance(fromLat, fromLon, toLat, toLon);
  const flightBearing = bearing(fromLat, fromLon, toLat, toLon);

  // Sample wind at 25%, 50%, and 75% of the route
  const waypoints = [0.25, 0.5, 0.75].map((t) =>
    greatCircleInterpolate(fromLat, fromLon, toLat, toLon, t)
  );
  const windSamples = await Promise.all(
    waypoints.map(([lat, lon]) => fetchWindAt(lat, lon))
  );

  const meanWindComponent =
    windSamples.reduce(
      (sum, w) =>
        sum + windComponent(w.windSpeedMs, w.windDirectionDeg, flightBearing),
      0
    ) / windSamples.length;

  const meanWindMs =
    windSamples.reduce((sum, w) => sum + w.windSpeedMs, 0) / windSamples.length;

  const effectiveSpeed = Math.max(
    MIN_SPEED_KMH,
    Math.min(MAX_SPEED_KMH, BASE_SPEED_KMH + meanWindComponent)
  );

  const rawFlightHours = distanceKm / effectiveSpeed;
  const restHours = rawFlightHours * REST_HOURS_PER_FLIGHT_HOURS;
  const flightHours = rawFlightHours + restHours;

  const nxpigeon = Math.random() < NXPIGEON_RATE;
  const failureReason = nxpigeon
    ? FAILURE_CAUSES[Math.floor(Math.random() * FAILURE_CAUSES.length)]
    : null;

  return {
    distanceKm,
    flightHours,
    etaMs: Math.round(flightHours * 3600 * 1000),
    meanWindMs,
    nxpigeon,
    failureReason,
  };
}

// Computes current carrier position from stored flight record.
export function currentPosition(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  dispatchedAt: number,
  etaAt: number
): { lat: number; lon: number; progress: number } {
  const now = Date.now();
  const progress = Math.min(
    1,
    Math.max(0, (now - dispatchedAt) / (etaAt - dispatchedAt))
  );
  const [lat, lon] = greatCircleInterpolate(
    fromLat,
    fromLon,
    toLat,
    toLon,
    progress
  );
  return { lat, lon, progress };
}
