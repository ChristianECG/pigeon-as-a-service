import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Nav from "@/components/Nav";
import DestinationPicker from "@/components/DestinationPicker";

export const metadata: Metadata = {
  title: "Compose",
  openGraph: {
    images: [{
      url: "/api/og?title=Dispatch+a+Carrier&subtitle=Compose+a+datagram+for+avian+transmission",
      width: 1200,
      height: 630,
    }],
  },
};

export default async function ComposeLandingPage() {
  const t = await getTranslations("compose");

  return (
    <main className="flex-1 flex flex-col">
      <Nav />
      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
        <p className="text-xs text-[var(--muted)] mb-8">{t("subtitle")}</p>
        <DestinationPicker />
      </div>
    </main>
  );
}
