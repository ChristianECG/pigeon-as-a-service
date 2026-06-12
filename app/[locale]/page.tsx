import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Nav from "@/components/Nav";
import GlobeHero from "@/components/GlobeHero";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <Nav />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* — Text — primary content */}
        <div className="flex flex-col justify-center px-14 pb-14 pt-10 lg:w-[58%] lg:border-r border-[var(--border)] gap-7">

          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-[0.18em]">
              April 1, 1990 · Experimental
            </p>
            <p className="text-[10px] font-mono text-[var(--muted)]/50 uppercase tracking-[0.18em]">
              RFC 1149
            </p>
          </div>

          <h1 className="text-2xl font-bold leading-tight text-[var(--foreground)] max-w-xl tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            {t("subtitle")}
          </h1>

          <p className="text-base text-[var(--muted)] leading-relaxed max-w-md">
            {t("description")}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/loft/new"
              className="px-5 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {t("cta")}
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              {t("history")} →
            </Link>
          </div>

          <div className="border-t border-[var(--border)] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <p className="text-[9px] font-mono text-[var(--muted)]/50 uppercase tracking-widest">
                Carriers in flight
              </p>
            </div>
            {(() => {
              const routes = [
                { from: "BRG", to: "MEX", km: "9,432", eta: "63 h" },
                { from: "LAX", to: "BRG", km: "8,326", eta: "56 h" },
                { from: "EZE", to: "LIS", km: "9,596", eta: "64 h" },
                { from: "MDE", to: "ANC", km: "8,586", eta: "57 h" },
                { from: "SCL", to: "LIM", km: "2,469", eta: "17 h" },
                { from: "DKR", to: "REC", km: "3,179", eta: "21 h" },
                { from: "HAV", to: "MIA", km: "369",   eta: "3 h"  },
                { from: "LAX", to: "PDL", km: "7,971", eta: "53 h" },
                { from: "PDL", to: "LIS", km: "1,447", eta: "10 h" },
              ];
              return (
                <div className="flex gap-3">
                  <div
                    className="relative overflow-hidden flex-1"
                    style={{
                      height: "150px",
                      maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                    }}
                  >
                    <div className="animate-ticker flex flex-col gap-1.5">
                      {[...routes, ...routes].map(({ from, to, km, eta }, i) => (
                        <div
                          key={i}
                          className="grid items-center h-[20px] font-mono text-[12px]"
                          style={{ gridTemplateColumns: "2rem 1.25rem 2rem 0.5rem 5rem 0.5rem 3.5rem" }}
                        >
                          <span className="text-[var(--foreground)] tracking-wider">{from}</span>
                          <span className="text-[var(--muted)]/30 text-center">→</span>
                          <span className="text-[var(--foreground)] tracking-wider">{to}</span>
                          <span className="text-[var(--border)] text-center">·</span>
                          <span className="text-[var(--muted)]/60 tabular-nums text-right">{km} km</span>
                          <span className="text-[var(--border)] text-center">·</span>
                          <span className="text-[var(--muted)]/40 tabular-nums text-right">≈ {eta}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-l border-[var(--border)] pl-4 py-1 flex-1">
                    <p className="text-[9px] font-mono text-[var(--muted)]/40 uppercase tracking-widest">
                      Bergen, Norway · 2001
                    </p>
                    <div className="flex flex-col gap-2.5 mt-3">
                      {[
                        { value: "9",      label: "packets sent"  },
                        { value: "4",      label: "received"      },
                        { value: "55%",    label: "packet loss"   },
                        { value: "~5 ks",  label: "avg rtt"       },
                        { value: "ADSL",   label: "beaten"        },
                      ].map(({ value, label }) => (
                        <div key={label} className="flex items-baseline gap-2.5">
                          <span className="text-[15px] font-mono leading-none text-[var(--foreground)] w-25 shrink-0 text-right tabular-nums">{value}</span>
                          <span className="text-[9px] font-mono text-[var(--muted)]/40 uppercase tracking-widest">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* — Globe — complemento visual */}
        <div className="flex-1 flex items-center justify-center p-8 relative min-h-[300px] lg:min-h-0">
          {/* Star field — fills entire panel */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 600 800"
          >
            <defs>
              <radialGradient id="panel-nebula-a" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2d1b69" stopOpacity="0.12" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="panel-nebula-b" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f2d4a" stopOpacity="0.10" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx={80}  cy={130} rx={180} ry={160} fill="url(#panel-nebula-a)" />
            <ellipse cx={520} cy={670} rx={160} ry={180} fill="url(#panel-nebula-b)" />
            {(() => {
              let s = 97;
              const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
              return Array.from({ length: 320 }, (_, i) => (
                <circle
                  key={i}
                  cx={rng() * 620 - 10}
                  cy={rng() * 820 - 10}
                  r={0.2 + rng() * 0.9}
                  fill="white"
                  opacity={0.05 + rng() * 0.28}
                />
              ));
            })()}
          </svg>

          <div className="w-full h-full max-w-[340px] max-h-[340px] relative">
            <GlobeHero />
          </div>
        </div>

      </div>
    </main>
  );
}
