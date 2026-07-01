import type { MetadataRoute } from "next";
import { PDF_TOOLS } from "@/lib/tools";
import { BLOG_POSTS } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/utils";

const STATIC_PAGES = [
  "",
  "/tools",
  "/blog",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

const SITE_LAUNCH = new Date("2026-06-01");

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${baseUrl}${prefix}${page}`,
        lastModified: SITE_LAUNCH,
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : page === "/tools" ? 0.95 : 0.8,
      });
    }

    for (const tool of PDF_TOOLS) {
      entries.push({
        url: `${baseUrl}${prefix}/tools/${tool.slug}`,
        lastModified: SITE_LAUNCH,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    for (const post of BLOG_POSTS) {
      entries.push({
        url: `${baseUrl}${prefix}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
