import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import GlobalLoftMap from "@/components/GlobalLoftMap";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Loft Directory",
};

export default async function LoftsPage() {
  const t = await getTranslations("lofts");
  const lofts = db.lofts.all();

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <p className="text-xs text-[var(--muted)] mt-1">
          {lofts.length} {t("loftsDiscovered")}
        </p>
      </div>
      <div className="flex-1 flex">
        <GlobalLoftMap lofts={lofts} />
      </div>
    </main>
  );
}
