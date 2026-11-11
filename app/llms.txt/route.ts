/**
 * /llms.txt — справка о студии для ИИ-поисковиков и ассистентов (ChatGPT, Perplexity, Claude, Алиса):
 * кто мы, что делаем, сколько стоит, кейсы и адреса страниц. Формат — llmstxt.org: Markdown с заголовком,
 * цитатой-описанием и списками ссылок. Собирается из тех же данных, что и страницы, поэтому не расходится
 * с сайтом. В статической сборке становится обычным файлом out/llms.txt.
 */

import { STUDIO_CASES } from "@/components/studio/studio-cases";
import { STUDIO_CONTACT_EMAIL, STUDIO_CONTACT_TG, STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { LOCALE_PATH, UI, localizeContent } from "@/components/studio/studio-i18n";
import { PRICING, pricingPath } from "@/components/studio/studio-pricing";
import { SERVICES, servicesPath } from "@/components/studio/studio-services";

export const dynamic = "force-static";

const abs = (path: string) => `${STUDIO_SITE_URL}${path}`;

function build(): string {
  const ru = localizeContent("ru");
  const services = SERVICES.ru;
  const pricing = PRICING.ru;
  const lines: string[] = [
    "# Студия Леммус (Lemmus Studio)",
    "",
    "> Студия Леммус — студия разработки сайтов, интерфейсов, брендинга, цифровых продуктов и казуальных игр. " +
      "Больше 12 лет опыта и 50+ проектов. Работаем удалённо с клиентами из России и других стран. " +
      "Сайт студии на трёх языках: русский, английский (Lemmus Studio) и таджикский (Студияи Леммус).",
    "",
    "Студия ведёт проект целиком: задача и структура, дизайн и прототип, разработка, запуск и поддержка. " +
      "Дизайн и код делает одна команда, без передачи на сторону. У студии есть собственный продукт — " +
      "платформа Lemnity (https://lemnity.ru) для создания сайтов, чат-ботов и цифровых продуктов.",
    "",
    "## Услуги",
    "",
    ...services.directions.map((d) => `- **${d.title}** — ${d.text} Срок: ${d.term}. Стоимость: ${d.price}.`),
    "",
    "## Пакеты и цены",
    "",
    ...UI.ru.pricing.plans.map((p) => `- **${p.name}** — ${p.price}, ${p.term}. ${p.text}`),
    "",
    `Подробнее о ценах, этапах оплаты и том, что входит в работу: ${abs(pricingPath("ru"))}`,
    "",
    "## Кейсы",
    "",
    ...STUDIO_CASES.map((c) => `- [${c.title}](${abs(`/cases/${c.slug}/`)}): ${c.lead}`),
    "",
    "## Страницы",
    "",
    `- [Главная](${abs(LOCALE_PATH.ru)}): кто мы, проекты, услуги, цены, вопросы и форма заявки`,
    `- [Услуги](${abs(servicesPath("ru"))}): ${services.meta.description}`,
    `- [Цены](${abs(pricingPath("ru"))}): ${pricing.meta.description}`,
    `- [Работы](${abs(`${LOCALE_PATH.ru}works/`)}): всё портфолио — сайты, интерфейсы, приложения, брендинг и игры`,
    `- [Промо-игры для брендов](${abs("/promo-game/")}): игровые механики для акций и привлечения клиентов`,
    `- [English version](${abs(LOCALE_PATH.en)}): Lemmus Studio — website development, UI/UX design, branding and games`,
    `- [Тоҷикӣ](${abs(LOCALE_PATH.tj)}): Студияи Леммус`,
    "",
    "## Частые вопросы",
    "",
    ...ru.faq.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Контакты",
    "",
    `- Сайт: ${abs("/")}`,
    `- Telegram: ${STUDIO_CONTACT_TG}`,
    `- Почта: ${STUDIO_CONTACT_EMAIL}`,
    `- Заявка: форма «Обсудим проект» внизу любой страницы сайта`,
    "",
  ];
  return lines.join("\n");
}

export function GET() {
  return new Response(build(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
