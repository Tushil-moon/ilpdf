import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { formatDate, formatFileSize } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardFilesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const files = await prisma.file.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Recent Files", href: "/dashboard/files" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-8">Recent Files</h1>

      {files.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground mb-4">No files processed yet.</p>
          <Button asChild>
            <Link href="/tools">Browse PDF Tools</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">File</th>
                <th className="px-4 py-3 text-left font-medium">Tool</th>
                <th className="px-4 py-3 text-left font-medium">Size</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const tool = getToolBySlug(file.toolSlug);
                return (
                  <tr key={file.id} className="border-t border-border/50">
                    <td className="px-4 py-3">{file.resultName ?? file.originalName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tool?.name ?? file.toolSlug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {file.status === "COMPLETED" && (
                        <a
                          href={`/api/download/${file.id}`}
                          className="text-red-500 hover:underline"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
