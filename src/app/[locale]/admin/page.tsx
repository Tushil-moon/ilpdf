import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Users, FileText, MessageSquare, Settings, BarChart3, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin Panel | ILPDF",
  description: "Administration dashboard for ILPDF.",
  keywords: ["admin"],
  canonical: "/admin",
  ogImage: "/og/default.png",
  noIndex: true,
});

const adminSections = [
  { href: "/admin/users", label: "Users", icon: Users, count: "—" },
  { href: "/admin/files", label: "Files", icon: FileText, count: "—" },
  { href: "/admin/blogs", label: "Blogs", icon: FileText, count: "3" },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare, count: "—" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, count: "—" },
  { href: "/admin/ads", label: "Advertisements", icon: Megaphone, count: "—" },
  { href: "/admin/seo", label: "SEO", icon: Settings, count: "—" },
  { href: "/admin/settings", label: "System Settings", icon: Settings, count: "—" },
];

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Panel</h1>
      <p className="text-muted-foreground mb-8">Manage your ILPDF platform</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{section.label}</CardTitle>
                <section.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{section.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
