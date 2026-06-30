export const BLOG_POSTS = [
  {
    title: "How to Compress PDF Files Without Losing Quality",
    slug: "how-to-compress-pdf",
    excerpt:
      "Learn the best techniques to reduce PDF file size while maintaining document quality for email and web sharing.",
    coverImage: "/blog/compress-pdf.jpg",
    publishedAt: "2026-06-15",
    author: "Sarah Mitchell",
    category: "Tutorials",
    tags: ["compress", "optimize", "pdf"],
    keywords: ["compress pdf", "reduce pdf size", "pdf optimization"],
    content: `## Why Compress PDFs?

Large PDF files can be difficult to share via email or upload to websites. Compression reduces file size while preserving readability.

## Methods to Compress

1. **Remove unnecessary elements** - Embedded fonts, high-res images
2. **Use online tools** - ILPDF's compress tool handles this automatically
3. **Adjust image quality** - Reduce DPI for screen viewing

## Best Practices

- Always keep a backup of the original
- Test the compressed file before sharing
- Use appropriate compression levels for your use case`,
  },
  {
    title: "How to Merge Multiple PDF Files Into One",
    slug: "how-to-merge-pdf",
    excerpt:
      "A complete guide to combining multiple PDF documents into a single file using free online tools.",
    coverImage: "/blog/merge-pdf.jpg",
    publishedAt: "2026-06-10",
    author: "James Chen",
    category: "Tutorials",
    tags: ["merge", "combine", "pdf"],
    keywords: ["merge pdf", "combine pdf files", "join pdf"],
    content: `## When to Merge PDFs

Combining PDFs is useful for creating reports, portfolios, or consolidated documents from multiple sources.

## Step-by-Step Guide

1. Open the [Merge PDF tool](/tools/merge-pdf)
2. Upload all PDF files you want to combine
3. Drag to reorder files as needed
4. Click "Process" and download your merged PDF

## Tips

- Ensure all files are in the correct order before merging
- Check page orientation after merging
- Large files may take longer to process`,
  },
  {
    title: "PDF Security: How to Password Protect Your Documents",
    slug: "how-to-protect-pdf",
    excerpt:
      "Protect sensitive PDF documents with password encryption. Learn when and how to secure your files.",
    coverImage: "/blog/protect-pdf.jpg",
    publishedAt: "2026-06-05",
    author: "Maria Garcia",
    category: "Security",
    tags: ["security", "password", "protect"],
    keywords: ["protect pdf", "password pdf", "encrypt pdf"],
    content: `## Why Password Protect PDFs?

Sensitive documents like contracts, financial reports, and personal information should be protected from unauthorized access.

## How to Protect

Use our [Protect PDF tool](/tools/protect-pdf) to add password encryption to your documents.

## Security Tips

- Use strong, unique passwords
- Share passwords through a separate secure channel
- Consider additional security measures for highly sensitive documents`,
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getBlogPost(slug);
  if (!current) return BLOG_POSTS.slice(0, limit);
  return BLOG_POSTS.filter((p) => p.slug !== slug)
    .filter((p) => p.category === current.category || p.tags.some((t) => current.tags.includes(t)))
    .slice(0, limit);
}
