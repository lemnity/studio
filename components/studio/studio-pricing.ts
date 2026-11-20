/**
 * Страница «Цены» (/pricing/, /en/pricing/, /tj/pricing/) на трёх языках сайта.
 * Пакеты берутся из блока «Пакеты и цены» на главной (UI[locale].pricing), здесь к ним добавлены
 * обычные вилки бюджета, сроки по неделям, форматы оплаты и вопросы о деньгах.
 * Цены везде в рублях, как и в блоке на главной.
 */

import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "./studio-content";
import { LOCALES, LOCALE_HTML, LOCALE_OG, LOCALE_PATH, UI, type Locale } from "./studio-i18n";

/** Адрес страницы цен на языке `locale`, без basePath: «/pricing/», «/en/pricing/». */
export const pricingPath = (locale: Locale) => `${LOCALE_PATH[locale]}pricing/`;

/** Превью ссылки на страницу (1200×630): пока общее с главной. */
export const PRICING_OG_IMAGE = { url: "/studio/og/home.png", width: 1200, height: 630 };

/** Пакет страницы цен: карточка с главной плюс обычная вилка бюджета и короткое имя для таблицы. */
export type PricingPackage = (typeof UI.ru.pricing.plans)[number] & { short: string; range: string; cta: string };

/** Отметка в таблице «Что входит всегда»: входит, по запросу или не нужно. */
export type CompareMark = "yes" | "request" | "no";

type Step = { when: string; title: string; see: string; pay?: string };
/** Решение под задачу. `cases` — slug кейсов из STUDIO_CASES, которые его подтверждают. */
type Solution = { name: string; price: string; term: string; text: string; cases: readonly string[] };
type Format = { name: string; fit: string; cost: string; pay: string; extra: string };

export type PricingContent = {
  meta: { title: string; description: string };
  /** Подписи вне блоков: ссылка назад, пункт подвала, ссылка с главной, ссылка на работы. */
  back: string;
  nav: string;
  homeLink: string;
  worksLink: string;
  /** Слово перед ценой («от 70 000 ₽»): в полосе бюджетов цены показаны без него. */
  from: string;
  includedAria: string;
  itemCol: string;
  label: string;
  title: readonly [string, string];
  lead: string;
  cta: string;
  seePackages: string;
  budgetsTitle: string;
  stats: readonly { value: string; label: string }[];
  packagesTitle: string;
  packagesText: string;
  rangeLabel: string;
  packages: readonly PricingPackage[];
  care: Omit<PricingPackage, "short" | "range"> & { label: string };
  /** Решения под типовые задачи клиентов: своя вилка, срок и кейсы, где мы это уже делали. */
  solutions: { title: string; text: string; caseLabel: string; cta: string; items: readonly Solution[] };
  timelineTitle: string;
  timelineText: string;
  timelineSee: string;
  timeline: readonly Step[];
  payLabel: string;
  extrasTitle: string;
  extrasPoints: readonly { title: string; text: string }[];
  receipt: {
    title: string;
    elsewhere: string;
    withUs: string;
    rows: readonly { item: string; elsewhere: string }[];
    included: string;
    total: string;
    totalValue: string;
  };
  formatsTitle: string;
  formatsText: string;
  formats: readonly Format[];
  formatLabels: Record<"fit" | "cost" | "pay" | "extra", string>;
  compareTitle: string;
  /** Подписи строк таблицы; отметки по пакетам — в COMPARE_MARKS, они одни для всех языков. */
  compareRows: readonly string[];
  compareLegend: Record<CompareMark, string>;
  compareNote: string;
  casesTitle: string;
  casesText: string;
  faqTitle: string;
  faq: readonly { q: string; a: string }[];
};

/** Отметки таблицы «Что входит всегда» по строкам; столбцы — пакеты в порядке PRICING[locale].packages. */
export const COMPARE_MARKS: readonly (readonly CompareMark[])[] = [
  ["yes", "yes", "yes"],
  ["yes", "yes", "yes"],
  ["yes", "yes", "yes"],
  ["yes", "yes", "yes"],
  ["yes", "yes", "yes"],
  ["request", "yes", "request"],
  ["no", "yes", "yes"],
  ["yes", "yes", "yes"],
];

/** Пакеты главной в порядке страницы цен (сайт, под ключ, игра) и поддержка отдельно. */
function plans(locale: Locale) {
  const [landing, promo, turnkey, care] = UI[locale].pricing.plans;
  return { landing, promo, turnkey, care };
}

const ru = plans("ru");
const en = plans("en");
const tj = plans("tj");

