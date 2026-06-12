import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import Nav from "@/components/Nav";
import LoftMap from "@/components/LoftMap";

type Props = { params: Promise<{ coords: string; locale: string }> };

function parseCoords(raw: string): [number, number] | null {
  const parts = decodeURIComponent(raw).split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lon)) return null;
  return [lat, lon];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { coords } = await params;
  const parsed = parseCoords(coords);
  if (!parsed) return {};
  const [lat, lon] = parsed;
  const ogParams = new URLSearchParams({
    title: "Loft",
    subtitle: `AA ${lat.toFixed(6)} ${lon.toFixed(6)}`,
  });
  return {
    title: `Loft ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    openGraph: {
      images: [{ url: `/api/og?${ogParams}`, width: 1200, height: 630 }],
    },
  };
}

export default async function LoftPage({ params }: Props) {
  const { coords, locale } = await params;
  setRequestLocale(locale);
  const parsed = parseCoords(coords);
  if (!parsed) notFound();

  const [lat, lon] = parsed;
  const loft = db.lofts.findByCoords(lat, lon, 0.01);
  if (!loft) notFound();

  db.messages.settleArrived();
  const messages = db.messages.forLoft(loft.id);

  const relatedLoftIds = [...new Set(messages.flatMap((m) => [m.from_loft_id, m.to_loft_id]))];
  const relatedLofts = db.lofts.findByIds(relatedLoftIds);
  const loftCoords: Record<string, { lat: number; lon: number }> = { [loft.id]: { lat: loft.lat, lon: loft.lon } };
  relatedLofts.forEach((l) => { loftCoords[l.id] = { lat: l.lat, lon: l.lon }; });

  const t = await getTranslations("loft");
  const inbox = messages.filter((m) => m.to_loft_id === loft.id);
  const outbox = messages.filter((m) => m.from_loft_id === loft.id);

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--muted)] font-mono">
            AA {lat.toFixed(6)} {lon.toFixed(6)} {loft.heading} {loft.alt_band}
          </p>
          <h1 className="text-lg font-bold mt-1">{t("yourAddress")}</h1>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-mono break-all">
            {loft.id}
          </p>
        </div>
        <Link
          href="/compose"
          className="shrink-0 px-4 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
        >
          {t("compose")} →
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-[var(--border)]">
          <LoftMap loftId={loft.id} lat={lat} lon={lon} messages={messages} initialLoftCoords={loftCoords} />
        </div>

        <div className="flex flex-col divide-y divide-[var(--border)]">
          <MessageList
            title={t("inbox")}
            messages={inbox}
            loftId={loft.id}
            t={t}
          />
          <MessageList
            title={t("outbox")}
            messages={outbox}
            loftId={loft.id}
            t={t}
          />
        </div>
      </div>
    </main>
  );
}

type TFunc = Awaited<ReturnType<typeof getTranslations<"loft">>>;

type MessageListProps = {
  title: string;
  messages: ReturnType<typeof db.messages.forLoft>;
  loftId: string;
  t: TFunc;
};

function MessageList({ title, messages, t }: MessageListProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <p className="px-6 py-3 text-xs text-[var(--muted)] uppercase tracking-widest border-b border-[var(--border)]">
        {title}
      </p>
      {messages.length === 0 ? (
        <p className="px-6 py-4 text-sm text-[var(--muted)]">{t("noMessages")}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] overflow-y-auto">
          {messages.map((msg) => (
            <li key={msg.id}>
              <Link
                href={`/pigeon/${msg.id}`}
                className="flex flex-col gap-1 px-6 py-4 hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono ${
                      msg.status === "nxpigeon"
                        ? "text-red-500"
                        : msg.status === "delivered"
                        ? "text-green-500"
                        : "text-[var(--accent)]"
                    }`}
                  >
                    {t(`status.${msg.status}`)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {Math.round(msg.distance_km)} km
                  </span>
                </div>
                <p className="text-sm text-[var(--foreground)] truncate">
                  {msg.content}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {t("eta")}: {new Date(msg.eta_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
