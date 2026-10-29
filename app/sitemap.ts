import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { LOCALES, LOCALE_HTML, LOCALE_PATH } from "@/components/studio/studio-i18n";

export const dynamic = "force-static";

/** Три языковые версии; у каждой — ссылки на остальные (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`]));
  return LOCALES.map((l) => ({
    url: `${STUDIO_SITE_URL}${LOCALE_PATH[l]}`,
    changeFrequency: "monthly",
    priority: l === "ru" ? 1 : 0.8,
    alternates: { languages },
  }));
}