const RU: PricingContent = {
  meta: {
    title: "Цены на разработку сайтов и игр — Студия Леммус",
    description:
      "Сколько стоит сайт, интернет-магазин или промо-игра в Студии Леммус: лендинг от 70 000 ₽, сайт под ключ от 250 000 ₽, промо-игра от 150 000 ₽. Вилки бюджета, сроки по неделям и что входит в цену.",
  },
  back: "На главную",
  nav: "Цены",
  homeLink: "Все цены, сроки и форматы оплаты",
  worksLink: "Все работы",
  from: "от",
  includedAria: "Что входит",
  itemCol: "Что",
  label: "Цены и сметы",
  title: ["Цена — это", "размер задачи"],
  lead: "Мы не самые дешёвые, а самые предсказуемые: смета фиксируется в договоре, сайт под ключ запускаем за шесть недель, а ИИ встраиваем там, где он экономит вам работу. Ниже — реальные вилки бюджета и что в них входит.",
  cta: "Получить точную смету",
  seePackages: "Смотреть пакеты",
  budgetsTitle: "Обычные бюджеты проектов",
  stats: [
    { value: "3", label: "формата работы" },
    { value: "1 день", label: "на смету после созвона" },
    { value: "0 ₽", label: "стоит первый созвон" },
  ],
  packagesTitle: "Пакеты и вилки",
  packagesText: "Цена «от» — нижняя граница, вилка — то, во что обычно укладываются проекты этого типа.",
  rangeLabel: "Обычно",
  packages: [
    { ...ru.landing, short: "Лендинг", range: "70 000 – 150 000 ₽", cta: "Обсудить сайт" },
    { ...ru.turnkey, short: "Под ключ", range: "250 000 – 1 500 000 ₽", cta: "Обсудить проект" },
    { ...ru.promo, short: "Промо-игра", range: "150 000 – 500 000 ₽", cta: "Обсудить игру" },
  ],
  care: {
    ...ru.care,
    label: "Дополнительно",
    text: "После запуска: правки, мелкие задачи, обновления и приоритет в очереди. Оплачивается отдельно, отказаться можно в любой месяц.",
    cta: "Добавить поддержку",
  },
  solutions: {
    title: "Решения под задачу",
    text: "Готовые сценарии для частых задач: известны вилка, срок и проект, где мы это уже делали.",
    caseLabel: "Кейс",
    cta: "Обсудить",
    items: [
      {
        name: "Аудит старого сайта и план переезда",
        price: "до 30 000 ₽",
        term: "3–5 дней",
        text: "Смотрим, что на сайте работает, что мешает заявкам и как переехать без потери данных и позиций в поиске. Стоимость аудита засчитываем в проект.",
        cases: ["dom-nauki"],
      },
      {
        name: "Свой магазин вместо маркетплейса",
        price: "250 000 – 600 000 ₽",
        term: "4–6 недель",
        text: "Каталог из выгрузки маркетплейса или склада, своя оплата и своя база покупателей — без комиссий и штрафов площадки.",
        cases: ["prostyle"],
      },
      {
        name: "Сайт или личный кабинет с переездом",
        price: "500 000 – 1 500 000 ₽",
        term: "6–12 недель",
        text: "Новый сайт или кабинет на смену системе из 2000-х: переезд без простоя, заявки и документы без ручной работы.",
        cases: ["dom-nauki", "turdus"],
      },
      {
        name: "ИИ-ассистент: заявки, консультации, CRM",
        price: "80 000 – 200 000 ₽ + от 10 000 ₽/мес",
        term: "2–3 недели",
        text: "Отвечает клиентам ночью и в выходные, подбирает товар или программу и передаёт заявку менеджеру в CRM.",
        cases: ["prostyle", "dom-nauki"],
      },
    ],
  },
  timelineTitle: "Шесть недель — и сайт работает",
  timelineText: "Обычный календарь сайта под ключ на 5–7 страниц. Каждую неделю показываем результат, а не отчёт.",
  timelineSee: "Что вы увидите",
  timeline: [
    { when: "1 неделя", title: "Старт и структура", see: "карта сайта и список страниц", pay: "50%" },
    { when: "2 неделя", title: "Прототип", see: "кликабельные схемы ключевых страниц" },
    { when: "3 неделя", title: "Дизайн", see: "главная и внутренние страницы в стиле бренда" },
    { when: "4–5 неделя", title: "Разработка", see: "рабочий сайт на тестовом адресе" },
    { when: "6 неделя", title: "Запуск", see: "сайт на вашем домене, аналитика и обучение", pay: "50%" },
    { when: "После запуска", title: "Гарантия", see: "30 дней исправляем недочёты бесплатно, в проектах от 500 000 ₽ — 90 дней" },
  ],
  payLabel: "оплата",
  extrasTitle: "Без скрытых доплат",
  extrasPoints: [
    { title: "Одна смета", text: "Цена фиксируется в договоре до старта. Новые задачи оцениваем отдельно и только с вашего согласия." },
    { title: "Правки входят", text: "Два круга правок на каждом этапе уже в цене: прототип, дизайн и готовый сайт." },
    { title: "Всё ваше", text: "Домен, хостинг, доступы и исходники оформлены на вас. Уйти от нас можно в любой момент." },
  ],
  receipt: {
    title: "Что обычно считают отдельно",
    elsewhere: "Обычно",
    withUs: "У нас",
    rows: [
      { item: "Версия для телефона", elsewhere: "+20–30%" },
      { item: "Второй круг правок", elsewhere: "почасово" },
      { item: "Исходники дизайна и кода", elsewhere: "за доплату" },
      { item: "Наценка на домен и хостинг", elsewhere: "до 50%" },
      { item: "Настройка аналитики", elsewhere: "отдельная услуга" },
      { item: "Исправления после запуска", elsewhere: "по тарифу" },
      { item: "Обучение работе с сайтом", elsewhere: "за доплату" },
    ],
    included: "входит",
    total: "Итого доплат",
    totalValue: "0 ₽",
  },
  formatsTitle: "Как можно работать",
  formatsText: "Формат выбираем на созвоне: от него зависит, как вы платите и как добавляются новые задачи.",
  formats: [
    {
      name: "Фиксированная смета",
      fit: "Понятная задача: сайт, магазин, игра к акции.",
      cost: "Известна до старта и не меняется.",
      pay: "50% на старте, 50% перед запуском.",
      extra: "Оцениваем отдельно, по согласованию.",
    },
    {
      name: "Спринты",
      fit: "Сервис или продукт, который растёт по ходу работы.",
      cost: "Складывается из спринтов по две недели.",
      pay: "За каждый спринт перед его началом.",
      extra: "Ставим в следующий спринт.",
    },
    {
      name: "Абонемент",
      fit: "Сайт уже работает, нужны регулярные доработки.",
      cost: "Фиксированная сумма в месяц, от 15 000 ₽.",
      pay: "Раз в месяц.",
      extra: "Берём в работу в пределах часов месяца.",
    },
  ],
  formatLabels: { fit: "Подходит", cost: "Стоимость", pay: "Оплата", extra: "Новые задачи" },
  compareTitle: "Что входит всегда",
  compareRows: [
    "Структура и прототип",
    "Дизайн в стиле бренда",
    "Версия для телефона",
    "Аналитика и цели",
    "Админка без программиста",
    "Интеграция с CRM",
    "Тестовый стенд",
    "30 дней гарантии",
  ],
  compareLegend: { yes: "Входит", request: "По запросу", no: "Не нужно" },
  compareNote: "Домен, хостинг, платные сервисы и рекламный бюджет оплачиваются напрямую поставщикам, без нашей наценки. Цены без НДС.",
  casesTitle: "Что получают за этот бюджет",
  casesText: "Проекты, которые мы запустили для клиентов.",
  faqTitle: "Вопросы о деньгах",
  faq: [
    {
      q: "Какая гарантия после запуска?",
      a: "30 дней бесплатно исправляем недочёты, в проектах от 500 000 ₽ — 90 дней. Срок гарантии прописываем в договоре. Дальше можно перейти на абонемент поддержки от 15 000 ₽ в месяц.",
    },
    {
      q: "Почему нельзя сразу назвать точную цену?",
      a: "Два сайта на пять страниц могут отличаться по цене вдвое: всё решают интеграции, количество уникальных макетов и тексты. После короткого созвона называем точную смету за один рабочий день и объясняем, из чего она складывается.",
    },
    {
      q: "Что оплачивается отдельно?",
      a: "Только то, что вы покупаете у поставщиков: домен, хостинг, платные плагины и сервисы, рекламу. Платите им напрямую, мы ничего не накручиваем. Поддержка после запуска — по желанию.",
    },
    {
      q: "Как устроена оплата?",
      a: "По договору, этапами: при фиксированной смете 50% на старте и 50% перед запуском. Работаем с юрлицами и ИП, оплата на расчётный счёт.",
    },
    {
      q: "Что будет, если задача поменяется по ходу?",
      a: "Оцениваем новую часть отдельно и показываем, как она влияет на цену и срок. В работу берём только после вашего согласия, поэтому итоговая сумма не становится сюрпризом.",
    },
    {
      q: "Можно начать с малого?",
      a: "Да. Можно начать с лендинга или прототипа, проверить идею на клиентах и потом развивать проект дальше: структура и дизайн сразу делаются с запасом на рост.",
    },
    {
      q: "Вы работаете с компаниями из других городов и стран?",
      a: "Да. Студия в Тюмени, а клиенты из разных городов России, ОАЭ и других стран. Если нужно, подписываем NDA до первого созвона.",
    },
  ],
};

