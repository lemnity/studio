import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { LOCALE_OG, LOCALE_PATH, UI } from "@/components/studio/studio-i18n";
import { StudioWorksPage } from "@/components/studio/studio-page";

const url = `${STUDIO_SITE_URL}${LOCALE_PATH.en}works/`;

export const metadata: Metadata = {
  title: UI.en.works.meta.title,
  description: UI.en.works.meta.description,
  alternates: {
    canonical: url,
    languages: {
      ru: `${STUDIO_SITE_URL}/works/`,
      en: `${STUDIO_SITE_URL}/en/works/`,
      tg: `${STUDIO_SITE_URL}/tj/works/`,
    },
  },
  openGraph: { type: "website", locale: LOCALE_OG.en, url, title: UI.en.works.meta.title, description: UI.en.works.meta.description },
};

export default function WorksPage() {
  return (
    <>
      {/* Корневой layout ставит lang="ru"; язык документа правим до отрисовки, как на главной. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="en";' }} />
      <StudioWorksPage locale="en" />
    </>
  );
}
