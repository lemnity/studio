/**
 * Константы заставки «Лемнити Студии». Отдельный модуль БЕЗ "use client": скрипт подключает серверная
 * страница app/studio/page.tsx, а импорт значения из клиентского модуля вернул бы в серверный
 * компонент клиентскую ссылку вместо строки.
 */

/** Заставка показывается при каждой загрузке страницы; пропускается только при prefers-reduced-motion. */
export const STUDIO_INTRO_ATTR = "data-st-intro";

/**
 * Решение «показывать ли заставку» принимается ДО первой отрисовки: скрипт стоит в разметке перед
 * контентом и ставит атрибут на `<html>`, а CSS показывает заставку только при `play`. Иначе
 * повторный посетитель видел бы вспышку чёрного экрана до гидрации, а первый — сначала пустую
 * страницу, потом заставку. Без JS заставки нет вовсе (по умолчанию она скрыта).
 */
export const STUDIO_INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;d.setAttribute("${STUDIO_INTRO_ATTR}",r?"skip":"play");}catch(e){d.setAttribute("${STUDIO_INTRO_ATTR}","skip");}})();`;
