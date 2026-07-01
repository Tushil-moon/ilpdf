"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getCookieConsent } from "@/components/legal/cookie-consent";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdSenseScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getCookieConsent());
    const onConsent = () => setEnabled(getCookieConsent());
    window.addEventListener("ilpdf-cookie-consent", onConsent);
    return () => window.removeEventListener("ilpdf-cookie-consent", onConsent);
  }, []);

  if (!ADSENSE_CLIENT || !enabled) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
