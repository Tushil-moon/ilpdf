"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  CONSENT_KEY,
  notifyCookieConsentChange,
  useCookieBannerVisible,
} from "@/hooks/use-cookie-consent";

export { getCookieConsent, CONSENT_KEY } from "@/hooks/use-cookie-consent";

export function CookieConsent() {
  const visible = useCookieBannerVisible();

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    notifyCookieConsentChange();
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    notifyCookieConsentChange();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] border-t border-border bg-background/95 backdrop-blur-md p-4 shadow-lg"
    >
      <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-5xl">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use cookies for essential site functionality, analytics, and personalized ads via{" "}
          <strong className="text-foreground">Google AdSense</strong>. By clicking Accept, you
          agree to our{" "}
          <Link href="/cookies" className="text-red-600 underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-red-600 underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
