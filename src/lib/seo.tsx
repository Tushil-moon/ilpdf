import type { Metadata } from "next";
import type { BreadcrumbItem, SeoMetadata } from "@/types";
import { getAppUrl } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import type { PdfTool } from "@/types";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ILPDF";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ja: "ja_JP",
};

export function buildLocaleAlternates(path: string): Record<string, string> {
  const base = getAppUrl();
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    languages[locale] = `${base}${prefix}${path || "/"}`;
  }

  languages["x-default"] = `${base}${path || "/"}`;
  return languages;
}

export function buildMetadata(seo: SeoMetadata, locale = "en"): Metadata {
  const path = seo.canonical.startsWith("http")
    ? new URL(seo.canonical).pathname
    : seo.canonical;
  const url = `${getAppUrl()}${path === "/" ? "" : path}`.replace(/([^:]\/)\/+/g, "$1");
  const ogLocale = OG_LOCALE_MAP[locale] ?? "en_US";
  const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

  return {
    metadataBase: new URL(getAppUrl()),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: url,
      languages: buildLocaleAlternates(path),
    },
    robots: seo.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    verification: gscVerification ? { google: gscVerification } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: APP_NAME,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.title }],
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

export function buildToolSeo(tool: PdfTool): SeoMetadata {
  return {
    title: `${tool.name} Online Free — ${tool.shortDescription} | ${APP_NAME}`,
    description: `${tool.description} Use our free ${tool.name.toLowerCase()} tool online. No signup required. Files deleted after processing.`,
    keywords: tool.keywords,
    canonical: `/tools/${tool.slug}`,
    ogImage: `${getAppUrl()}/tools/${tool.slug}/opengraph-image`,
  };
}

export function buildHomeSeo(): SeoMetadata {
  return {
    title: `${APP_NAME} — Free Online PDF Tools | Merge, Split, Compress & Convert PDF`,
    description:
      "Free online PDF tools to merge, split, compress, convert, rotate, unlock, protect, and edit PDF files. Fast, secure, browser-based processing. No watermarks.",
    keywords: [
      "pdf tools",
      "merge pdf",
      "split pdf",
      "compress pdf",
      "pdf converter",
      "free pdf editor",
      "online pdf",
      "pdf to word",
      "protect pdf",
      "ilovepdf alternative",
    ],
    canonical: "/",
    ogImage: `${getAppUrl()}/opengraph-image`,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: getAppUrl(),
    logo: `${getAppUrl()}/logo.svg`,
    description:
      "Free online PDF tools for merging, splitting, compressing, converting, and editing PDF documents.",
    sameAs: ["https://twitter.com/ilpdf", "https://github.com/ilpdf"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@ilpdf.com",
      url: `${getAppUrl()}/contact`,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: getAppUrl(),
    description: "Free online PDF tools — merge, split, compress, convert, and edit PDFs in your browser.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getAppUrl()}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationSchema(tool: PdfTool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `${getAppUrl()}/tools/${tool.slug}`,
  };
}

export function howToSchema(tool: PdfTool) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to ${tool.name.toLowerCase()}`,
    description: tool.description,
    step: tool.howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
    })),
    tool: {
      "@type": "HowToTool",
      name: "Web browser",
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${getAppUrl()}${item.href}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author: string;
  coverImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.coverImage ?? `${getAppUrl()}/og/default.png`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      logo: { "@type": "ImageObject", url: `${getAppUrl()}/logo.svg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${getAppUrl()}/blog/${post.slug}`,
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
