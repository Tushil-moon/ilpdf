import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PDF_TOOLS } from "@/lib/tools";
import { ToolCard } from "@/components/tools/tool-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All PDF Tools - Free Online PDF Utilities | ILPDF",
  description:
    "Browse all free online PDF tools. Merge, split, compress, convert, edit, and secure your PDF files.",
  keywords: ["pdf tools", "online pdf", "free pdf utilities"],
  canonical: "/tools",
  ogImage: "/og/default.png",
});

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ name: "All Tools", href: "/tools" }]} />
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
        All PDF Tools
      </h1>
      <p className="text-muted-foreground mb-12 max-w-2xl">
        Choose from our complete collection of free online PDF tools.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {PDF_TOOLS.map((tool, index) => (
          <ToolCard key={tool.slug} tool={tool} index={index} />
        ))}
      </div>
    </div>
  );
}
