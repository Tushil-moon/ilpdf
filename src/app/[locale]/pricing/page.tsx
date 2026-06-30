import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PDF_TOOLS } from "@/lib/tools";

export const metadata: Metadata = buildMetadata({
  title: "Pricing - Free PDF Tools | ILPDF",
  description: "ILPDF is 100% free. All PDF tools available at no cost with optional premium features.",
  keywords: ["pdf tools pricing", "free pdf"],
  canonical: "/pricing",
  ogImage: "/og/default.png",
});

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Everything you need for everyday PDF tasks",
      features: [
        "All 20+ PDF tools",
        "50MB file size limit",
        "No watermarks",
        "Auto-delete after 24h",
        "No registration required",
      ],
      cta: "Get Started",
      href: "/tools",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "$9.99/mo",
      description: "For power users and professionals",
      features: [
        "Everything in Free",
        "200MB file size limit",
        "File history (30 days)",
        "Priority processing",
        "API access",
        "No ads",
      ],
      cta: "Coming Soon",
      href: "/signup",
      highlighted: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ name: "Pricing", href: "/pricing" }]} />
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free. Upgrade when you need more power. All {PDF_TOOLS.length} tools included.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 ${
              plan.highlighted
                ? "border-red-500/50 bg-gradient-to-b from-red-500/5 to-transparent shadow-lg"
                : "border-border/50 bg-card"
            }`}
          >
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
            <p className="mt-2 text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
