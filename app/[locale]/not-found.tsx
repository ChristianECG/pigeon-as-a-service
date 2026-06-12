import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import Nav from "@/components/Nav";
import { routing } from "@/i18n/routing";

export default async function NotFound() {
  const headersList = await headers();
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale;

  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <p className="text-8xl font-bold text-[var(--border)] select-none">
          {t("code")}
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-500 font-mono">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-sm leading-relaxed">
            {t("description")}
          </p>
        </div>
        <p className="text-xs text-[var(--muted)] font-mono border border-[var(--border)] px-3 py-1.5">
          {t("section")}
        </p>
        <Link
          href="/"
          className="px-6 py-3 border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] transition-colors"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  );
}
