import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy | ILPDF",
  description:
    "Learn how ILPDF uses cookies for authentication, analytics, and Google AdSense advertising. Manage your cookie preferences.",
  keywords: ["cookie policy", "ilpdf cookies", "adsense cookies"],
  canonical: "/cookies",
  ogImage: "/opengraph-image",
});

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      title="Cookie Policy"
      breadcrumbs={[{ name: "Cookie Policy", href: "/cookies" }]}
    >
      <p>Last updated: June 30, 2026</p>
      <p>
        This Cookie Policy explains how ILPDF uses cookies and similar technologies when you visit
        our website.
      </p>
      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        site remember your preferences and understand how you use our services.
      </p>
      <h2>Types of Cookies We Use</h2>
      <h3>Essential Cookies</h3>
      <p>
        Required for the website to function. These include session cookies for authentication
        when you log in to your account. These cannot be disabled.
      </p>
      <h3>Analytics Cookies</h3>
      <p>Help us understand how visitors use ILPDF so we can improve our tools. Providers:</p>
      <ul>
        <li>
          <strong>Google Analytics</strong> — page views, session duration, traffic sources
        </li>
        <li>
          <strong>Microsoft Clarity</strong> — heatmaps and session recordings (if enabled)
        </li>
      </ul>
      <h3>Advertising Cookies</h3>
      <p>
        Used by <strong>Google AdSense</strong> to display relevant advertisements and measure ad
        performance. Google and its partners may use cookies to personalize ads based on your
        visits to this and other websites.
      </p>
      <p>
        Learn more about how Google uses data:{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Partner Sites Policy
        </a>
        . Opt out of personalized advertising:{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ad Settings
        </a>
        .
      </p>
      <h2>Managing Cookies</h2>
      <p>
        When you first visit ILPDF, you will see a cookie consent banner. You can accept or decline
        non-essential cookies (analytics and advertising). You can also control cookies through your
        browser settings.
      </p>
      <h2>Third-Party Cookies</h2>
      <p>
        Third-party services (Google AdSense, Google Analytics) may set their own cookies. We do not
        control these cookies. Please refer to each provider&apos;s privacy policy for details.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about cookies? Email{" "}
        <a href="mailto:privacy@ilpdf.com">privacy@ilpdf.com</a> or see our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
  );
}
