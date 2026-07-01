import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/legal-page";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | ILPDF",
  description:
    "ILPDF Privacy Policy. Learn how we collect, use, store, and protect your data when using our free online PDF tools and Google AdSense ads.",
  keywords: ["privacy policy", "ilpdf privacy", "pdf data protection", "gdpr"],
  canonical: "/privacy",
  ogImage: "/opengraph-image",
});

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      title="Privacy Policy"
      breadcrumbs={[{ name: "Privacy Policy", href: "/privacy" }]}
    >
      <p>Last updated: June 30, 2026</p>
      <p>
        ILPDF (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates ilpdf.com and provides free
        online PDF tools. This Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our Service.
      </p>

      <h2>Information We Collect</h2>
      <h3>Files You Upload</h3>
      <p>
        When you use server-processed tools, files are temporarily stored on our servers for
        processing. Files are automatically deleted within 24 hours. Many tools (merge, split,
        compress, protect) process files entirely in your browser without uploading.
      </p>
      <h3>Account Information</h3>
      <p>
        If you create an account, we collect your email address, name, and usage statistics to
        provide dashboard features, file history, and support.
      </p>
      <h3>Automatically Collected Data</h3>
      <p>We automatically collect certain information when you visit our site:</p>
      <ul>
        <li>IP address, browser type, and device information</li>
        <li>Pages visited, time spent, and referring URLs</li>
        <li>Cookie identifiers (see our <Link href="/cookies">Cookie Policy</Link>)</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>Provide and improve our PDF tools</li>
        <li>Process files you submit for server-side tools</li>
        <li>Authenticate your account and provide dashboard features</li>
        <li>Analyze site usage to improve performance and UX</li>
        <li>Display relevant advertisements through Google AdSense</li>
        <li>Respond to support requests and legal obligations</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party services that may collect data:</p>
      <ul>
        <li>
          <strong>Google AdSense</strong> — displays advertisements. Google uses cookies to serve
          ads based on your visits. See{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Google Analytics</strong> — website traffic analysis (if enabled, with consent)
        </li>
        <li>
          <strong>Microsoft Clarity</strong> — user experience analytics (if enabled, with consent)
        </li>
        <li>
          <strong>Supabase / PostgreSQL</strong> — account and metadata storage
        </li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>Advertising (Google AdSense)</h2>
      <p>
        We use Google AdSense to display ads that help keep ILPDF free. Google and its partners may
        use cookies and similar technologies to collect information about your visits to this and
        other websites to provide personalized advertisements.
      </p>
      <p>
        You can opt out of personalized advertising at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ad Settings
        </a>
        . Learn how Google uses data from partner sites:{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Partner Sites
        </a>
        .
      </p>

      <h2>Data Retention</h2>
      <ul>
        <li>Uploaded files: deleted within 24 hours</li>
        <li>Account data: retained while your account is active</li>
        <li>Analytics data: retained per third-party provider policies</li>
      </ul>

      <h2>Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal data</li>
        <li>Object to or restrict certain processing</li>
        <li>Data portability</li>
        <li>Withdraw consent for cookies and advertising</li>
        <li>Lodge a complaint with a supervisory authority</li>
      </ul>
      <p>
        To exercise these rights, contact{" "}
        <a href="mailto:privacy@ilpdf.com">privacy@ilpdf.com</a>.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        ILPDF is not directed at children under 13. We do not knowingly collect personal information
        from children. Contact us if you believe a child has provided us data.
      </p>

      <h2>International Transfers</h2>
      <p>
        Your data may be processed in countries other than your own. We ensure appropriate
        safeguards are in place for international data transfers.
      </p>

      <h2>Security</h2>
      <p>
        We use SSL/TLS encryption for data in transit, secure server infrastructure, and automatic
        file deletion. No method of transmission over the Internet is 100% secure.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Changes will be posted on this page with an
        updated date.
      </p>

      <h2>Contact Us</h2>
      <p>
        Email: <a href="mailto:privacy@ilpdf.com">privacy@ilpdf.com</a>
        <br />
        <Link href="/contact">Contact page</Link>
      </p>
    </LegalPage>
  );
}
