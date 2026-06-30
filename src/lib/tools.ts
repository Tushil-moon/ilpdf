import type { PdfTool } from "@/types";

const baseFaq = [
  {
    question: "Is this tool free to use?",
    answer:
      "Yes, all our PDF tools are completely free with no hidden charges. No registration required for basic use.",
  },
  {
    question: "Are my files secure?",
    answer:
      "Absolutely. All uploaded files are encrypted in transit and automatically deleted from our servers after processing.",
  },
  {
    question: "What is the maximum file size?",
    answer:
      "You can upload files up to 50MB. For larger files, create a free account for increased limits.",
  },
];

function createTool(
  partial: Omit<PdfTool, "faq" | "features" | "howToSteps"> & {
    features?: string[];
    howToSteps?: string[];
    faq?: PdfTool["faq"];
  }
): PdfTool {
  return {
    features: [
      "Drag and drop upload",
      "Fast processing",
      "Secure & private",
      "No watermarks",
    ],
    howToSteps: [
      "Upload your PDF file(s)",
      "Configure options if needed",
      "Download your processed file",
    ],
    faq: baseFaq,
    ...partial,
  };
}

export const PDF_TOOLS: PdfTool[] = [
  createTool({
    slug: "merge-pdf",
    name: "Merge PDF",
    description:
      "Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.",
    shortDescription: "Combine PDFs into one file",
    icon: "Combine",
    category: "organize",
    color: "from-red-500 to-rose-600",
    multiFile: true,
    acceptedTypes: ["application/pdf"],
    maxFiles: 20,
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger"],
    howToSteps: [
      "Select or drag multiple PDF files",
      "Reorder files as needed",
      "Click merge and download",
    ],
  }),
  createTool({
    slug: "split-pdf",
    name: "Split PDF",
    description:
      "Split a PDF into multiple files by page range or extract specific pages.",
    shortDescription: "Split PDF into separate files",
    icon: "SplitSquareHorizontal",
    category: "organize",
    color: "from-orange-500 to-amber-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["split pdf", "divide pdf", "extract pages", "separate pdf"],
  }),
  createTool({
    slug: "compress-pdf",
    name: "Compress PDF",
    description:
      "Reduce PDF file size while maintaining quality. Perfect for email and web sharing.",
    shortDescription: "Reduce PDF file size",
    icon: "Minimize2",
    category: "optimize",
    color: "from-green-500 to-emerald-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "optimize pdf"],
  }),
  createTool({
    slug: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents to editable Word (.docx) files.",
    shortDescription: "Convert PDF to DOCX",
    icon: "FileText",
    category: "convert",
    color: "from-blue-500 to-indigo-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word"],
  }),
  createTool({
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format with perfect formatting.",
    shortDescription: "Convert DOCX to PDF",
    icon: "FileType",
    category: "convert",
    color: "from-blue-600 to-blue-800",
    multiFile: false,
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ],
    maxFiles: 1,
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf"],
  }),
  createTool({
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF documents.",
    shortDescription: "Convert XLSX to PDF",
    icon: "Sheet",
    category: "convert",
    color: "from-green-600 to-teal-600",
    multiFile: false,
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    maxFiles: 1,
    keywords: ["excel to pdf", "xlsx to pdf", "spreadsheet to pdf"],
  }),
  createTool({
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    description: "Convert PowerPoint presentations to PDF format.",
    shortDescription: "Convert PPTX to PDF",
    icon: "Presentation",
    category: "convert",
    color: "from-orange-600 to-red-600",
    multiFile: false,
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ],
    maxFiles: 1,
    keywords: ["powerpoint to pdf", "pptx to pdf", "presentation to pdf"],
  }),
  createTool({
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Convert JPG, PNG, and other images to PDF documents.",
    shortDescription: "Convert images to PDF",
    icon: "Image",
    category: "convert",
    color: "from-purple-500 to-violet-600",
    multiFile: true,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFiles: 20,
    keywords: ["jpg to pdf", "image to pdf", "png to pdf", "photo to pdf"],
  }),
  createTool({
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG images.",
    shortDescription: "Convert PDF to images",
    icon: "ImageDown",
    category: "convert",
    color: "from-pink-500 to-rose-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["pdf to jpg", "pdf to image", "pdf to png"],
  }),
  createTool({
    slug: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate PDF pages 90°, 180°, or 270° clockwise or counterclockwise.",
    shortDescription: "Rotate PDF pages",
    icon: "RotateCw",
    category: "edit",
    color: "from-cyan-500 to-blue-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["rotate pdf", "turn pdf pages", "pdf rotation"],
  }),
  createTool({
    slug: "unlock-pdf",
    name: "Unlock PDF",
    description: "Remove password protection from PDF files.",
    shortDescription: "Remove PDF password",
    icon: "Unlock",
    category: "security",
    color: "from-yellow-500 to-orange-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["unlock pdf", "remove pdf password", "decrypt pdf"],
  }),
  createTool({
    slug: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to your PDF documents.",
    shortDescription: "Password protect PDF",
    icon: "Lock",
    category: "security",
    color: "from-red-600 to-red-800",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["protect pdf", "password pdf", "encrypt pdf"],
  }),
  createTool({
    slug: "watermark-pdf",
    name: "Watermark PDF",
    description: "Add text or image watermarks to your PDF documents.",
    shortDescription: "Add watermark to PDF",
    icon: "Droplets",
    category: "edit",
    color: "from-indigo-500 to-purple-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["watermark pdf", "add watermark", "stamp pdf"],
  }),
  createTool({
    slug: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers to your PDF document.",
    shortDescription: "Add page numbers",
    icon: "Hash",
    category: "edit",
    color: "from-slate-500 to-gray-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["page numbers pdf", "number pdf pages", "add page numbers"],
  }),
  createTool({
    slug: "delete-pages",
    name: "Delete Pages",
    description: "Remove unwanted pages from your PDF document.",
    shortDescription: "Remove PDF pages",
    icon: "Trash2",
    category: "organize",
    color: "from-red-500 to-pink-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["delete pdf pages", "remove pages", "pdf page remover"],
  }),
  createTool({
    slug: "organize-pdf",
    name: "Organize PDF",
    description: "Reorder, rotate, and delete pages in your PDF document.",
    shortDescription: "Reorder PDF pages",
    icon: "LayoutGrid",
    category: "organize",
    color: "from-violet-500 to-purple-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["organize pdf", "reorder pdf pages", "arrange pdf"],
  }),
  createTool({
    slug: "extract-pages",
    name: "Extract Pages",
    description: "Extract specific pages from a PDF into a new document.",
    shortDescription: "Extract PDF pages",
    icon: "FileOutput",
    category: "organize",
    color: "from-teal-500 to-cyan-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["extract pdf pages", "save pdf pages", "pdf page extractor"],
  }),
  createTool({
    slug: "repair-pdf",
    name: "Repair PDF",
    description: "Fix corrupted or damaged PDF files.",
    shortDescription: "Fix corrupted PDFs",
    icon: "Wrench",
    category: "optimize",
    color: "from-amber-500 to-yellow-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["repair pdf", "fix pdf", "corrupted pdf"],
  }),
  createTool({
    slug: "ocr-pdf",
    name: "OCR PDF",
    description:
      "Make scanned PDFs searchable with optical character recognition.",
    shortDescription: "Make PDF searchable",
    icon: "ScanText",
    category: "optimize",
    color: "from-emerald-500 to-green-600",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    maxFiles: 1,
    keywords: ["ocr pdf", "scan pdf", "searchable pdf", "text recognition"],
  }),
  createTool({
    slug: "html-to-pdf",
    name: "HTML to PDF",
    description: "Convert HTML content or web pages to PDF documents.",
    shortDescription: "Convert HTML to PDF",
    icon: "Code",
    category: "convert",
    color: "from-sky-500 to-blue-600",
    multiFile: false,
    acceptedTypes: ["text/html"],
    maxFiles: 1,
    keywords: ["html to pdf", "webpage to pdf", "url to pdf"],
  }),
];

