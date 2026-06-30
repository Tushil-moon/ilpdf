import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "@/lib/blog";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { buildMetadata, JsonLd, articleSchema, breadcrumbSchema } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: `${post.title} | ILPDF Blog`,
    description: post.excerpt,
    keywords: post.keywords ?? post.tags,
    canonical: `/blog/${post.slug}`,
    ogImage: post.coverImage ?? "/og/blog/default.png",
  });
}

export const revalidate = 86400;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);
  const breadcrumbs = [
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            slug: post.slug,
            publishedAt: post.publishedAt,
            author: post.author,
            coverImage: post.coverImage,
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <article className="container mx-auto max-w-3xl px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.category}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-4">
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.match(/^\d+\.\s/)) {
              return (
                <p key={i} className="ml-4 my-2">
                  {line}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <p key={i} className="ml-4 my-1 text-muted-foreground">
                  • {line.replace("- ", "")}
                </p>
              );
            }
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="my-3 text-muted-foreground leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold mb-6">
              Related Articles
            </h2>
            <div className="grid gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="rounded-xl border border-border/50 p-4 hover:border-red-500/30 transition-colors"
                >
                  <h3 className="font-semibold hover:text-red-500">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
