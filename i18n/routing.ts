import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "lat"],
  defaultLocale: "en",
  localeDetection: false,
});
