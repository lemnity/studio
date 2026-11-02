import { StudioPricingPage } from "@/components/studio/studio-page";
import { pricingJsonLd, pricingMetadata } from "@/components/studio/studio-pricing";

export const metadata = pricingMetadata("ru");

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd("ru")) }} />
      <StudioPricingPage />
    </>
  );
}
