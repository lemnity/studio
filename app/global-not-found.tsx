import type { Metadata } from "next";

import { rootViewport } from "@/components/studio/studio-root";
import { BASE_PATH } from "@/lib/utils";

import "./globals.css";

// noindex Next.js ставит на 404 сам.
export const metadata: Metadata = { title: "Страница не найдена — Студия Лемнити" };
export const viewport = rootViewport;

/** 404 для всего сайта: корневых layout несколько (по языкам), поэтому страница сама задаёт html и body. */
export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <body className="grid min-h-dvh place-items-center px-5 text-center">
        <main>
          <p className="text-[clamp(96px,20vw,220px)] font-normal leading-none tracking-[-0.05em] text-[#c4ee18]">404</p>
          <h1 className="mt-4 text-[28px] font-normal tracking-[-0.02em] md:text-[36px]">Страница не найдена</h1>
          <p className="mt-3 text-[16px] text-[rgba(244,241,236,0.6)]">Page not found · Саҳифа ёфт нашуд</p>
          <nav className="mt-10 flex flex-wrap justify-center gap-3 text-[16px]">
            <a href={`${BASE_PATH}/`} className="rounded-full border border-[#c4ee18] px-6 py-3 hover:bg-[rgba(196,238,24,0.1)]">На главную</a>
            <a href={`${BASE_PATH}/works/`} className="rounded-full border border-[rgba(244,241,236,0.2)] px-6 py-3 hover:border-[#c4ee18]">Работы</a>
            <a href={`${BASE_PATH}/en/`} className="rounded-full border border-[rgba(244,241,236,0.2)] px-6 py-3 hover:border-[#c4ee18]">English</a>
          </nav>
        </main>
      </body>
    </html>
  );
}
