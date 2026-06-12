"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Props = { toCoords: string };

export default function ComposeForm({ toCoords }: Props) {
  const t = useTranslations("compose");
  const router = useRouter();

  const [fromLoftId, setFromLoftId] = useState<string | null>(null);
  const [toLoftId, setToLoftId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFromLoftId(localStorage.getItem("loft_id"));
  }, []);

  useEffect(() => {
    const [lat, lon] = toCoords.split(",").map(Number);
    if (isNaN(lat) || isNaN(lon)) return;
    fetch(`/api/loft?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then((loft) => {
        if (loft.id) setToLoftId(loft.id);
        else setError(t("loftNotFound"));
      })
      .catch(() => setError(t("loftNotFound")));
  }, [toCoords, t]);

  async function send() {
    if (!fromLoftId || !toLoftId || !content.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_loft_id: fromLoftId, to_loft_id: toLoftId, content }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error");
      setSending(false);
      return;
    }
    const etaDate = new Date(data.message.eta_at).toLocaleString();
    setEta(etaDate);
    setTimeout(() => {
      router.push(`/pigeon/${data.message.id}`);
    }, 2000);
  }

  if (!fromLoftId) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {t("noLoft")}{" "}
        <a href="/loft/new" className="text-[var(--accent)] underline">
          {t("noLoftCta")}
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("messagePlaceholder")}
        rows={8}
        maxLength={2000}
        className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] resize-none focus:outline-none focus:border-[var(--accent)] font-mono"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted)]">
          {content.length} / 2000
        </span>
        <span className="text-xs text-[var(--muted)]">
          {toLoftId ? t("destinationFound") : t("resolvingDestination")}
        </span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {eta && (
        <p className="text-xs text-[var(--accent)]">
          {t("warning", { eta })}
        </p>
      )}

      <button
        onClick={send}
        disabled={sending || !toLoftId || !content.trim()}
        className="w-full px-6 py-3 bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {sending ? t("dispatching") : t("send")}
      </button>
    </div>
  );
}
