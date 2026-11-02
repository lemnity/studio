import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { StudioPricingPage } from "@/components/studio/studio-page";
import { PRICING, PRICING_OG_IMAGE, PRICING_PATH } from "@/components/studio/studio-pricing";

const url = `${STUDIO_SITE_URL}${PRICING_PATH}`;

export const metadata: Metadata = {
  title: PRICING.meta.title,
  description: PRICING.meta.description,
  alternates: { canonical: url },
  openGraph: { type: "website", locale: "ru_RU", url, title: PRICING.meta.title, description: PRICING.meta.description, images: [PRICING_OG_IMAGE] },
  twitter: { card: "summary_large_image", title: PRICING.meta.title, description: PRICING.meta.description, images: [PRICING_OG_IMAGE.url] },
};

const rub = (s: string) => Number(s.replace(/\D/g, ""));

/** Пакеты с вилкой цен, вопросы о деньгах и путь от главной — для расширенного сниппета в поиске. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OfferCatalog",
      "@id": `${url}#catalog`,
      name: "Цены Студии Лемнити",
      url,
      itemListElement: PRICING.packages.map((p) => {
        const [min, max] = p.range.split("–").map(rub);
        return {
          "@type": "Offer",
          name: p.name,
          description: p.text,
          itemOffered: { "@type": "Service", name: p.name, provider: { "@type": "ProfessionalService", "@id": `${STUDIO_SITE_URL}/#service` } },
          priceSpecification: { "@type": "PriceSpecification", minPrice: min, maxPrice: max, priceCurrency: "RUB" },
        };
      }),
    },
    {
      "@type": "FAQPage",
      inLanguage: "ru",
      mainEntity: PRICING.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Студия Лемнити", item: `${STUDIO_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Цены", item: url },
      ],
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StudioPricingPage />
    </>
  );
}
