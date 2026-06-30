import type { Metadata } from "next";
import type { BreadcrumbItem, SeoMetadata } from "@/types";
import { getAppUrl } from "@/lib/utils";
import type { PdfTool } from "@/types";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ILPDF";
const DEFAULT_OG_IMAGE = "/og/default.png";

export function buildMetadata(seo: SeoMetadata): Metadata {
  const url = seo.canonical.startsWith("http")
    ? seo.canonical
    : `${getAppUrl()}${seo.canonical}`;

  return {
    metadataBase: new URL(getAppUrl()),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: APP_NAME,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.title }],
      locale: "en_US",
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
    title: `${tool.name} - Free Online PDF Tool | ${APP_NAME}`,
    description: tool.description,
    keywords: tool.keywords,
    canonical: `/tools/${tool.slug}`,
    ogImage: `${getAppUrl()}/og/tools/${tool.slug}.png`,
  };
}

export function buildHomeSeo(): SeoMetadata {
  return {
    title: `${APP_NAME} - Free Online PDF Tools | Merge, Split, Compress PDF`,
    description:
      "Free online PDF tools to merge, split, compress, convert, rotate, unlock, and edit PDF files. Fast, secure, and easy to use. No registration required.",
    keywords: [
      "pdf tools",
      "merge pdf",
      "split pdf",
      "compress pdf",
      "pdf converter",
      "free pdf editor",
      "online pdf",
    ],
    canonical: "/",
    ogImage: `${getAppUrl()}${DEFAULT_OG_IMAGE}`,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: getAppUrl(),
    logo: `${getAppUrl()}/logo.png`,
    sameAs: [
      "https://twitter.com/ilpdf",
      "https://github.com/ilpdf",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@ilpdf.com",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: getAppUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getAppUrl()}/search?q={search_term_string}`,
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
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `${getAppUrl()}/tools/${tool.slug}`,
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
    image: post.coverImage ?? `${getAppUrl()}/og/blog/default.png`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${getAppUrl()}/logo.png`,
      },
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
