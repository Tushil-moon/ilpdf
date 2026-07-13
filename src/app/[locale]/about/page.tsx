import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = buildMetadata({
  title: "About ILPDF — Free Online PDF Tools",
  description:
    "Learn about ILPDF, a free online platform offering 20+ PDF tools to merge, split, compress, convert, and edit PDF files securely in your browser.",
  keywords: ["about ilpdf", "pdf tools company", "free pdf software"],
  canonical: "/about",
  ogImage: "/opengraph-image",
});

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage title="About ILPDF" breadcrumbs={[{ name: "About", href: "/about" }]}>
      <p>Last updated: June 30, 2026</p>
      <p>
        <strong>ILPDF</strong> is a free online platform that helps millions of users work with PDF
        documents every day. We provide professional-grade PDF tools that run directly in your web
        browser — no software installation required.
      </p>
      <h2>Our Mission</h2>
      <p>
        We believe everyone deserves access to powerful, easy-to-use PDF tools without paywalls,
        watermarks, or complicated software. Our mission is to make document management simple,
        fast, and secure for students, professionals, and businesses worldwide.
      </p>
      <h2>What We Offer</h2>
      <ul>
        <li>20+ free PDF tools including merge, split, compress, convert, rotate, and protect</li>
        <li>Browser-based processing — many tools run locally without uploading files</li>
        <li>Automatic file deletion within 24 hours for server-processed files</li>
        <li>Multi-language support (English, Spanish, French, German, Japanese)</li>
        <li>Helpful guides and tutorials on our blog</li>
      </ul>
      <h2>How We Make Money</h2>
      <p>
        ILPDF is supported by advertising through Google AdSense. Ads help us keep the core tools
        free for everyone. We do not sell your personal data or uploaded files.
      </p>
      <h2>Contact Us</h2>
      <p>
        Questions or feedback? Visit our <Link href="/contact">Contact page</Link> or email{" "}
        <a href="mailto:support@ilpdf.com">support@ilpdf.com</a>.
      </p>
    </LegalPage>
  );
}
