import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign Up | ILPDF",
  description: "Create a free ILPDF account.",
  keywords: [],
  canonical: "/signup",
  ogImage: "/opengraph-image",
  noIndex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
