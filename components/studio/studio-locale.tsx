"use client";

/**
 * Язык страницы для клиентских компонентов: подписи интерфейса и контент на нужном языке.
 * Язык задаёт страница (app/page.tsx, app/en, app/tj) через <StudioPage locale>.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { UI, localizeContent, type Locale, type StudioContent, type Ui } from "./studio-i18n";

type StudioLocale = { locale: Locale; t: Ui; c: StudioContent };

const LocaleContext = createContext<StudioLocale>({ locale: "ru", t: UI.ru, c: localizeContent("ru") });

export function StudioLocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: UI[locale], c: localizeContent(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** `t` — подписи интерфейса, `c` — контент (проекты, услуги, вопросы…) на языке страницы. */
export const useStudioLocale = () => useContext(LocaleContext);
