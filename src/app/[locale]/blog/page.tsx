import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS } from "@/lib/blog";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Blog - PDF Tips, Tutorials & Guides | ILPDF",
  description:
    "Learn how to work with PDF files. Tips, tutorials, and guides for merging, compressing, converting, and securing PDFs.",
  keywords: ["pdf blog", "pdf tutorials", "pdf guides", "how to pdf"],
  canonical: "/blog",
  ogImage: "/og/blog/default.png",
});

export const revalidate = 3600;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Blog</h1>
      <p className="text-muted-foreground mb-12 max-w-2xl">
        Tips, tutorials, and guides for working with PDF files.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="group rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="h-48 bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-red-500/30">PDF</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
              <h2 className="text-lg font-semibold group-hover:text-red-500 transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
