import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://loft.christianecg.com"),
  title: {
    default: "Loft",
    template: "%s · Loft",
  },
  description:
    "A Standard for the Transmission of IP Datagrams on Avian Carriers. Reference implementation.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    siteName: "Loft",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Loft" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es" | "lat")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={fraunces.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            {children}
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
