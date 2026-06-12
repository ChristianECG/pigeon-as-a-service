"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LoftRow } from "@/lib/db";

type Props = {
  lofts: LoftRow[];
};

export default function GlobalLoftMap({ lofts }: Props) {
  const router = useRouter();
  const [selectedLoft, setSelectedLoft] = useState<LoftRow | null>(null);

  function handleSelectLoft(loft: LoftRow) {
    setSelectedLoft(loft);
  }

  function handleCompose() {
    if (selectedLoft) {
      router.push(`/compose/${selectedLoft.lat.toFixed(6)},${selectedLoft.lon.toFixed(6)}`);
    }
  }

  const bounds = lofts.length > 0
    ? lofts.reduce(
        (acc, loft) => ({
          minLat: Math.min(acc.minLat, loft.lat),
          maxLat: Math.max(acc.maxLat, loft.lat),
          minLon: Math.min(acc.minLon, loft.lon),
          maxLon: Math.max(acc.maxLon, loft.lon),
        }),
        { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 }
      )
    : { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;
  const deltaLat = bounds.maxLat - bounds.minLat || 1;
  const deltaLon = bounds.maxLon - bounds.minLon || 1;
  const zoom = Math.max(1, Math.min(20, 10 - Math.log2(Math.max(deltaLat, deltaLon) / 20)));

  return (
    <div className="flex flex-1 gap-4">
      <div className="flex-1 relative">
        <Map
          initialViewState={{ longitude: centerLon, latitude: centerLat, zoom }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        >
          {lofts.map((loft) => (
            <Marker
              key={loft.id}
              longitude={loft.lon}
              latitude={loft.lat}
              anchor="center"
              onClick={() => handleSelectLoft(loft)}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectLoft(loft);
                }}
                className={`w-3 h-3 rounded-full ring-1 transition-all ${
                  selectedLoft?.id === loft.id
                    ? "bg-[var(--accent)] ring-[var(--accent)] w-4 h-4"
                    : "bg-[#c8a97e]/60 ring-[#c8a97e] hover:scale-125"
                }`}
                title={`${loft.lat.toFixed(4)}, ${loft.lon.toFixed(4)}`}
              />
            </Marker>
          ))}
        </Map>
      </div>

      {lofts.length > 0 && (
        <div className="w-80 border-l border-[var(--border)] flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {lofts.map((loft) => (
                <button
                  key={loft.id}
                  onClick={() => handleSelectLoft(loft)}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${
                    selectedLoft?.id === loft.id
                      ? "bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--foreground)]"
                      : "border border-transparent hover:bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  <p className="font-mono text-xs mb-0.5">
                    {loft.lat.toFixed(4)}, {loft.lon.toFixed(4)}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">{loft.id}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedLoft && (
            <div className="border-t border-[var(--border)] p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-[var(--muted)]">Selected Loft</p>
                <p className="font-mono text-xs text-[var(--foreground)]">
                  {selectedLoft.lat.toFixed(6)}, {selectedLoft.lon.toFixed(6)}
                </p>
              </div>
              <button
                onClick={handleCompose}
                className="w-full px-4 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
              >
                Compose →
              </button>
            </div>
          )}
        </div>
      )}

      {lofts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--muted)]">No lofts discovered yet</p>
        </div>
      )}
    </div>
  );
}
