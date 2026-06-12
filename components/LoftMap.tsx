"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { LineLayerSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import type { MessageRow } from "@/lib/db";
import "maplibre-gl/dist/maplibre-gl.css";

type PigeonPosition = {
  messageId: string;
  lat: number;
  lon: number;
  progress: number;
  etaAt: number;
};

type LoftCoords = Record<string, { lat: number; lon: number }>;

type Props = {
  loftId: string;
  lat: number;
  lon: number;
  messages: MessageRow[];
  initialLoftCoords: LoftCoords;
};

const routeLayer: LineLayerSpecification = {
  id: "routes",
  type: "line",
  source: "routes",
  paint: {
    "line-color": "#c8a97e",
    "line-width": 1,
    "line-opacity": 0.3,
    "line-dasharray": [4, 4],
  },
};

export default function LoftMap({ loftId, lat, lon, messages, initialLoftCoords }: Props) {
  const t = useTranslations("loft");
  const [positions, setPositions] = useState<PigeonPosition[]>([]);
  const [settled, setSettled] = useState<MessageRow[]>(messages);
  const [loftCoords, setLoftCoords] = useState<LoftCoords>(initialLoftCoords);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/sse?loft_id=${loftId}`);
    esRef.current = es;

    es.addEventListener("positions", (e) => {
      setPositions(JSON.parse(e.data));
    });
    es.addEventListener("lofts", (e) => {
      setLoftCoords((prev) => ({ ...prev, ...JSON.parse(e.data) }));
    });
    es.addEventListener("messages", (e) => {
      setSettled(JSON.parse(e.data));
    });

    return () => es.close();
  }, [loftId]);

  const inFlight = settled.filter((m) => m.status === "in_flight");

  const routeGeoJSON: FeatureCollection = {
    type: "FeatureCollection",
    features: inFlight
      .map((msg) => {
        const from = loftCoords[msg.from_loft_id];
        const to = loftCoords[msg.to_loft_id];
        if (!from || !to) return null;
        return {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [from.lon, from.lat],
              [to.lon, to.lat],
            ],
          },
          properties: { id: msg.id },
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null),
  };

  return (
    <div className="relative" style={{ height: "calc(100vh - 240px)", minHeight: 340 }}>
      <Map
        initialViewState={{ longitude: lon, latitude: lat, zoom: 3 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        {/* Home loft */}
        <Marker longitude={lon} latitude={lat} anchor="center">
          <div className="w-3 h-3 rounded-full bg-[#c8a97e] ring-2 ring-[#c8a97e]/30" />
        </Marker>

        {/* In-flight carriers */}
        {positions.map((p) => (
          <Marker key={p.messageId} longitude={p.lon} latitude={p.lat} anchor="center">
            <span className="text-lg select-none drop-shadow">🕊️</span>
          </Marker>
        ))}

        <Source id="routes" type="geojson" data={routeGeoJSON}>
          <Layer {...routeLayer} />
        </Source>
      </Map>

      <div className="absolute bottom-3 right-3 text-xs text-[var(--muted)] bg-[var(--surface)]/80 px-2 py-1">
        {t("carriersInFlight", { count: inFlight.length })}
      </div>
    </div>
  );
}
