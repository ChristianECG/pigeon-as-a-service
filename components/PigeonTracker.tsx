"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LineLayerSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Status = "in_flight" | "delivered" | "nxpigeon";

type Props = {
  messageId: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  initialStatus: Status;
  dispatchedAt: number;
  etaAt: number;
  content: string;
  distanceKm: number;
  windMs: number;
  failureReason: string | null;
};

const routeLine: LineLayerSpecification = {
  id: "route",
  type: "line",
  source: "route",
  paint: {
    "line-color": "#c8a97e",
    "line-width": 1.5,
    "line-opacity": 0.4,
    "line-dasharray": [6, 4],
  },
};

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatCoords(lat: number, lon: number): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

type TimelineEvent = {
  key: string;
  time: number | null;
  label: string;
  detail?: string;
  status: "done" | "active" | "pending" | "error";
};

export default function PigeonTracker({
  messageId,
  fromLat,
  fromLon,
  toLat,
  toLon,
  initialStatus,
  dispatchedAt,
  etaAt,
  content,
  distanceKm,
  windMs,
  failureReason,
}: Props) {
  const t = useTranslations("pigeon");
  const locale = useLocale();

  const [status, setStatus] = useState<Status>(initialStatus);
  const [pigeonPos, setPigeonPos] = useState<{ lat: number; lon: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [now, setNow] = useState(Date.now());

  const fetchPosition = useCallback(async () => {
    const res = await fetch(`/api/pigeon?id=${messageId}`);
    const data = await res.json();
    if (data.position) {
      setPigeonPos({ lat: data.position.lat, lon: data.position.lon });
      setProgress(data.position.progress);
    }
    if (data.message?.status !== "in_flight") {
      setStatus(data.message.status);
    }
  }, [messageId]);

  useEffect(() => {
    fetchPosition();
    if (initialStatus !== "in_flight") return;
    const poll = setInterval(fetchPosition, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [fetchPosition, initialStatus]);

  const centerLon = (fromLon + toLon) / 2;
  const centerLat = (fromLat + toLat) / 2;
  const totalDuration = etaAt - dispatchedAt;
  const elapsed = now - dispatchedAt;

  const routeGeoJSON: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [fromLon, fromLat],
            [toLon, toLat],
          ],
        },
        properties: {},
      },
    ],
  };

  const events: TimelineEvent[] = [
    {
      key: "dispatched",
      time: dispatchedAt,
      label: t("timeline.dispatched"),
      detail: `from ${formatCoords(fromLat, fromLon)} · ${Math.round(distanceKm)} km · ${windMs.toFixed(1)} m/s wind`,
      status: "done",
    },
    {
      key: "in_flight",
      time: status === "in_flight" ? null : status === "delivered" ? etaAt : null,
      label:
        status === "in_flight"
          ? `In flight — ${Math.round(progress * 100)}% complete`
          : status === "delivered"
          ? t("timeline.arrived")
          : t("timeline.lost"),
      detail:
        status === "in_flight" && pigeonPos
          ? t("timeline.positionElapsed", { coords: formatCoords(pigeonPos.lat, pigeonPos.lon), duration: formatDuration(elapsed) })
          : status === "in_flight"
          ? t("timeline.elapsed", { duration: formatDuration(elapsed) })
          : undefined,
      status:
        status === "in_flight"
          ? "active"
          : status === "delivered"
          ? "done"
          : "error",
    },
    {
      key: "eta",
      time: etaAt,
      label:
        status === "delivered"
          ? `${t("datagram")} → ${formatCoords(toLat, toLon)}`
          : status === "nxpigeon"
          ? `NXPIGEON — ${failureReason ?? "cause unknown"}`
          : `ETA ${formatCoords(toLat, toLon)}`,
      detail:
        status === "in_flight"
          ? t("timeline.eta", { duration: formatDuration(etaAt - now) })
          : status === "delivered"
          ? t("timeline.totalFlightTime", { duration: formatDuration(totalDuration) })
          : t("timeline.retransmitLimit"),
      status:
        status === "delivered"
          ? "done"
          : status === "nxpigeon"
          ? "error"
          : "pending",
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="relative" style={{ height: "calc(100vh - 400px)", minHeight: 240 }}>
        <Map
          initialViewState={{ longitude: centerLon, latitude: centerLat, zoom: 2 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        >
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLine} />
          </Source>

          <Marker longitude={fromLon} latitude={fromLat} anchor="center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c8a97e]/60 ring-1 ring-[#c8a97e]" />
          </Marker>

          <Marker longitude={toLon} latitude={toLat} anchor="center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40 ring-1 ring-white/60" />
          </Marker>

          {pigeonPos && status === "in_flight" && (
            <Marker longitude={pigeonPos.lon} latitude={pigeonPos.lat} anchor="center">
              <span className="text-xl select-none drop-shadow-lg">🕊️</span>
            </Marker>
          )}

          {status === "nxpigeon" && (
            <Marker
              longitude={pigeonPos?.lon ?? centerLon}
              latitude={pigeonPos?.lat ?? centerLat}
              anchor="center"
            >
              <span className="text-xl select-none opacity-40">💀</span>
            </Marker>
          )}
        </Map>
      </div>

      {/* Timeline */}
      <div className="border-t border-[var(--border)] px-6 py-5">
        <div className="relative border-l border-[var(--border)] pl-6 space-y-5">
          {events.map((ev) => (
            <div key={ev.key} className="relative">
              <span
                className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border ${
                  ev.status === "done"
                    ? "bg-[var(--accent)] border-[var(--accent)]"
                    : ev.status === "active"
                    ? "bg-[var(--background)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                    : ev.status === "error"
                    ? "bg-red-600 border-red-600"
                    : "bg-[var(--background)] border-[var(--border)]"
                }`}
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-3">
                  {ev.time && (
                    <span className="text-xs text-[var(--muted)] font-mono tabular-nums shrink-0" suppressHydrationWarning>
                      {new Date(ev.time).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      ev.status === "error"
                        ? "text-red-500"
                        : ev.status === "active"
                        ? "text-[var(--accent)]"
                        : ev.status === "pending"
                        ? "text-[var(--muted)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {ev.label}
                  </span>
                </div>
                {ev.detail && (
                  <p className="text-xs text-[var(--muted)] font-mono">{ev.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datagram — only visible on delivery */}
      {status === "delivered" && (
        <div className="px-6 pb-6">
          <div className="border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted)] mb-2">Datagram</p>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
