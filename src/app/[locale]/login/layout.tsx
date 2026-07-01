import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Log In | ILPDF",
  description: "Log in to your ILPDF account.",
  keywords: [],
  canonical: "/login",
  ogImage: "/opengraph-image",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
