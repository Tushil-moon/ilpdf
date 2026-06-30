"use client";

import { getToolIcon } from "@/lib/icons";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { PdfTool } from "@/types";

interface ToolCardProps {
  tool: PdfTool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const IconComponent = getToolIcon(tool.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className="group block"
        prefetch
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-1">
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
              tool.color
            )}
          >
            <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="font-semibold group-hover:text-red-500 transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {tool.shortDescription}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
