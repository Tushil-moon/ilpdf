function getPublisherId(): string {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-5170980823903358";
  return clientId.replace(/^ca-pub-/, "pub-");
}

/** GET /ads.txt — AdSense authorized sellers (required for AdSense review) */
export function GET() {
  const publisherId = getPublisherId();
  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
