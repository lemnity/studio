import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { StudioPromoPage } from "@/components/studio/studio-page";
import { PROMO, PROMO_OG_IMAGE, PROMO_PATH } from "@/components/studio/studio-promo";

const url = `${STUDIO_SITE_URL}${PROMO_PATH}`;

export const metadata: Metadata = {
  title: PROMO.meta.title,
  description: PROMO.meta.description,
  alternates: { canonical: url },
  openGraph: { type: "website", locale: "ru_RU", url, title: PROMO.meta.title, description: PROMO.meta.description, images: [PROMO_OG_IMAGE] },
  twitter: { card: "summary_large_image", title: PROMO.meta.title, description: PROMO.meta.description, images: [PROMO_OG_IMAGE.url] },
};

/** Услуга с двумя форматами и ценами «от» и вопросы страницы — для расширенного сниппета в поиске. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: "Промо-игра для бренда",
      serviceType: "Разработка промо-игр и геймификации для брендов",
      description: PROMO.meta.description,
      url,
      areaServed: "RU",
      provider: { "@type": "ProfessionalService", "@id": `${STUDIO_SITE_URL}/#service`, name: "Студия Леммус", url: `${STUDIO_SITE_URL}/` },
      offers: PROMO.plans.map((p) => ({
        "@type": "Offer",
        name: p.name,
        description: p.text,
        priceSpecification: { "@type": "PriceSpecification", minPrice: Number(p.price.replace(/\D/g, "")), priceCurrency: "RUB" },
      })),
    },
    {
      "@type": "FAQPage",
      inLanguage: "ru",
      mainEntity: PROMO.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function PromoGamePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StudioPromoPage />
    </>
  );
}
