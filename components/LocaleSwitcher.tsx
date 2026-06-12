"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  es: "ES",
  lat: "LAT",
};

export default function LocaleSwitcher() {
  const locale = useLocale();

  function switchLocale(next: string) {
    if (next === locale) return;
    const current = window.location.pathname;
    // Strip current locale prefix and replace with next
    const withoutLocale = current.replace(new RegExp(`^/${locale}(/|$)`), "/");
    window.location.href = `/${next}${withoutLocale === "/" ? "" : withoutLocale}`;
  }

  return (
    <div className="flex gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-0.5 text-xs transition-colors ${
            l === locale
              ? "text-[var(--accent)] font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
