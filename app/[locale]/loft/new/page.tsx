import { useTranslations } from "next-intl";
import Nav from "@/components/Nav";
import LoftSetup from "@/components/LoftSetup";

export default function LoftNewPage() {
  const t = useTranslations("geolocation");

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <p className="text-xs text-[var(--muted)] tracking-widest uppercase">
          RFC 1149 · Loft Registration
        </p>
        <h1 className="text-xl font-bold text-[var(--foreground)] mt-1">
          {t("title")}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-md">
          {t("description")}
        </p>
      </div>
      <LoftSetup />
    </main>
  );
}
