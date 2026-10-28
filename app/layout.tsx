import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(STUDIO_SITE_URL),
  applicationName: "Лемнити Студия",
};

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: загрузочный скрипт заставки ставит на <html> атрибут data-st-intro до гидрации.
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
