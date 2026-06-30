import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getToolBySlug, PDF_TOOLS } from "@/lib/tools";
import {
  buildMetadata,
  buildToolSeo,
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  softwareApplicationSchema,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { FaqSection } from "@/components/home/faq-section";
import { getToolIcon } from "@/lib/icons";

export async function generateStaticParams() {
  return PDF_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return buildMetadata(buildToolSeo(tool));
}

export const revalidate = 86400;

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const IconComponent = getToolIcon(tool.icon);

  const breadcrumbs = [
    { name: "Tools", href: "/tools" },
    { name: tool.name, href: `/tools/${tool.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          softwareApplicationSchema(tool),
          faqSchema(tool.faq),
        ]}
      />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mb-10 text-center">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${tool.color}`}
          >
            <IconComponent className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {tool.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {tool.description}
          </p>
        </div>

        <ToolWorkspace tool={tool} />

        <section className="mt-20" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold text-center mb-8">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto">
            {tool.features.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-border/50 bg-card p-4 text-center text-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl mx-auto" aria-labelledby="howto-heading">
          <h2 id="howto-heading" className="text-2xl font-bold text-center mb-8">
            How to {tool.name.toLowerCase()}
          </h2>
          <ol className="space-y-4">
            {tool.howToSteps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-sm font-bold text-red-500">
                  {i + 1}
                </span>
                <p className="pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-16">
          <FaqSection title={`${tool.name} FAQ`} items={tool.faq} />
        </div>
      </div>
    </>
  );
}
