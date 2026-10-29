/**
 * Страница студии для маршрута языка: метаданные, разметка schema.org и сам лендинг.
 * Подключается в app/page.tsx (ru), app/en/page.tsx и app/tj/page.tsx. Модуль серверный.
 */

import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "./studio-content";
import { LOCALES, LOCALE_HTML, LOCALE_OG, LOCALE_PATH, localizeContent, type Locale } from "./studio-i18n";
import { STUDIO_INTRO_BOOT_SCRIPT } from "./studio-intro";
import { StudioPage } from "./studio-page";

/** `country` — страна студии в адресе (ISO 3166): у каждой языковой версии своя. */
const SEO: Record<Locale, { title: string; description: string; areaServed: string[]; services: string[]; name: string; country: string }> = {
  ru: {
    title: "Лемнити Студия: разработка сайтов, UI/UX-дизайн и брендинг",
    description:
      "Студия разработки Lemnity: сайты и веб-приложения, интерфейсы, лендинги и интернет-магазины, брендинг, MVP и казуальные игры. 12+ лет опыта, 50+ проектов, работаем удалённо.",
    name: "Лемнити Студия",
    areaServed: ["Тюмень", "Россия", "весь мир"],
    country: "RU",
    services: [
      "разработка сайтов и веб-приложений",
      "UI/UX-дизайн",
      "лендинги и интернет-магазины",
      "брендинг и айдентика",
      "создание цифровых продуктов и MVP",
      "разработка казуальных игр",
    ],
  },
  en: {
    title: "Lemnity Studio: website development, UI/UX design and branding",
    description:
      "Lemnity development studio: websites and web apps, interfaces, landing pages and online stores, branding, MVPs and casual games. 12+ years of experience, 50+ projects, working remotely.",
    name: "Lemnity Studio",
    areaServed: ["Cyprus", "Russia", "Worldwide"],
    country: "CY",
    services: [
      "website and web application development",
      "UI/UX design",
      "landing pages and online stores",
      "branding and identity",
      "digital products and MVPs",
      "casual game development",
    ],
  },
  tj: {
    title: "Лемнити Студия: таҳияи сайтҳо, дизайни UI/UX ва брендинг",
    description:
      "Студияи таҳияи Lemnity: сайтҳо ва веб-барномаҳо, интерфейсҳо, лендингҳо ва мағозаҳои онлайн, брендинг, MVP ва бозиҳои казуалӣ. Зиёда аз 12 сол таҷриба, 50+ лоиҳа, кори фосилавӣ.",
    name: "Лемнити Студия",
    areaServed: ["Тоҷикистон", "Русия", "Тамоми ҷаҳон"],
    country: "TJ",
    services: [
      "таҳияи сайтҳо ва веб-барномаҳо",
      "дизайни UI/UX",
      "лендингҳо ва мағозаҳои онлайн",
      "брендинг ва айдентика",
      "маҳсулоти рақамӣ ва MVP",
      "таҳияи бозиҳои казуалӣ",
    ],
  },
};

const urlOf = (locale: Locale) => `${STUDIO_SITE_URL}${LOCALE_PATH[locale]}`;

export function studioMetadata(locale: Locale): Metadata {
  const { title, description } = SEO[locale];
  const url = urlOf(locale);
  // hreflang: каждая версия ссылается на все три и на русскую как версию по умолчанию.
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], urlOf(l)]));
  return {
    title,
    description,
    alternates: { canonical: url, languages: { ...languages, "x-default": urlOf("ru") } },
    openGraph: {
      type: "website",
      locale: LOCALE_OG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_OG[l]),
      url,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function jsonLd(locale: Locale) {
  const seo = SEO[locale];
  const url = urlOf(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#service`,
        name: seo.name,
        url,
        areaServed: seo.areaServed,
        address: { "@type": "PostalAddress", addressLocality: seo.areaServed[0], addressCountry: seo.country },
        serviceType: seo.services,
      },
      {
        "@type": "FAQPage",
        inLanguage: LOCALE_HTML[locale],
        mainEntity: localizeContent(locale).faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export function StudioRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale)) }} />
      {/* Корневой layout общий для всех языков и ставит lang="ru"; на en и tj язык документа правим до отрисовки. */}
      {locale !== "ru" ? (
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(LOCALE_HTML[locale])};` }} />
      ) : null}
      {/* До контента: решает, показывать ли заставку, пока страница ещё не отрисована. */}
      <script dangerouslySetInnerHTML={{ __html: STUDIO_INTRO_BOOT_SCRIPT }} />
      <StudioPage locale={locale} />
    </>
  );
}
