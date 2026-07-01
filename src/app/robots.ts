import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/utils";
import { routing } from "@/i18n/routing";

const LOCALES = routing.locales;
const AUTH_PATHS = ["/login", "/signup", "/dashboard", "/admin"];

function localeDisallows(): string[] {
  const paths: string[] = ["/api/"];
  for (const locale of LOCALES) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    for (const path of AUTH_PATHS) {
      paths.push(`${prefix}${path}`);
      paths.push(`${prefix}${path}/`);
    }
  }
  paths.push("/dashboard/", "/admin/", "/login", "/signup");
  return paths;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: localeDisallows(),
      },
    ],
    sitemap: `${getAppUrl()}/sitemap.xml`,
    host: getAppUrl(),
  };
}
