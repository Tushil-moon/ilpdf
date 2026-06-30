# SEO Guide

## Overview

ILPDF implements enterprise-level SEO with dynamic metadata, structured data, and optimized URLs.

## Metadata API

Every page uses the Metadata API with:

- Unique `title` and `description`
- `keywords` array
- Canonical URLs
- Open Graph tags
- Twitter Cards

### Tool Pages

Auto-generated via `generateMetadata` in `src/app/[locale]/tools/[slug]/page.tsx`:

```
/tools/merge-pdf
/tools/split-pdf
/tools/compress-pdf
```

### Blog Posts

```
/blog/how-to-compress-pdf
/blog/how-to-merge-pdf
```

## Structured Data (JSON-LD)

Implemented schemas in `src/lib/seo.tsx`:

| Schema | Used On |
|--------|---------|
| Organization | Homepage |
| WebSite | Homepage |
| SoftwareApplication | Tool pages |
| BreadcrumbList | Tool & blog pages |
| FAQPage | Homepage & tool pages |
| Article | Blog posts |

## Sitemap

Auto-generated at `/sitemap.xml` via `src/app/sitemap.ts`:

- All static pages
- All tool pages (20+)
- All blog posts
- All locale variants

## Robots.txt

Generated at `/robots.txt` via `src/app/robots.ts`:

- Allows crawling of public pages
- Blocks `/api/`, `/dashboard/`, `/admin/`, auth pages

## Performance for SEO

- **ISR** - Tool pages revalidate every 24 hours
- **Static Generation** - All tool and blog pages pre-rendered
- **Image Optimization** - next/image with AVIF/WebP
- **Font Optimization** - next/font with display: swap
- **Code Splitting** - Dynamic imports for heavy components

## Adding SEO to New Pages

```typescript
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page Title | ILPDF",
  description: "Page description under 160 characters.",
  keywords: ["keyword1", "keyword2"],
  canonical: "/your-page",
  ogImage: "/og/your-page.png",
});
```

## OG Images

Place OG images in `public/og/`:

```
public/og/
├── default.png          # 1200x630
├── tools/
│   ├── merge-pdf.png
│   └── split-pdf.png
└── blog/
    └── default.png
```

## Google Search Console

1. Add `NEXT_PUBLIC_GSC_VERIFICATION` to environment
2. Verify ownership in Search Console
3. Submit sitemap: `https://your-domain.com/sitemap.xml

## Analytics

Configure in `.env`:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
NEXT_PUBLIC_CLARITY_ID=your-clarity-id
```

## Best Practices Checklist

- [ ] Unique title per page (50-60 chars)
- [ ] Meta description per page (150-160 chars)
- [ ] Canonical URL on every page
- [ ] OG image for every page (1200x630)
- [ ] Structured data where applicable
- [ ] Semantic HTML (h1, nav, main, article, footer)
- [ ] Alt text on images
- [ ] Internal linking between tools and blog
- [ ] Mobile-responsive design
- [ ] Core Web Vitals optimization
