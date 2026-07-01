import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { BreadcrumbItem } from "@/types";

interface LegalPageProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}

export function LegalPage({ title, breadcrumbs, children }: LegalPageProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:pt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-red-600 [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
