import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  Download,
  Star,
  Settings,
  CreditCard,
  Key,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { formatFileSize, formatDate } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard | ILPDF",
  description: "Manage your PDF files, downloads, and account settings.",
  keywords: ["dashboard", "pdf account"],
  canonical: "/dashboard",
  ogImage: "/opengraph-image",
  noIndex: true,
});

export const dynamic = "force-dynamic";

const quickLinks = [
  { href: "/dashboard/files", label: "Recent Files", icon: FileText },
  { href: "/dashboard/downloads", label: "Download History", icon: Download },
  { href: "/dashboard/favorites", label: "Favorite Tools", icon: Star },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [fileCount, downloadCount, favorites, recentFiles, storageAgg] =
    await Promise.all([
      prisma.file.count({ where: { userId, status: "COMPLETED" } }),
      prisma.download.count({ where: { userId } }),
      prisma.favoriteTool.findMany({ where: { userId }, take: 5 }),
      prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.file.aggregate({
        where: { userId },
        _sum: { size: true },
      }),
    ]);

  const storageUsed = storageAgg._sum.size ?? 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name ?? "User"}
        </h1>
        <p className="text-muted-foreground mt-1">{session.user.email}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Files Processed
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fileCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{downloadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favorite Tools
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{favorites.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatFileSize(storageUsed)}</p>
          </CardContent>
        </Card>
      </div>

      {recentFiles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Files</h2>
            <Link href="/dashboard/files" className="text-sm text-red-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">File</th>
                  <th className="px-4 py-3 text-left font-medium">Tool</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((file) => {
                  const tool = getToolBySlug(file.toolSlug);
                  return (
                    <tr key={file.id} className="border-t border-border/50">
                      <td className="px-4 py-3">{file.resultName ?? file.originalName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tool?.name ?? file.toolSlug}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            file.status === "COMPLETED"
                              ? "text-green-600"
                              : file.status === "FAILED"
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }
                        >
                          {file.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <link.icon className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <span className="font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
