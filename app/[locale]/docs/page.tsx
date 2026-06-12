import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "RFCs",
  openGraph: {
    images: [{
      url: "/api/og?title=The+RFC+Family&subtitle=Three+decades+of+avian+infrastructure+standards",
      width: 1200,
      height: 630,
    }],
  },
};

export default function DocsPage() {
  const t = useTranslations("docs");

  const rfcs = [
    {
      id: "rfc1149",
      year: 1990,
      number: "RFC 1149",
      author: "D. Waitzman",
      url: "https://www.rfc-editor.org/info/rfc1149",
    },
    {
      id: "rfc2549",
      year: 1999,
      number: "RFC 2549",
      author: "D. Waitzman",
      url: "https://www.rfc-editor.org/info/rfc2549",
    },
    {
      id: "bergen",
      year: 2001,
      number: t("rfcs.bergen.number"),
      author: "BLUG (Bergen Linux User Group)",
      url: "https://www.blug.linux.no/rfc1149/",
    },
    {
      id: "rfc6214",
      year: 2011,
      number: "RFC 6214",
      author: "B. Carpenter, R. Hinden",
      url: "https://www.rfc-editor.org/info/rfc6214",
    },
    {
      id: "doac",
      year: 2026,
      number: "DoAC",
      author: "C. E. Cruz González",
      url: "https://datatracker.ietf.org/doc/draft-cruzgonzalez-ipoac-dns/",
      draft: "draft-cruzgonzalez-ipoac-dns",
    },
  ] as const;

  return (
    <main className="flex-1 flex flex-col">
      <Nav />

      <div className="max-w-2xl mx-auto px-8 lg:px-6 py-16 w-full">
        <header className="mb-14">
          <h1 className="text-4xl font-bold mb-3 leading-tight">{t("title")}</h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{t("subtitle")}</p>
        </header>

        <div className="space-y-10">
          {rfcs.map((rfc) => (
            <article
              key={rfc.id}
              className={`border-l-2 pl-7 py-1 ${
                rfc.id === "doac"
                  ? "border-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-[var(--muted)] tabular-nums">{rfc.year}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 ${
                    rfc.id === "doac"
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "bg-[var(--surface-2)] text-[var(--muted)]"
                  }`}
                >
                  {t(`rfcs.${rfc.id}.status`)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--foreground)] leading-none mb-1">
                {rfc.number}
              </h2>
              <p className="text-sm text-[var(--muted)] mb-1">
                {t(`rfcs.${rfc.id}.title`)}
              </p>
              <p className="text-xs text-[var(--muted)]/60 mb-4">{rfc.author}</p>
              <p className="text-sm text-[var(--foreground)]/80 leading-relaxed mb-4">
                {t(`rfcs.${rfc.id}.summary`)}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {"url" in rfc && (
                  <a
                    href={rfc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    {t("readDraft")} →
                  </a>
                )}
                {"draft" in rfc && (
                  <span className="text-xs text-[var(--muted)]/50 font-mono">
                    {rfc.draft}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
