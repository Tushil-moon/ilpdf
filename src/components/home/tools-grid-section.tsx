import { PDF_TOOLS, TOOL_CATEGORIES } from "@/lib/tools";
import { ToolCard } from "@/components/tools/tool-card";

export function ToolsGridSection() {
  return (
    <section className="py-24" aria-labelledby="tools-heading" id="tools">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="tools-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            All PDF Tools
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Everything you need to work with PDFs — free and online
          </p>
        </div>

        {TOOL_CATEGORIES.map((category) => {
          const tools = PDF_TOOLS.filter((t) => t.category === category.id);
          if (tools.length === 0) return null;

          return (
            <div key={category.id} className="mt-16">
              <h3 className={`mb-6 text-lg font-semibold ${category.color}`}>
                {category.name}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tools.map((tool, index) => (
                  <ToolCard key={tool.slug} tool={tool} index={index} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
