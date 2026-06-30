import { AdUnit } from "@/components/ads/ad-unit";

const SLOTS = {
  toolSidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL ?? "",
  toolBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "",
  blogInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG ?? "",
  homeBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? "",
};

export function ToolPageAds() {
  return (
    <aside className="mt-12 space-y-6" aria-label="Advertisements">
      <AdUnit slot={SLOTS.toolBanner} format="horizontal" className="w-full" />
      <AdUnit slot={SLOTS.toolSidebar} format="rectangle" className="mx-auto max-w-[300px]" />
    </aside>
  );
}

export function HomeBannerAd() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdUnit slot={SLOTS.homeBanner} format="horizontal" />
    </div>
  );
}

export function BlogInlineAd() {
  return (
    <div className="my-8">
      <AdUnit slot={SLOTS.blogInline} format="rectangle" className="mx-auto max-w-[336px]" />
    </div>
  );
}

export function ResultAd() {
  return (
    <div className="mt-8">
      <AdUnit slot={SLOTS.toolBanner} format="horizontal" />
    </div>
  );
}
