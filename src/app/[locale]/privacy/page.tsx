import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | ILPDF",
  description: "ILPDF privacy policy. Learn how we handle your files and data.",
  keywords: ["privacy policy", "ilpdf privacy"],
  canonical: "/privacy",
  ogImage: "/og/default.png",
});

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ name: "Privacy Policy", href: "/privacy" }]} />
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>Last updated: June 30, 2026</p>
        <p>
          ILPDF is committed to protecting your privacy. This policy explains how we
          collect, use, and safeguard your information when you use our PDF tools.
        </p>
        <h2 className="text-xl font-semibold text-foreground pt-4">Files You Upload</h2>
        <p>
          Files uploaded for processing are automatically deleted from our servers within
          24 hours. We do not share your files with third parties.
        </p>
        <h2 className="text-xl font-semibold text-foreground pt-4">Account Information</h2>
        <p>
          If you create an account, we store your email, name, and usage statistics to
          provide dashboard features.
        </p>
        <h2 className="text-xl font-semibold text-foreground pt-4">Cookies & Analytics</h2>
        <p>
          We use cookies for authentication, Google Analytics, Microsoft Clarity, and
          Google AdSense for advertising.
        </p>
        <p>Contact: privacy@ilpdf.com</p>
      </div>
    </div>
  );
}
