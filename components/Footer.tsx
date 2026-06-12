import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted)]">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[var(--muted)]/60">{t("dataLabel")}</span>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Open-Meteo
          </a>
          <a
            href="https://carto.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            CARTO
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href="https://datatracker.ietf.org/doc/draft-cruzgonzalez-ipoac-dns/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--muted)]/50 hover:text-[var(--muted)] transition-colors"
          >
            {t("draft")}
          </a>
          <a
            href="https://christianecg.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            christianecg.com
          </a>
          <a
            href="https://avelor.es/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            avelor.es
          </a>
        </div>
      </div>
    </footer>
  );
}
