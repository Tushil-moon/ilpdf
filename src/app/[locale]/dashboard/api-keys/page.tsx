import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { ApiKeysClient } from "./api-keys-client";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsed: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedKeys = keys.map((key) => ({
    ...key,
    lastUsed: key.lastUsed?.toISOString() ?? null,
    createdAt: key.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">API Keys</h1>
      <p className="text-muted-foreground mb-8">
        Use API keys to access the ILPDF REST API programmatically.
      </p>
      <ApiKeysClient initialKeys={serializedKeys} />
    </div>
  );
}
