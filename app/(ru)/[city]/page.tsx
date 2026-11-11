import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { STUDIO_CITIES, cityBySlug, type StudioCity } from "@/components/studio/studio-city";
import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { UI } from "@/components/studio/studio-i18n";
import { StudioCityPage } from "@/components/studio/studio-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return STUDIO_CITIES.map((c) => ({ city: c.slug }));
}

const ogImage = (city: StudioCity) => ({ url: `/studio/og/${city.slug}.png`, width: 1200, height: 630 });

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const city = cityBySlug((await params).city);
  if (!city) return {};
  const { title, description } = city.meta;
  const url = `${STUDIO_SITE_URL}/${city.slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "ru_RU", url, title, description, images: [ogImage(city)] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage(city).url] },
  };
}

/** Услуга в городе с пакетами и ценами «от», вопросы страницы и путь от главной — для сниппета в поиске. */
function jsonLd(city: StudioCity) {
  const url = `${STUDIO_SITE_URL}/${city.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Разработка сайтов ${city.inCity}`,
        serviceType: "Разработка сайтов",
        description: city.meta.description,
        url,
        areaServed: { "@type": "City", name: city.name },
        provider: { "@type": "ProfessionalService", "@id": `${STUDIO_SITE_URL}/#service`, name: "Студия Леммус", url: `${STUDIO_SITE_URL}/` },
        offers: UI.ru.pricing.plans
          .filter((p) => !p.promo)
          .map((p) => ({
            "@type": "Offer",
            name: p.name,
            description: p.text,
            priceSpecification: { "@type": "PriceSpecification", minPrice: Number(p.price.replace(/\D/g, "")), priceCurrency: "RUB" },
          })),
      },
      {
        "@type": "FAQPage",
        inLanguage: "ru",
        mainEntity: city.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Студия Леммус", item: `${STUDIO_SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: `Разработка сайтов ${city.inCity}`, item: url },
        ],
      },
    ],
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = cityBySlug((await params).city);
  if (!city) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(city)) }} />
      <StudioCityPage slug={city.slug} />
    </>
  );
}
