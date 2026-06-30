"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical";

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export function AdUnit({ slot, format = "auto", className, label = "Advertisement" }: AdUnitProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense blocked or not loaded
    }
  }, [clientId, slot]);

  if (!clientId || !slot) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground",
          format === "horizontal" ? "h-[90px]" : "min-h-[250px]",
          className
        )}
        aria-hidden="true"
      >
        <span>Ad space</span>
      </div>
    );
  }

  return (
    <div className={cn("ad-container", className)}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
