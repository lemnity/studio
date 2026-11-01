import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { StudioPromoPage } from "@/components/studio/studio-page";
import { PROMO, PROMO_PATH } from "@/components/studio/studio-promo";

const url = `${STUDIO_SITE_URL}${PROMO_PATH}`;

export const metadata: Metadata = {
  title: PROMO.meta.title,
  description: PROMO.meta.description,
  alternates: { canonical: url },
  openGraph: { type: "website", locale: "ru_RU", url, title: PROMO.meta.title, description: PROMO.meta.description },
};

export default function PromoGamePage() {
  return <StudioPromoPage />;
}
