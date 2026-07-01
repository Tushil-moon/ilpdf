import { ImageResponse } from "next/og";
import { getToolBySlug } from "@/lib/tools";

export const alt = "ILPDF PDF Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ToolOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const name = tool?.name ?? "PDF Tool";
  const desc = tool?.shortDescription ?? "Free online PDF tool";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>
          {name}
        </div>
        <div style={{ fontSize: 26, opacity: 0.85, textAlign: "center" }}>{desc}</div>
        <div style={{ fontSize: 20, marginTop: 32, opacity: 0.6 }}>ILPDF — Free Online</div>
      </div>
    ),
    { ...size }
  );
}
