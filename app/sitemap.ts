import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { STUDIO_CASES } from "@/components/studio/studio-cases";
import { LOCALES, LOCALE_HTML, LOCALE_PATH } from "@/components/studio/studio-i18n";
import { PROMO_PATH } from "@/components/studio/studio-promo";

export const dynamic = "force-static";

/** Три языковые версии (у каждой — ссылки на остальные, hreflang), страницы кейсов и промо-игр. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`]));
  const pages: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`,
    changeFrequency: "monthly",
    priority: l === "ru" ? 1 : 0.8,
    alternates: { languages },
  }));
  const cases: MetadataRoute.Sitemap = STUDIO_CASES.map((c) => ({
    url: `${STUDIO_SITE_URL}/cases/${c.slug}/`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const works: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: `${STUDIO_SITE_URL}${LOCALE_PATH[l]}works/`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const promo: MetadataRoute.Sitemap = [{ url: `${STUDIO_SITE_URL}${PROMO_PATH}`, changeFrequency: "monthly", priority: 0.8 }];
  return [...pages, ...works, ...promo, ...cases];
}
