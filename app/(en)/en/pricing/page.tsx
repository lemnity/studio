import { StudioPricingPage } from "@/components/studio/studio-page";
import { pricingJsonLd, pricingMetadata } from "@/components/studio/studio-pricing";

export const metadata = pricingMetadata("en");

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd("en")) }} />
      <StudioPricingPage locale="en" />
    </>
  );
}
