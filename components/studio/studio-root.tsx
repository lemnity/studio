import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { STUDIO_SITE_URL, STUDIO_VERIFICATION } from "./studio-content";
import { LOCALE_HTML, type Locale } from "./studio-i18n";
import { StudioMetrika } from "./studio-metrika";

import "@/app/globals.css";

/**
 * Корневой документ сайта. У каждого языка свой корневой layout (app/(ru), app/(en), app/(tj)), чтобы
 * <html lang> стоял правильный уже в отданном HTML: поисковики читают язык до выполнения скриптов.
 */

export const rootMetadata: Metadata = {
  metadataBase: new URL(STUDIO_SITE_URL),
  applicationName: "Студия Лемнити",
  verification: {
    ...(STUDIO_VERIFICATION.google ? { google: STUDIO_VERIFICATION.google } : {}),
    ...(STUDIO_VERIFICATION.yandex ? { yandex: STUDIO_VERIFICATION.yandex } : {}),
  },
};

export const rootViewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export function StudioRootLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    // suppressHydrationWarning: загрузочный скрипт заставки ставит на <html> атрибут data-st-intro до гидрации.
    <html lang={LOCALE_HTML[locale]} suppressHydrationWarning>
      <body>
        {children}
        <StudioMetrika />
      </body>
    </html>
  );
}
