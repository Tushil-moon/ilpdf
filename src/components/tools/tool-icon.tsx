import {
  Combine,
  SplitSquareHorizontal,
  Minimize2,
  FileText,
  FileType,
  Sheet,
  Presentation,
  Image,
  ImageDown,
  RotateCw,
  Unlock,
  Lock,
  Droplets,
  Hash,
  Trash2,
  LayoutGrid,
  FileOutput,
  Wrench,
  ScanText,
  Code,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Combine,
  SplitSquareHorizontal,
  Minimize2,
  FileText,
  FileType,
  Sheet,
  Presentation,
  Image,
  ImageDown,
  RotateCw,
  Unlock,
  Lock,
  Droplets,
  Hash,
  Trash2,
  LayoutGrid,
  FileOutput,
  Wrench,
  ScanText,
  Code,
};

interface ToolIconProps {
  name: string;
  className?: string;
}

export function ToolIcon({ name, className }: ToolIconProps) {
  const Icon = ICON_MAP[name] ?? FileText;
  return <Icon className={cn(className)} aria-hidden="true" />;
}
