import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Префикс пути сайта (GitHub Pages отдаёт его из /studio). Пусто, когда сайт живёт в корне домена. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

/** Абсолютный путь к файлу из public/ с учётом BASE_PATH: обычные <img> и CSS префикс сами не получают. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
