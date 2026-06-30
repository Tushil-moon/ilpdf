import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "organize"
  | "optimize"
  | "convert"
  | "edit"
  | "security";

export interface PdfTool {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  category: ToolCategory;
  color: string;
  multiFile: boolean;
  acceptedTypes: string[];
  maxFiles: number;
  keywords: string[];
  features: string[];
  howToSteps: string[];
  faq: { question: string; answer: string }[];
}

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error" | "cancelled";
  error?: string;
  resultUrl?: string;
  resultName?: string;
}

export interface ProcessOptions {
  [key: string]: unknown;
}

export interface JobResult {
  success: boolean;
  data?: Uint8Array;
  fileName?: string;
  mimeType?: string;
  error?: string;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage: string;
  noIndex?: boolean;
}

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  author: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface DashboardStats {
  totalFiles: number;
  totalDownloads: number;
  storageUsed: number;
  favoriteTools: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
