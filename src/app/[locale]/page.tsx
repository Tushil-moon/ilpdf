import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { ToolsGridSection } from "@/components/home/tools-grid-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FaqSection } from "@/components/home/faq-section";
import { BLOG_POSTS } from "@/lib/blog";
import { HOMEPAGE_FAQ } from "@/lib/tools";
import { buildMetadata, buildHomeSeo, JsonLd, organizationSchema, websiteSchema, faqSchema } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = buildMetadata(buildHomeSeo());

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), faqSchema(HOMEPAGE_FAQ)]} />
      <HeroSection />
      <ToolsGridSection />
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection items={HOMEPAGE_FAQ} />

      <section className="py-24 bg-muted/30" aria-labelledby="blog-heading">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 id="blog-heading" className="text-3xl font-bold tracking-tight">
              Latest from our blog
            </h2>
            <Link
              href="/blog"
              className="flex items-center gap-1 text-sm font-medium text-red-500 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {latestPosts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-red-500/30">PDF</span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatDate(post.publishedAt)} • {post.category}
                  </p>
                  <h3 className="font-semibold group-hover:text-red-500 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