const EN: PricingContent = {
  meta: {
    title: "Website and game development prices — Lemmus Studio",
    description:
      "What a website, online store or promo game costs at Lemmus Studio: landing pages from ₽70,000, turnkey websites from ₽250,000, promo games from ₽150,000. Budget ranges, week-by-week timelines and what the price includes.",
  },
  back: "Back to home",
  nav: "Pricing",
  homeLink: "All prices, timelines and payment formats",
  worksLink: "See all work",
  from: "from",
  includedAria: "What's included",
  itemCol: "Item",
  label: "Pricing and estimates",
  title: ["Price is", "the size of the job"],
  lead: "Not the cheapest, but the most predictable: the estimate is fixed in the contract, a turnkey site launches in six weeks, and we build in AI where it saves you work. Below are real budget ranges and what they include.",
  cta: "Get an exact estimate",
  seePackages: "See the packages",
  budgetsTitle: "Typical project budgets",
  stats: [
    { value: "3", label: "ways to work" },
    { value: "1 day", label: "for an estimate after the call" },
    { value: "₽0", label: "for the first call" },
  ],
  packagesTitle: "Packages and ranges",
  packagesText: "“From” is the lower bound; the range is where projects of this type usually land.",
  rangeLabel: "Usually",
  packages: [
    { ...en.landing, short: "Landing page", range: "₽70,000 – ₽150,000", cta: "Discuss a website" },
    { ...en.turnkey, short: "Turnkey", range: "₽250,000 – ₽1,500,000", cta: "Discuss a project" },
    { ...en.promo, short: "Promo game", range: "₽150,000 – ₽500,000", cta: "Discuss a game" },
  ],
  care: {
    ...en.care,
    label: "Add-on",
    text: "After launch: fixes, small tasks, updates and queue priority. Billed separately, cancel any month.",
    cta: "Add support",
  },
  solutions: {
    title: "Solutions for common tasks",
    text: "Ready scenarios for frequent requests: the range, the timeline and a project where we have already done it.",
    caseLabel: "Case",
    cta: "Discuss",
    items: [
      {
        name: "Audit of an old website and a migration plan",
        price: "up to ₽30,000",
        term: "3–5 days",
        text: "We check what works, what blocks leads and how to move without losing data or search rankings. The audit fee is credited to the project.",
        cases: ["dom-nauki"],
      },
      {
        name: "Your own store instead of a marketplace",
        price: "₽250,000 – ₽600,000",
        term: "4–6 weeks",
        text: "A catalogue from your marketplace or warehouse feed, your own payments and your own customer base — no platform fees or fines.",
        cases: ["prostyle"],
      },
      {
        name: "Website or customer portal with migration",
        price: "₽500,000 – ₽1,500,000",
        term: "6–12 weeks",
        text: "A new site or portal to replace a system from the 2000s: migration without downtime, leads and documents without manual work.",
        cases: ["dom-nauki", "turdus"],
      },
      {
        name: "AI assistant: leads, consulting, CRM",
        price: "₽80,000 – ₽200,000 + from ₽10,000/mo",
        term: "2–3 weeks",
        text: "Answers customers at night and on weekends, suggests a product or programme and hands the lead to a manager in your CRM.",
        cases: ["prostyle", "dom-nauki"],
      },
    ],
  },
  timelineTitle: "Six weeks to a live website",
  timelineText: "A typical calendar for a 5–7 page turnkey website. Every week we show results, not reports.",
  timelineSee: "What you'll see",
  timeline: [
    { when: "Week 1", title: "Kick-off and structure", see: "sitemap and page list", pay: "50%" },
    { when: "Week 2", title: "Prototype", see: "clickable wireframes of key pages" },
    { when: "Week 3", title: "Design", see: "home and inner pages in your brand style" },
    { when: "Weeks 4–5", title: "Development", see: "a working site on a staging address" },
    { when: "Week 6", title: "Launch", see: "the site on your domain, analytics and training", pay: "50%" },
    { when: "After launch", title: "Warranty", see: "30 days of free fixes, 90 days for projects from ₽500,000" },
  ],
  payLabel: "payment",
  extrasTitle: "No hidden extras",
  extrasPoints: [
    { title: "One estimate", text: "The price is fixed in the contract before we start. New tasks are estimated separately and only with your approval." },
    { title: "Revisions included", text: "Two rounds of revisions per phase are in the price: prototype, design and the finished site." },
    { title: "It's all yours", text: "Domain, hosting, credentials and source files are registered to you. You can leave us at any time." },
  ],
  receipt: {
    title: "What's usually billed extra",
    elsewhere: "Elsewhere",
    withUs: "With us",
    rows: [
      { item: "Mobile version", elsewhere: "+20–30%" },
      { item: "Second round of revisions", elsewhere: "hourly" },
      { item: "Design and code source files", elsewhere: "extra fee" },
      { item: "Markup on domain and hosting", elsewhere: "up to 50%" },
      { item: "Analytics setup", elsewhere: "separate service" },
      { item: "Fixes after launch", elsewhere: "billed" },
      { item: "Training on the site", elsewhere: "extra fee" },
    ],
    included: "included",
    total: "Total extras",
    totalValue: "₽0",
  },
  formatsTitle: "Ways to work",
  formatsText: "We pick the format on a call: it decides how you pay and how new tasks are added.",
  formats: [
    {
      name: "Fixed estimate",
      fit: "A clear task: a website, store or campaign game.",
      cost: "Known before the start and doesn't change.",
      pay: "50% at kick-off, 50% before launch.",
      extra: "Estimated separately, with your approval.",
    },
    {
      name: "Sprints",
      fit: "A service or product that grows as we work.",
      cost: "Made up of two-week sprints.",
      pay: "For each sprint, before it starts.",
      extra: "Go into the next sprint.",
    },
    {
      name: "Retainer",
      fit: "The site is live and needs regular improvements.",
      cost: "A fixed monthly fee, from ₽15,000.",
      pay: "Once a month.",
      extra: "Taken on within the month's hours.",
    },
  ],
  formatLabels: { fit: "Best for", cost: "Cost", pay: "Payment", extra: "New tasks" },
  compareTitle: "Always included",
  compareRows: [
    "Structure and prototype",
    "Design in your brand",
    "Mobile version",
    "Analytics and goals",
    "Admin panel, no developer needed",
    "CRM integration",
    "Staging environment",
    "30-day warranty",
  ],
  compareLegend: { yes: "Included", request: "On request", no: "Not needed" },
  compareNote: "Domain, hosting, paid services and ad budgets are paid directly to providers, with no markup from us. Prices exclude VAT.",
  casesTitle: "What this budget buys",
  casesText: "Websites, services and games we've launched for clients.",
  faqTitle: "Questions about money",
  faq: [
    {
      q: "What warranty do you give after launch?",
      a: "We fix defects for free for 30 days, and for 90 days on projects from ₽500,000. The warranty period is written into the contract. After that you can switch to a support plan from ₽15,000 a month.",
    },
    {
      q: "Why can't you name an exact price right away?",
      a: "Two five-page websites can differ in price by a factor of two: integrations, the number of unique layouts and the copy decide it. After a short call we give an exact estimate within one business day and explain what it's made of.",
    },
    {
      q: "What's billed separately?",
      a: "Only what you buy from providers: domain, hosting, paid plugins and services, advertising. You pay them directly, and we add no markup. Support after launch is optional.",
    },
    {
      q: "How does payment work?",
      a: "Under a contract, in stages: with a fixed estimate, 50% at kick-off and 50% before launch. We work with companies and sole proprietors and accept bank transfers.",
    },
    {
      q: "What if the scope changes mid-project?",
      a: "We estimate the new part separately and show how it affects the price and timeline. We only start it after your approval, so the final amount is never a surprise.",
    },
    {
      q: "Can we start small?",
      a: "Yes. You can start with a landing page or a prototype, test the idea with customers and grow the project from there: structure and design are built with room to grow.",
    },
    {
      q: "Do you work with companies from other cities and countries?",
      a: "Yes. The studio is in Tyumen, and our clients are across Russia, the UAE and other countries. If needed, we sign an NDA before the first call.",
    },
  ],
};

