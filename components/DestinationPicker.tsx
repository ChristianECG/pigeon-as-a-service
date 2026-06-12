"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function DestinationPicker() {
  const t = useTranslations("compose");
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function parseAndNavigate() {
    setError(null);
    const parts = input.trim().split(/[\s,]+/);
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError(t("invalidCoords"));
      return;
    }

    router.push(`/compose/${lat.toFixed(6)},${lon.toFixed(6)}`);
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs text-[var(--muted)]">{t("destinationLabel")}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && parseAndNavigate()}
          placeholder="19.432608, -99.133209"
          className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--accent)]"
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={parseAndNavigate}
        className="w-full px-6 py-3 bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
      >
        {t("continue")}
      </button>

      <p className="text-xs text-[var(--muted)] leading-relaxed">
        {t("shareHint")}{" "}
        <span className="font-mono text-[var(--foreground)]">
          /loft/19.432608,-99.133209
        </span>
      </p>
    </div>
  );
}
