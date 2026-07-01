import { Link } from "@/i18n/navigation";
import { PDF_TOOLS } from "@/lib/tools";
import type { PdfTool } from "@/types";

interface RelatedToolsProps {
  current: PdfTool;
  limit?: number;
}

export function RelatedTools({ current, limit = 6 }: RelatedToolsProps) {
  const related = PDF_TOOLS.filter(
    (t) => t.slug !== current.slug && t.category === current.category
  ).slice(0, limit);

  const extras =
    related.length < limit
      ? PDF_TOOLS.filter(
          (t) =>
            t.slug !== current.slug &&
            !related.find((r) => r.slug === t.slug)
        ).slice(0, limit - related.length)
      : [];

  const tools = [...related, ...extras];

  return (
    <section className="mt-20" aria-labelledby="related-tools-heading">
      <h2 id="related-tools-heading" className="text-2xl font-bold text-center mb-8">
        Related PDF Tools
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-xl border border-border/50 bg-card p-4 text-sm font-medium hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
          >
            {tool.name}
            <span className="block text-xs font-normal text-muted-foreground mt-1">
              {tool.shortDescription}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
