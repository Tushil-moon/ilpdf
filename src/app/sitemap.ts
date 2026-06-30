import type { MetadataRoute } from "next";
import { PDF_TOOLS } from "@/lib/tools";
import { BLOG_POSTS } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { getAppUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();
  const locales = routing.locales;

  const staticPages = ["", "/tools", "/blog", "/pricing", "/about", "/contact", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }

    for (const tool of PDF_TOOLS) {
      entries.push({
        url: `${baseUrl}${prefix}/tools/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
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
