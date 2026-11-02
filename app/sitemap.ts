import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { STUDIO_CASES } from "@/components/studio/studio-cases";
import { LOCALES, LOCALE_HTML, LOCALE_PATH } from "@/components/studio/studio-i18n";
import { PROMO_PATH } from "@/components/studio/studio-promo";
import { PRICING_PATH } from "@/components/studio/studio-pricing";
import { STUDIO_CITIES } from "@/components/studio/studio-city";

export const dynamic = "force-static";

/** Три языковые версии (у каждой — ссылки на остальные, hreflang), городские страницы, кейсы и промо-игры. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`]));
  const pages: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`,
    lastModified,
    changeFrequency: "monthly",
    priority: l === "ru" ? 1 : 0.8,
    alternates: { languages },
  }));
  const cases: MetadataRoute.Sitemap = STUDIO_CASES.map((c) => ({
    url: `${STUDIO_SITE_URL}/cases/${c.slug}/`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const works: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: `${STUDIO_SITE_URL}${LOCALE_PATH[l]}works/`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const promo: MetadataRoute.Sitemap = [PROMO_PATH, PRICING_PATH].map((path) => ({
    url: `${STUDIO_SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const cities: MetadataRoute.Sitemap = STUDIO_CITIES.map((c) => ({
    url: `${STUDIO_SITE_URL}/${c.slug}/`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
  }));
  return [...pages, ...cities, ...works, ...promo, ...cases];
}