const TJ: PricingContent = {
  meta: {
    title: "Нархи сохтани сайтҳо ва бозиҳо — Студияи Леммус",
    description:
      "Сайт, мағозаи онлайн ё бозии промо дар Студияи Леммус чанд арзиш дорад: лендинг аз 70 000 ₽, сайти пурра аз 250 000 ₽, бозии промо аз 150 000 ₽. Доираи буҷет, мӯҳлатҳо аз рӯи ҳафтаҳо ва он чи ба нарх дохил мешавад.",
  },
  back: "Ба саҳифаи асосӣ",
  nav: "Нархҳо",
  homeLink: "Ҳамаи нархҳо, мӯҳлатҳо ва форматҳои пардохт",
  worksLink: "Ҳамаи корҳо",
  from: "аз",
  includedAria: "Чӣ дохил аст",
  itemCol: "Банд",
  label: "Нархҳо ва сметаҳо",
  title: ["Нарх —", "андозаи вазифа"],
  lead: "Мо арзонтарин нестем, балки пешбинишавандатарин: смета дар шартнома собит мешавад, сайти пурраро дар шаш ҳафта оғоз мекунем ва СИ-ро дар ҷое ҷорӣ мекунем, ки кори шуморо сарфа мекунад. Дар поён — доираҳои воқеии буҷет ва он чи ба онҳо дохил мешавад.",
  cta: "Сметаи дақиқ гирифтан",
  seePackages: "Бастаҳоро дидан",
  budgetsTitle: "Буҷетҳои маъмулии лоиҳаҳо",
  stats: [
    { value: "3", label: "формати кор" },
    { value: "1 рӯз", label: "барои смета пас аз сӯҳбат" },
    { value: "0 ₽", label: "сӯҳбати аввал" },
  ],
  packagesTitle: "Бастаҳо ва доираҳо",
  packagesText: "Нархи «аз» — ҳадди поён, доира — он чи лоиҳаҳои ин навъ одатан дар он ҷой мегиранд.",
  rangeLabel: "Одатан",
  packages: [
    { ...tj.landing, short: "Лендинг", range: "70 000 – 150 000 ₽", cta: "Сайтро муҳокима кардан" },
    { ...tj.turnkey, short: "Пурра", range: "250 000 – 1 500 000 ₽", cta: "Лоиҳаро муҳокима кардан" },
    { ...tj.promo, short: "Бозии промо", range: "150 000 – 500 000 ₽", cta: "Бозиро муҳокима кардан" },
  ],
  care: {
    ...tj.care,
    label: "Илова",
    text: "Пас аз оғоз: ислоҳҳо, вазифаҳои хурд, навсозӣ ва афзалият дар навбат. Алоҳида пардохт мешавад, ҳар моҳ метавонед бекор кунед.",
    cta: "Дастгириро илова кардан",
  },
  solutions: {
    title: "Ҳалҳо барои вазифаҳо",
    text: "Сенарияҳои тайёр барои вазифаҳои маъмул: доираи нарх, мӯҳлат ва лоиҳае, ки мо инро аллакай иҷро кардаем.",
    caseLabel: "Кейс",
    cta: "Муҳокима кардан",
    items: [
      {
        name: "Аудити сайти кӯҳна ва нақшаи гузариш",
        price: "то 30 000 ₽",
        term: "3–5 рӯз",
        text: "Месанҷем, ки дар сайт чӣ кор мекунад, чӣ ба дархостҳо халал мерасонад ва чӣ тавр бе гум кардани маълумот ва мавқеъ дар ҷустуҷӯ гузаштан мумкин аст. Арзиши аудит ба лоиҳа ҳисоб карда мешавад.",
        cases: ["dom-nauki"],
      },
      {
        name: "Мағозаи худ ба ҷои маркетплейс",
        price: "250 000 – 600 000 ₽",
        term: "4–6 ҳафта",
        text: "Каталог аз содироти маркетплейс ё анбор, пардохти худ ва пойгоҳи харидорони худ — бе комиссия ва ҷаримаҳои платформа.",
        cases: ["prostyle"],
      },
      {
        name: "Сайт ё кабинети шахсӣ бо гузариш",
        price: "500 000 – 1 500 000 ₽",
        term: "6–12 ҳафта",
        text: "Сайт ё кабинети нав ба ҷои системаи солҳои 2000-ум: гузариш бе танаффус, дархостҳо ва ҳуҷҷатҳо бе кори дастӣ.",
        cases: ["dom-nauki", "turdus"],
      },
      {
        name: "Ёрдамчии СИ: дархостҳо, машваратҳо, CRM",
        price: "80 000 – 200 000 ₽ + аз 10 000 ₽/моҳ",
        term: "2–3 ҳафта",
        text: "Шабона ва дар рӯзҳои истироҳат ба мизоҷон ҷавоб медиҳад, мол ё барномаро интихоб мекунад ва дархостро ба менеҷер дар CRM мефиристад.",
        cases: ["prostyle", "dom-nauki"],
      },
    ],
  },
  timelineTitle: "Шаш ҳафта — ва сайт кор мекунад",
  timelineText: "Тақвими маъмулии сайти пурра бо 5–7 саҳифа. Ҳар ҳафта натиҷаро нишон медиҳем, на ҳисобот.",
  timelineSee: "Шумо чӣ мебинед",
  timeline: [
    { when: "Ҳафтаи 1", title: "Оғоз ва сохтор", see: "харитаи сайт ва рӯйхати саҳифаҳо", pay: "50%" },
    { when: "Ҳафтаи 2", title: "Прототип", see: "схемаҳои кликшавандаи саҳифаҳои асосӣ" },
    { when: "Ҳафтаи 3", title: "Дизайн", see: "саҳифаи асосӣ ва дохилӣ дар услуби бренд" },
    { when: "Ҳафтаҳои 4–5", title: "Таҳия", see: "сайти корӣ дар суроғаи санҷишӣ" },
    { when: "Ҳафтаи 6", title: "Оғози сайт", see: "сайт дар домени шумо, таҳлил ва омӯзиш", pay: "50%" },
    { when: "Пас аз оғоз", title: "Кафолат", see: "30 рӯз камбудиҳоро ройгон ислоҳ мекунем, дар лоиҳаҳо аз 500 000 ₽ — 90 рӯз" },
  ],
  payLabel: "пардохт",
  extrasTitle: "Бе пардохтҳои пинҳонӣ",
  extrasPoints: [
    { title: "Як смета", text: "Нарх то оғози кор дар шартнома муқаррар мешавад. Вазифаҳои навро алоҳида ва танҳо бо розигии шумо арзёбӣ мекунем." },
    { title: "Ислоҳҳо дохиланд", text: "Ду даври ислоҳ дар ҳар марҳила аллакай дар нарх аст: прототип, дизайн ва сайти тайёр." },
    { title: "Ҳама аз они шумо", text: "Домен, хостинг, дастрасиҳо ва файлҳои манбаъ ба номи шумо сабт мешаванд. Ҳар вақт метавонед аз мо равед." },
  ],
  receipt: {
    title: "Он чи одатан алоҳида ҳисоб мекунанд",
    elsewhere: "Одатан",
    withUs: "Дар мо",
    rows: [
      { item: "Версия барои телефон", elsewhere: "+20–30%" },
      { item: "Даври дуюми ислоҳ", elsewhere: "соатбайъ" },
      { item: "Файлҳои манбаи дизайн ва код", elsewhere: "бо пардохт" },
      { item: "Иловапулӣ ба домен ва хостинг", elsewhere: "то 50%" },
      { item: "Танзими таҳлил", elsewhere: "хизмати алоҳида" },
      { item: "Ислоҳҳо пас аз оғоз", elsewhere: "аз рӯи тариф" },
      { item: "Омӯзиши кор бо сайт", elsewhere: "бо пардохт" },
    ],
    included: "дохил",
    total: "Ҳамагӣ пардохти иловагӣ",
    totalValue: "0 ₽",
  },
  formatsTitle: "Чӣ тавр кор кардан мумкин",
  formatsText: "Форматро дар сӯҳбат интихоб мекунем: аз он вобаста аст, ки чӣ тавр пардохт мекунед ва вазифаҳои нав чӣ тавр илова мешаванд.",
  formats: [
    {
      name: "Сметаи собит",
      fit: "Вазифаи равшан: сайт, мағоза, бозӣ барои аксия.",
      cost: "То оғоз маълум аст ва тағйир намеёбад.",
      pay: "50% дар оғоз, 50% пеш аз оғози сайт.",
      extra: "Алоҳида, бо розигии шумо арзёбӣ мекунем.",
    },
    {
      name: "Спринтҳо",
      fit: "Хизматрасонӣ ё маҳсулоте, ки дар ҷараёни кор меафзояд.",
      cost: "Аз спринтҳои дуҳафтаина иборат аст.",
      pay: "Барои ҳар спринт пеш аз оғози он.",
      extra: "Ба спринти навбатӣ мегузорем.",
    },
    {
      name: "Обуна",
      fit: "Сайт аллакай кор мекунад, такмили мунтазам лозим аст.",
      cost: "Маблағи собит дар як моҳ, аз 15 000 ₽.",
      pay: "Як бор дар як моҳ.",
      extra: "Дар доираи соатҳои моҳ иҷро мекунем.",
    },
  ],
  formatLabels: { fit: "Мувофиқ аст", cost: "Арзиш", pay: "Пардохт", extra: "Вазифаҳои нав" },
  compareTitle: "Ҳамеша дохил аст",
  compareRows: [
    "Сохтор ва прототип",
    "Дизайн дар услуби бренд",
    "Версия барои телефон",
    "Таҳлил ва ҳадафҳо",
    "Панели админ бе барномасоз",
    "Интегратсия бо CRM",
    "Муҳити санҷишӣ",
    "30 рӯз кафолат",
  ],
  compareLegend: { yes: "Дохил аст", request: "Бо дархост", no: "Лозим нест" },
  compareNote: "Домен, хостинг, хизматҳои пулакӣ ва буҷети реклама мустақиман ба таъминкунандагон пардохт мешаванд, бе иловапулии мо. Нархҳо бе ААИ.",
  casesTitle: "Бо ин буҷет чӣ мегиранд",
  casesText: "Сайтҳо, хизматрасониҳо ва бозиҳое, ки барои мизоҷон оғоз кардем.",
  faqTitle: "Саволҳо дар бораи пул",
  faq: [
    {
      q: "Пас аз оғоз чӣ кафолат медиҳед?",
      a: "30 рӯз камбудиҳоро ройгон ислоҳ мекунем, дар лоиҳаҳо аз 500 000 ₽ — 90 рӯз. Мӯҳлати кафолат дар шартнома навишта мешавад. Баъд метавонед ба обунаи дастгирӣ аз 15 000 ₽ дар як моҳ гузаред.",
    },
    {
      q: "Чаро нархи дақиқро фавран гуфтан мумкин нест?",
      a: "Ду сайти панҷсаҳифагӣ метавонанд аз рӯи нарх ду баробар фарқ кунанд: ҳамаашро интегратсияҳо, шумораи макетҳои нодир ва матнҳо ҳал мекунанд. Пас аз сӯҳбати кӯтоҳ сметаи дақиқро дар як рӯзи корӣ мегӯем ва мефаҳмонем, ки он аз чӣ иборат аст.",
    },
    {
      q: "Чӣ алоҳида пардохт мешавад?",
      a: "Танҳо он чи шумо аз таъминкунандагон мехаред: домен, хостинг, плагинҳо ва хизматҳои пулакӣ, реклама. Ба онҳо мустақиман пардохт мекунед, мо ҳеҷ чиз илова намекунем. Дастгирӣ пас аз оғоз — бо хоҳиши шумо.",
    },
    {
      q: "Пардохт чӣ тавр сурат мегирад?",
      a: "Бо шартнома, марҳила ба марҳила: ҳангоми сметаи собит 50% дар оғоз ва 50% пеш аз оғози сайт. Бо шахсони ҳуқуқӣ ва соҳибкорони инфиродӣ кор мекунем, пардохт ба суратҳисоби бонкӣ.",
    },
    {
      q: "Агар вазифа дар ҷараёни кор тағйир ёбад, чӣ мешавад?",
      a: "Қисми навро алоҳида арзёбӣ мекунем ва нишон медиҳем, ки он ба нарх ва мӯҳлат чӣ таъсир мерасонад. Танҳо пас аз розигии шумо ба кор мегирем, бинобар ин маблағи ниҳоӣ ногаҳонӣ намешавад.",
    },
    {
      q: "Оё аз хурд оғоз кардан мумкин аст?",
      a: "Ҳа. Метавонед аз лендинг ё прототип оғоз кунед, ғояро бо мизоҷон санҷед ва баъд лоиҳаро рушд диҳед: сохтор ва дизайн аз аввал бо захира барои рушд сохта мешаванд.",
    },
    {
      q: "Оё бо ширкатҳо аз шаҳрҳо ва кишварҳои дигар кор мекунед?",
      a: "Ҳа. Студия дар Тюмен ҷойгир аст, мизоҷон бошанд аз шаҳрҳои гуногуни Русия, АМА ва дигар кишварҳо. Агар лозим бошад, то сӯҳбати аввал NDA имзо мекунем.",
    },
  ],
};

