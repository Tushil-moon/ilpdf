import { ImageResponse } from "next/og";

export const alt = "ILPDF - Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #ef4444, #e11d48)",
            marginBottom: 32,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          IL
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, marginBottom: 16 }}>ILPDF</div>
        <div style={{ fontSize: 28, opacity: 0.85, textAlign: "center", maxWidth: 800 }}>
          Free Online PDF Tools — Merge, Split, Compress & Convert
        </div>
      </div>
    ),
    { ...size }
  );
}
