import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { LOCALE_OG, LOCALE_PATH, UI } from "@/components/studio/studio-i18n";
import { StudioWorksPage } from "@/components/studio/studio-page";

const url = `${STUDIO_SITE_URL}${LOCALE_PATH.ru}works/`;

export const metadata: Metadata = {
  title: UI.ru.works.meta.title,
  description: UI.ru.works.meta.description,
  alternates: {
    canonical: url,
    languages: {
      ru: `${STUDIO_SITE_URL}/works/`,
      en: `${STUDIO_SITE_URL}/en/works/`,
      tg: `${STUDIO_SITE_URL}/tj/works/`,
    },
  },
  openGraph: { type: "website", locale: LOCALE_OG.ru, url, title: UI.ru.works.meta.title, description: UI.ru.works.meta.description },
};

export default function WorksPage() {
  return <StudioWorksPage locale="ru" />;
}
