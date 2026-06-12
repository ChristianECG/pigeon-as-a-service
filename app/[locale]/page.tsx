import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Nav from "@/components/Nav";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main className="flex-1 flex flex-col">
      <Nav />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Hero */}
        <div
          className="relative flex flex-col px-10 lg:px-16 pt-20 pb-16 lg:border-r border-[var(--border)] overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in srgb, var(--border) 80%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* fade grid towards the bottom only */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 60%, var(--background) 100%)",
            }}
          />

          <div className="relative space-y-8 max-w-sm">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">
              April 1, 1990 · Informational
            </p>

            <div className="space-y-3">
              <h1
                className="text-6xl font-bold text-[var(--foreground)] leading-none"
                style={{ letterSpacing: "-0.03em" }}
              >
                {t("title")}
              </h1>
              <p className="text-[var(--accent)] text-base font-medium leading-snug">
                {t("subtitle")}
              </p>
            </div>

            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t("description")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/loft/new"
                className="px-5 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded hover:opacity-90 transition-opacity"
              >
                {t("cta")}
              </Link>
              <Link
                href="/docs"
                className="px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] transition-colors text-sm rounded"
              >
                {t("history")}
              </Link>
            </div>
          </div>
        </div>

        {/* Timeline — same top padding as hero so content aligns */}
        <div className="flex flex-col px-10 lg:px-16 pt-20 pb-16">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-8">
            Timeline
          </p>
          <Timeline />
        </div>
      </div>
    </main>
  );
}

function Timeline() {
  const t = useTranslations("landing.timeline");
  const items = [
    { year: "1990", rfc: "RFC 1149", key: "rfc1149" },
    { year: "1999", rfc: "RFC 2549", key: "rfc2549" },
    { year: "2001", rfc: "Bergen",   key: "bergen"  },
    { year: "2011", rfc: "RFC 6214", key: "rfc6214" },
    { year: "2026", rfc: "DoAC",     key: "doac"    },
  ] as const;

  return (
    <div className="relative border-l border-[var(--border)] pl-8 space-y-7">
      {items.map((item, i) => (
        <div key={item.rfc} className="relative">
          <span
            className={`absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full border ${
              i === items.length - 1
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "bg-[var(--background)] border-[var(--border)]"
            }`}
          />
          <p className="text-xs text-[var(--muted)] mb-0.5">
            {item.year} ·{" "}
            <span className={i === items.length - 1 ? "text-[var(--accent)]" : "text-[var(--foreground)]"}>
              {item.rfc}
            </span>
          </p>
          <p className={`text-sm ${i === items.length - 1 ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]"}`}>
            {t(item.key)}
          </p>
        </div>
      ))}
    </div>
  );
}
