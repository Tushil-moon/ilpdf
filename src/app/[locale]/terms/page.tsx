import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service | ILPDF",
  description:
    "ILPDF Terms of Service. Read the rules and guidelines for using our free online PDF tools and website.",
  keywords: ["terms of service", "ilpdf terms", "pdf tools terms"],
  canonical: "/terms",
  ogImage: "/opengraph-image",
});

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      title="Terms of Service"
      breadcrumbs={[{ name: "Terms of Service", href: "/terms" }]}
    >
      <p>Last updated: June 30, 2026</p>
      <p>
        By accessing or using ILPDF (&quot;the Service&quot;), you agree to these Terms of Service.
        If you do not agree, please do not use the Service.
      </p>
      <h2>1. Description of Service</h2>
      <p>
        ILPDF provides free online PDF processing tools including merge, split, compress, convert,
        rotate, protect, and other document utilities accessible at ilpdf.com and related domains.
      </p>
      <h2>2. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload illegal, copyrighted, or malicious content</li>
        <li>Attempt to disrupt, hack, or overload our servers</li>
        <li>Use automated bots to abuse the Service or circumvent rate limits</li>
        <li>Resell or redistribute our tools without written permission</li>
        <li>Misrepresent your affiliation with ILPDF</li>
      </ul>
      <h2>3. File Processing & Storage</h2>
      <p>
        Files uploaded for server-side processing are automatically deleted within 24 hours. Some
        tools process files entirely in your browser without uploading. We are not responsible for
        data loss — always keep backups of important documents.
      </p>
      <h2>4. Accounts</h2>
      <p>
        Optional accounts provide access to file history and dashboard features. You are responsible
        for maintaining the security of your account credentials.
      </p>
      <h2>5. Advertising</h2>
      <p>
        The Service displays advertisements provided by Google AdSense. Ad content is managed by
        Google and subject to Google&apos;s advertising policies. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link> for details
        on how advertising partners use data.
      </p>
      <h2>6. Intellectual Property</h2>
      <p>
        The ILPDF name, logo, website design, and original content are owned by ILPDF. You retain
        ownership of files you upload. We claim no ownership over your documents.
      </p>
      <h2>7. Disclaimer of Warranties</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
        error-free processing, specific file size reductions, or compatibility with all PDF versions.
      </p>
      <h2>8. Limitation of Liability</h2>
      <p>
        ILPDF shall not be liable for any indirect, incidental, or consequential damages arising
        from use of the Service, including loss of data or business interruption.
      </p>
      <h2>9. Changes to Terms</h2>
      <p>
        We may update these Terms at any time. Continued use of the Service after changes
        constitutes acceptance of the updated Terms.
      </p>
      <h2>10. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:legal@ilpdf.com">legal@ilpdf.com</a> or visit our{" "}
        <Link href="/contact">Contact page</Link>.
      </p>
    </LegalPage>
  );
}
