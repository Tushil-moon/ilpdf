"use client";

import { useSyncExternalStore } from "react";

export const CONSENT_KEY = "ilpdf-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("ilpdf-cookie-consent", callback);
  return () => window.removeEventListener("ilpdf-cookie-consent", callback);
}

export function getCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function notifyCookieConsentChange() {
  window.dispatchEvent(new Event("ilpdf-cookie-consent"));
}

export function useCookieConsent(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(CONSENT_KEY) === "accepted",
    () => false
  );
}

export function useCookieBannerVisible(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !localStorage.getItem(CONSENT_KEY),
    () => false
  );
}
