/**
 * Константы заставки «Лемнити Студии». Отдельный модуль БЕЗ "use client": скрипт подключает серверная
 * страница app/studio/page.tsx, а импорт значения из клиентского модуля вернул бы в серверный
 * компонент клиентскую ссылку вместо строки.
 */

export const STUDIO_INTRO_KEY = "lmnt-studio-intro";
export const STUDIO_INTRO_ATTR = "data-st-intro";
/**
 * Заставка показывается раз в сутки (как у illan.ru): в `localStorage` лежит срок, до которого её не
 * показывать. Параметр `?intro` в адресе показывает её всегда — чтобы посмотреть, не чистя хранилище.
 */
export const STUDIO_INTRO_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Решение «показывать ли заставку» принимается ДО первой отрисовки: скрипт стоит в разметке перед
 * контентом и ставит атрибут на `<html>`, а CSS показывает заставку только при `play`. Иначе
 * повторный посетитель видел бы вспышку чёрного экрана до гидрации, а первый — сначала пустую
 * страницу, потом заставку. Без JS заставки нет вовсе (по умолчанию она скрыта).
 */
export const STUDIO_INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;var f=/[?&]intro(=|&|$)/.test(location.search);var s=!f&&Number(localStorage.getItem("${STUDIO_INTRO_KEY}"))>Date.now();d.setAttribute("${STUDIO_INTRO_ATTR}",(r||s)?"skip":"play");}catch(e){d.setAttribute("${STUDIO_INTRO_ATTR}","skip");}})();`;
