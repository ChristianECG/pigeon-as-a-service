"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Nav() {
  const t = useTranslations("nav");
  const [loftHref, setLoftHref] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("loft_id");
    if (!id) return;
    fetch(`/api/loft?id=${id}`)
      .then((r) => r.json())
      .then((loft) => {
        if (loft?.lat != null) {
          setLoftHref(`/loft/${loft.lat.toFixed(6)},${loft.lon.toFixed(6)}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)]">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-[var(--foreground)] font-bold text-sm hover:text-[var(--accent)] transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" width={24} height={24} className="rounded" />
        <span className="tracking-wide">Via Pluma</span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
        <Link href="/docs" className="hover:text-[var(--foreground)] transition-colors">
          {t("docs")}
        </Link>
        <Link href="/lofts" className="hover:text-[var(--foreground)] transition-colors">
          {t("lofts")}
        </Link>
        <Link
          href={loftHref ?? "/loft/new"}
          className="hover:text-[var(--foreground)] transition-colors"
        >
          {t("myLoft")}
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  );
}
