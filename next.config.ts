import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module, must not be bundled by webpack
  serverExternalPackages: ["better-sqlite3"],
};

export default withNextIntl(nextConfig);