export const TOOL_MAP = new Map(PDF_TOOLS.map((t) => [t.slug, t]));

export function getToolBySlug(slug: string): PdfTool | undefined {
  return TOOL_MAP.get(slug);
}

export const TOOL_CATEGORIES = [
  { id: "organize" as const, name: "Organize PDF", color: "text-red-500" },
  { id: "optimize" as const, name: "Optimize PDF", color: "text-green-500" },
  { id: "convert" as const, name: "Convert PDF", color: "text-blue-500" },
  { id: "edit" as const, name: "Edit PDF", color: "text-purple-500" },
  { id: "security" as const, name: "PDF Security", color: "text-orange-500" },
];

export const HOMEPAGE_FAQ = [
  {
    question: "Is ILPDF really free?",
    answer:
      "Yes! All our PDF tools are 100% free to use. No hidden fees, no watermarks on your documents.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required for basic use. Creating a free account gives you access to file history, favorites, and higher limits.",
  },
  {
    question: "How secure are my files?",
    answer:
      "We use SSL encryption for all transfers. Files are automatically deleted from our servers within 24 hours of processing.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support PDF, Word, Excel, PowerPoint, JPG, PNG, and HTML formats for conversion.",
  },
  {
    question: "Can I use ILPDF on mobile?",
    answer:
      "Yes! Our website is fully responsive and works on all devices including smartphones and tablets.",
  },
  {
    question: "Is there an API available?",
    answer:
      "Yes, registered users can generate API keys from their dashboard for programmatic access.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Manager",
    content:
      "ILPDF has become my go-to tool for all PDF tasks. Fast, reliable, and the interface is beautiful.",
    avatar: "/avatars/avatar-1.svg",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Software Developer",
    content:
      "The merge and split tools are incredibly fast. I process dozens of PDFs daily without any issues.",
    avatar: "/avatars/avatar-2.svg",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    role: "Legal Assistant",
    content:
      "Security was my main concern. ILPDF's auto-delete policy and encryption give me peace of mind.",
    avatar: "/avatars/avatar-3.svg",
    rating: 5,
  },
];
