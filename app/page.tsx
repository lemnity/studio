import type { Metadata } from "next";

import { StudioPage } from "@/components/studio/studio-page";
import { STUDIO_FAQ, STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { STUDIO_INTRO_BOOT_SCRIPT } from "@/components/studio/studio-intro";

const CANONICAL = `${STUDIO_SITE_URL}/`;
const TITLE = "Лемнити Студия: разработка сайтов, UI/UX-дизайн и брендинг";
const DESCRIPTION =
  "Студия разработки Lemnity: сайты и веб-приложения, интерфейсы, лендинги и интернет-магазины, брендинг и MVP. 12+ лет опыта, 50+ проектов, работаем удалённо.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { type: "website", locale: "ru_RU", url: CANONICAL, title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${CANONICAL}#service`,
      name: "Лемнити Студия",
      url: CANONICAL,
      areaServed: ["Тюмень", "Россия", "весь мир"],
      address: { "@type": "PostalAddress", addressLocality: "Тюмень", addressCountry: "RU" },
      serviceType: [
        "разработка сайтов и веб-приложений",
        "UI/UX-дизайн",
        "лендинги и интернет-магазины",
        "брендинг и айдентика",
        "создание цифровых продуктов и MVP",
      ],
    },
    {
      "@type": "FAQPage",
      inLanguage: "ru",
      mainEntity: STUDIO_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      {/* До контента: решает, показывать ли заставку, пока страница ещё не отрисована. */}
      <script dangerouslySetInnerHTML={{ __html: STUDIO_INTRO_BOOT_SCRIPT }} />
      <StudioPage />
    </>
  );
}
