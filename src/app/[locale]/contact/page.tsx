import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us | ILPDF",
  description:
    "Contact the ILPDF team for support, feedback, privacy requests, or business inquiries. We respond within 2 business days.",
  keywords: ["contact ilpdf", "pdf tools support", "ilpdf help"],
  canonical: "/contact",
  ogImage: "/opengraph-image",
});

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage title="Contact Us" breadcrumbs={[{ name: "Contact", href: "/contact" }]}>
      <p>
        We&apos;d love to hear from you. Whether you have a question about our PDF tools, need
        technical support, or want to report an issue — our team is here to help.
      </p>
      <h2>General Support</h2>
      <p>
        Email: <a href="mailto:support@ilpdf.com">support@ilpdf.com</a>
        <br />
        Response time: within 2 business days
      </p>
      <h2>Privacy & Data Requests</h2>
      <p>
        For privacy-related inquiries, data deletion requests, or GDPR/CCPA requests:
        <br />
        Email: <a href="mailto:privacy@ilpdf.com">privacy@ilpdf.com</a>
      </p>
      <h2>Business & Partnerships</h2>
      <p>
        For advertising, API access, or partnership opportunities:
        <br />
        Email: <a href="mailto:partners@ilpdf.com">partners@ilpdf.com</a>
      </p>
      <h2>Before You Contact Us</h2>
      <ul>
        <li>
          Check our <a href="/blog">blog</a> for how-to guides on common PDF tasks
        </li>
        <li>
          Review our <a href="/privacy">Privacy Policy</a> for data handling questions
        </li>
        <li>
          See our <a href="/terms">Terms of Service</a> for usage guidelines
        </li>
      </ul>
    </LegalPage>
  );
}
