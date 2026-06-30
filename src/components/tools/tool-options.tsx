"use client";

import type { PdfTool, ProcessOptions } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VISUAL_OPTION_TOOLS } from "@/lib/tool-page-editor";

interface ToolOptionsProps {
  tool: PdfTool;
  options: ProcessOptions;
  onOptionsChange: (options: ProcessOptions) => void;
}

export function ToolOptions({ tool, options, onOptionsChange }: ToolOptionsProps) {
  const update = (patch: ProcessOptions) => {
    onOptionsChange({ ...options, ...patch });
  };

  const optionFields: Record<string, React.ReactNode> = {
    "split-pdf": (
      <div className="space-y-2">
        <Label htmlFor="pageRanges">Page ranges (e.g., 1-3, 5, 7-9)</Label>
        <Input
          id="pageRanges"
          placeholder="1-3, 5"
          value={(options.pageRanges as string) ?? ""}
          onChange={(e) => update({ pageRanges: e.target.value })}
        />
      </div>
    ),
    "rotate-pdf": (
      <div className="space-y-2">
        <Label htmlFor="angle">Rotation angle</Label>
        <select
          id="angle"
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
          value={String(options.angle ?? 90)}
          onChange={(e) => update({ angle: parseInt(e.target.value) })}
        >
          <option value="90">90° clockwise</option>
          <option value="180">180°</option>
          <option value="270">270° clockwise</option>
        </select>
      </div>
    ),
    "delete-pages": (
      <div className="space-y-2">
        <Label htmlFor="pages">Pages to delete (e.g., 1, 3, 5-7)</Label>
        <Input
          id="pages"
          placeholder="1, 3, 5-7"
          value={(options.pages as string) ?? ""}
          onChange={(e) => update({ pages: e.target.value })}
        />
      </div>
    ),
    "extract-pages": (
      <div className="space-y-2">
        <Label htmlFor="pageRanges">Pages to extract</Label>
        <Input
          id="pageRanges"
          placeholder="1-5"
          value={(options.pageRanges as string) ?? ""}
          onChange={(e) => update({ pageRanges: e.target.value })}
        />
      </div>
    ),
    "organize-pdf": (
      <div className="space-y-2">
        <Label htmlFor="pageOrder">Page order (e.g., 3,1,2,4)</Label>
        <Input
          id="pageOrder"
          placeholder="1, 2, 3, 4"
          value={(options.pageOrderStr as string) ?? ""}
          onChange={(e) => {
            const order = e.target.value
              .split(",")
              .map((n) => parseInt(n.trim(), 10))
              .filter((n) => !isNaN(n));
            update({ pageOrder: order, pageOrderStr: e.target.value });
          }}
        />
      </div>
    ),
    "watermark-pdf": (
      <div className="space-y-2">
        <Label htmlFor="text">Watermark text</Label>
        <Input
          id="text"
          placeholder="CONFIDENTIAL"
          value={(options.text as string) ?? ""}
          onChange={(e) => update({ text: e.target.value })}
        />
      </div>
    ),
    "protect-pdf": (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password (min 4 characters)"
            value={(options.password as string) ?? ""}
            onChange={(e) => update({ password: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={(options.confirmPassword as string) ?? ""}
            onChange={(e) => update({ confirmPassword: e.target.value })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Uses AES-256 encryption. Your password is processed locally in your browser and never uploaded.
        </p>
      </div>
    ),
    "unlock-pdf": (
      <div className="space-y-2">
        <Label htmlFor="password">PDF Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter current password"
          value={(options.password as string) ?? ""}
          onChange={(e) => update({ password: e.target.value })}
        />
      </div>
    ),
    "page-numbers": (
      <div className="space-y-2">
        <Label htmlFor="position">Page number position</Label>
        <select
          id="position"
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
          value={(options.position as string) ?? "bottom-center"}
          onChange={(e) => update({ position: e.target.value })}
        >
          <option value="bottom-center">Bottom center</option>
          <option value="bottom-left">Bottom left</option>
          <option value="bottom-right">Bottom right</option>
          <option value="top-center">Top center</option>
        </select>
      </div>
    ),
    "pdf-to-jpg": (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="format">Image format</Label>
          <select
            id="format"
            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
            value={(options.format as string) ?? "jpg"}
            onChange={(e) => update({ format: e.target.value })}
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quality">Quality (1-100)</Label>
          <Input
            id="quality"
            type="number"
            min={1}
            max={100}
            value={String(options.quality ?? 90)}
            onChange={(e) => update({ quality: parseInt(e.target.value) })}
          />
        </div>
      </div>
    ),
    "html-to-pdf": (
      <div className="space-y-2">
        <Label htmlFor="html">HTML content (paste or upload .html file)</Label>
        <textarea
          id="html"
          className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
          placeholder="<html><body><h1>Hello</h1></body></html>"
          value={(options.html as string) ?? ""}
          onChange={(e) => update({ html: e.target.value })}
        />
      </div>
    ),
  };

  const fields = optionFields[tool.slug];
  if (!fields || VISUAL_OPTION_TOOLS.has(tool.slug)) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-4 font-semibold">Options</h3>
      {fields}
    </div>
  );
}
