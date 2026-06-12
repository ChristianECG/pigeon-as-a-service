import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import Nav from "@/components/Nav";
import PigeonTracker from "@/components/PigeonTracker";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const msg = db.messages.findById(id);
  if (!msg) return {};
  const from = db.lofts.findById(msg.from_loft_id);
  const to = db.lofts.findById(msg.to_loft_id);
  if (!from || !to) return {};
  const ogParams = new URLSearchParams({
    title: "Carrier in flight",
    subtitle: `${from.lat.toFixed(4)}, ${from.lon.toFixed(4)} → ${to.lat.toFixed(4)}, ${to.lon.toFixed(4)}`,
  });
  return {
    title: "Carrier in flight",
    openGraph: {
      images: [{ url: `/api/og?${ogParams}`, width: 1200, height: 630 }],
    },
  };
}

export default async function PigeonPage({ params }: Props) {
  const { id } = await params;
  db.messages.settleArrived();

  const msg = db.messages.findById(id);
  if (!msg) notFound();

  const fromLoft = db.lofts.findById(msg.from_loft_id)!;
  const toLoft = db.lofts.findById(msg.to_loft_id)!;

  const t = await getTranslations("pigeon");

  return (
    <main className="flex-1 flex flex-col">
      <Nav />

      <div className="px-6 py-3 border-b border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label={t("from")} value={`${fromLoft.lat.toFixed(4)}, ${fromLoft.lon.toFixed(4)}`} />
        <Stat label={t("to")} value={`${toLoft.lat.toFixed(4)}, ${toLoft.lon.toFixed(4)}`} />
        <Stat label={t("dispatched")} value={new Date(msg.dispatched_at).toLocaleString()} />
        <Stat label={t("eta")} value={new Date(msg.eta_at).toLocaleString()} />
      </div>

      <PigeonTracker
        messageId={id}
        fromLat={fromLoft.lat}
        fromLon={fromLoft.lon}
        toLat={toLoft.lat}
        toLon={toLoft.lon}
        initialStatus={msg.status}
        dispatchedAt={msg.dispatched_at}
        etaAt={msg.eta_at}
        content={msg.content}
        distanceKm={msg.distance_km}
        windMs={msg.wind_ms}
        failureReason={msg.failure_reason}
      />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="text-sm font-mono text-[var(--foreground)] truncate">{value}</p>
    </div>
  );
}
