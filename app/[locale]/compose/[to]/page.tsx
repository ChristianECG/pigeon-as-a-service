import { getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import ComposeForm from "@/components/ComposeForm";

type Props = { params: Promise<{ to: string; locale: string }> };

export default async function ComposePage({ params }: Props) {
  const { to, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("compose");

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
        <p className="text-xs text-[var(--muted)] font-mono mb-8">
          → {decodeURIComponent(to)}
        </p>
        <ComposeForm toCoords={decodeURIComponent(to)} />
      </div>
    </main>
  );
}
