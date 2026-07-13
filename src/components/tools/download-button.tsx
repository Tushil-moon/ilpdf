"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  url: string;
  fileName: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function DownloadButton({ url, fileName, size = "lg", className }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      if (url.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const response = await fetch(url, { credentials: "same-origin" });

      if (!response.ok) {
        let message = "Download failed";
        try {
          const json = await response.json();
          message = json.error ?? message;
        } catch {
          message = `Download failed (${response.status})`;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Button size={size} onClick={handleDownload} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Download Result
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
