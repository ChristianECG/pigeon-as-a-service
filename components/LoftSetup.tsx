"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

type Coords = { lat: number; lon: number };
type Mode = "choose" | "manual" | "locating";

export default function LoftSetup() {
  const t = useTranslations("geolocation");
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("choose");
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("loft_id");
    if (!id) return;
    fetch(`/api/loft?id=${id}`)
      .then((r) => r.json())
      .then((loft) => {
        if (loft?.lat != null) {
          router.replace(`/loft/${loft.lat.toFixed(6)},${loft.lon.toFixed(6)}`);
        }
      })
      .catch(() => {});
  }, [router]);
  const [heading, setHeading] = useState(0);
  const [altBand, setAltBand] = useState(1);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);

  function requestGeolocation() {
    setMode("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setMode("manual"); // stays on map so user can fine-tune
      },
      () => {
        setDenied(true);
        setMode("manual");
      },
      { timeout: 10_000 }
    );
  }

  const handleMapClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (mode !== "manual") return;
      setCoords({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    },
    [mode]
  );

  async function establishLoft() {
    if (!coords) return;
    setSaving(true);
    const res = await fetch("/api/loft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...coords, heading, alt_band: altBand }),
    });
    const loft = await res.json();
    localStorage.setItem("loft_id", loft.id);
    router.push(`/loft/${loft.lat.toFixed(6)},${loft.lon.toFixed(6)}`);
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Step 1: choose mode */}
      {mode === "choose" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={requestGeolocation}
              className="px-6 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded hover:opacity-90 transition-opacity"
            >
              {t("useLocation")}
            </button>
            <button
              onClick={() => setMode("manual")}
              className="px-6 py-3 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] text-sm transition-colors"
            >
              {t("placeManually")}
            </button>
          </div>
        </div>
      )}

      {/* Step 1b: locating spinner */}
      {mode === "locating" && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--muted)]">{t("locating")}</p>
        </div>
      )}

      {/* Step 2: map */}
      {mode === "manual" && (
        <>
          <div className="relative" style={{ height: "calc(100vh - 160px)" }}>
            {denied && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
                {t("denied")}
              </div>
            )}

            {!coords && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] pointer-events-none">
                {t("clickToPlace")}
              </div>
            )}

            <Map
              initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              onClick={handleMapClick}
              cursor="crosshair"
            >
              {coords && (
                <Marker longitude={coords.lon} latitude={coords.lat} anchor="center">
                  <span className="text-2xl select-none drop-shadow">🕊️</span>
                </Marker>
              )}
            </Map>
          </div>

          {/* Step 3: confirm panel */}
          {coords && (
            <div className="p-6 border-t border-[var(--border)] space-y-4">
              <p className="text-xs text-[var(--muted)] font-mono">
                AA {coords.lat.toFixed(6)} {coords.lon.toFixed(6)} {heading}{" "}
                {altBand}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-[var(--muted)]">
                    {t("heading")} (°)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={359}
                    value={heading}
                    onChange={(e) =>
                      setHeading(((Number(e.target.value) % 360) + 360) % 360)
                    }
                    className="bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </label>

                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-[var(--muted)]">
                    {t("altBand")}
                  </span>
                  <select
                    value={altBand}
                    onChange={(e) => setAltBand(Number(e.target.value))}
                    className="bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {([0, 1, 2, 3] as const).map((v) => (
                      <option key={v} value={v}>
                        {t(`altBands.${v}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCoords(null)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                >
                  {t("reposition")}
                </button>
                <button
                  onClick={establishLoft}
                  disabled={saving}
                  className="flex-1 px-6 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "…" : t("confirmLoft")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
