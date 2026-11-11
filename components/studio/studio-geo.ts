/**
 * Город посетителя для ссылки «Сайты в …» в подвале. Город определяет наш сервер (GET /api/geo в
 * server/lead/lead_service.py, база DB-IP Lite): в ответе английское название города и код страны.
 * IP никуда не сохраняется и не уходит третьим сторонам.
 *
 * Русскому нужен предложный падеж («в Москве»), автоматически его не построить, поэтому здесь список
 * городов с готовой формой. Город не из списка — остаётся город по умолчанию (страница «Сайты в Тюмени»).
 */

export const STUDIO_GEO_URL = (process.env.NEXT_PUBLIC_GEO_URL || "https://lemmus.studio/api/geo").replace(/\/+$/, "");

/** Ключ — английское название города из базы в нижнем регистре, без уточнения в скобках. */
export const GEO_CITY_IN: Record<string, string> = {
  moscow: "в Москве",
  "saint petersburg": "в Санкт-Петербурге",
  "st petersburg": "в Санкт-Петербурге",
  novosibirsk: "в Новосибирске",
  yekaterinburg: "в Екатеринбурге",
  kazan: "в Казани",
  "nizhniy novgorod": "в Нижнем Новгороде",
  "nizhny novgorod": "в Нижнем Новгороде",
  chelyabinsk: "в Челябинске",
  samara: "в Самаре",
  omsk: "в Омске",
  "rostov-on-don": "в Ростове-на-Дону",
  ufa: "в Уфе",
  krasnoyarsk: "в Красноярске",
  perm: "в Перми",
  voronezh: "в Воронеже",
  volgograd: "в Волгограде",
  krasnodar: "в Краснодаре",
  tyumen: "в Тюмени",
  surgut: "в Сургуте",
  tobolsk: "в Тобольске",
  kurgan: "в Кургане",
  "khanty-mansiysk": "в Ханты-Мансийске",
  nizhnevartovsk: "в Нижневартовске",
  "novy urengoy": "в Новом Уренгое",
  tomsk: "в Томске",
  barnaul: "в Барнауле",
  irkutsk: "в Иркутске",
  khabarovsk: "в Хабаровске",
  vladivostok: "во Владивостоке",
  kaliningrad: "в Калининграде",
  sochi: "в Сочи",
  minsk: "в Минске",
  almaty: "в Алматы",
  astana: "в Астане",
  tashkent: "в Ташкенте",
  samarkand: "в Самарканде",
  bishkek: "в Бишкеке",
  dushanbe: "в Душанбе",
  khujand: "в Худжанде",
  baku: "в Баку",
  yerevan: "в Ереване",
  tbilisi: "в Тбилиси",
  limassol: "в Лимасоле",
  nicosia: "в Никосии",
  dubai: "в Дубае",
  istanbul: "в Стамбуле",
};

/** «Moscow (Tsentralnyy administrativnyy okrug)» → «moscow». */
export const geoCityKey = (name: string) => name.replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase();