export const PRICING: Record<Locale, PricingContent> = { ru: RU, en: EN, tj: TJ };

/** Метаданные страницы цен: канонический адрес, ссылки на другие языки и превью. */
export function pricingMetadata(locale: Locale): Metadata {
  const { title, description } = PRICING[locale].meta;
  const url = `${STUDIO_SITE_URL}${pricingPath(locale)}`;
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], `${STUDIO_SITE_URL}${pricingPath(l)}`]));
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { type: "website", locale: LOCALE_OG[locale], url, title, description, images: [PRICING_OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [PRICING_OG_IMAGE.url] },
  };
}

const rub = (s: string) => Number(s.replace(/\D/g, ""));

/** Пакеты с вилкой цен, вопросы о деньгах и путь от главной — для расширенного сниппета в поиске. */
export function pricingJsonLd(locale: Locale) {
  const P = PRICING[locale];
  const url = `${STUDIO_SITE_URL}${pricingPath(locale)}`;
  const home = `${STUDIO_SITE_URL}${LOCALE_PATH[locale]}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        "@id": `${url}#catalog`,
        name: P.meta.title,
        url,
        itemListElement: P.packages.map((p) => {
          const [min, max] = p.range.split("–").map(rub);
          return {
            "@type": "Offer",
            name: p.name,
            description: p.text,
            itemOffered: { "@type": "Service", name: p.name, provider: { "@type": "ProfessionalService", "@id": `${STUDIO_SITE_URL}/#service` } },
            priceSpecification: { "@type": "PriceSpecification", minPrice: min, maxPrice: max, priceCurrency: "RUB" },
          };
        }),
      },
      {
        "@type": "FAQPage",
        inLanguage: LOCALE_HTML[locale],
        mainEntity: P.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          // Название студии — вторая половина заголовка («… — Студия Леммус»).
          { "@type": "ListItem", position: 1, name: P.meta.title.split(" — ").pop(), item: home },
          { "@type": "ListItem", position: 2, name: P.nav, item: url },
        ],
      },
    ],
  };
}
