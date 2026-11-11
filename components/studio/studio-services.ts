/**
 * Страница «Услуги» (/services/, /en/services/, /tj/services/) на трёх языках сайта.
 * Услуги разложены от задачи бизнеса: какая проблема, какое направление, срок и цена «от».
 * Цены и сроки пакетов берутся из блока «Пакеты и цены» на главной (UI[locale].pricing),
 * чтобы не расходиться со страницей цен.
 */

import type { Metadata } from "next";

import { STUDIO_SITE_URL } from "./studio-content";
import { LOCALES, LOCALE_HTML, LOCALE_OG, LOCALE_PATH, UI, type Locale } from "./studio-i18n";

/** Адрес страницы услуг на языке `locale`, без basePath: «/services/», «/en/services/». */
export const servicesPath = (locale: Locale) => `${LOCALE_PATH[locale]}services/`;

/** Превью ссылки на страницу (1200×630): пока общее с главной. */
export const SERVICES_OG_IMAGE = { url: "/studio/og/home.png", width: 1200, height: 630 };

export type ServiceDirection = {
  title: string;
  /** Задача клиента, с которой начинается направление. */
  need: string;
  text: string;
  tags: readonly string[];
  term: string;
  price: string;
  /** Карточка игр: на русском ведёт на страницу промо-игр. */
  promo?: boolean;
};

export type ServicesContent = {
  meta: { title: string; description: string };
  back: string;
  nav: string;
  worksLink: string;
  label: string;
  title: readonly [string, string];
  lead: string;
  cta: string;
  ctaSecondary: string;
  note: string;
  chooseLabel: string;
  chooseTitle: string;
  chooseText: string;
  /** Кавычки вокруг задачи клиента в карточке: «…» или “…”. */
  quotes: readonly [string, string];
  termLabel: string;
  priceLabel: string;
  discuss: string;
  promoMore: string;
  directions: readonly ServiceDirection[];
  changeTitle: string;
  changeText: string;
  changeCols: readonly [string, string, string];
  changes: readonly { area: string; before: string; after: string }[];
  benefits: readonly { title: string; text: string }[];
  planText: string;
  planCta: string;
  casesTitle: string;
  casesText: string;
  pricesTitle: string;
  pricesText: string;
  pricesCta: string;
};

/** Цены и сроки пакетов главной: лендинг, промо-игра, сайт под ключ. */
function plans(locale: Locale) {
  const [landing, promo, turnkey] = UI[locale].pricing.plans;
  return { landing, promo, turnkey };
}

const ru = plans("ru");
const en = plans("en");
const tj = plans("tj");

const RU: ServicesContent = {
  meta: {
    title: "Услуги: сайты, магазины, MVP, дизайн, брендинг и игры — Студия Леммус",
    description:
      "Что делает Студия Леммус: сайты и лендинги, интернет-магазины, веб-сервисы и MVP, UI/UX-дизайн, брендинг и игры. Начинаем с задачи бизнеса, а не со списка технологий. Сроки и цены «от» для каждого направления.",
  },
  back: "На главную",
  nav: "Услуги",
  worksLink: "Все работы",
  label: "Услуги / по задаче бизнеса",
  title: ["Не выбирайте услугу.", "Начните с задачи."],
  lead: "Не заставляем выбирать между технологиями. Сначала разбираемся, что должно измениться для ваших клиентов, команды или бизнеса, и только потом предлагаем решение.",
  cta: "Подобрать решение",
  ctaSecondary: "Обсудить задачу",
  note: "Если задача касается нескольких направлений, собираем один проект без стыков: дизайн, код и запуск ведёт одна команда.",
  chooseLabel: "С чего начать",
  chooseTitle: "Что должно работать лучше, чем сейчас?",
  chooseText: "Выберите задачу, которая ближе всего к вашей. Если не уверены, разберём её на созвоне.",
  quotes: ["«", "»"],
  termLabel: "Срок",
  priceLabel: "Цена",
  discuss: "Обсудить",
  promoMore: "Подробнее",
  directions: [
    {
      title: "Сайты и лендинги",
      need: "Нужно понятно рассказать о продукте и получать заявки",
      text: "Структура, тексты, дизайн и разработка. Сайтом потом легко управлять самим.",
      tags: ["структура", "тексты", "дизайн", "разработка"],
      term: ru.landing.term,
      price: ru.landing.price,
    },
    {
      title: "Интернет-магазины и каталоги",
      need: "Нужно, чтобы клиенты сами находили товар и оформляли заказ",
      text: "Каталог с фильтрами, корзина, оплата и обмен с 1С или складом поставщика.",
      tags: ["каталог", "корзина и оплата", "1С и склад", "аналитика"],
      term: ru.turnkey.term,
      price: ru.turnkey.price,
    },
    {
      title: "Веб-сервисы и MVP",
      need: "Нужно превратить идею в работающий продукт",
      text: "От гипотезы и прототипа до первой версии с личными кабинетами, ролями и админкой.",
      tags: ["продукт", "UX/UI", "фронтенд", "бэкенд"],
      term: "от 6 недель",
      price: ru.turnkey.price,
    },
    {
      title: "UI/UX-дизайн",
      need: "Пользователи путаются и не доходят до цели",
      text: "Сценарии, прототип, макеты и дизайн-система, с которыми удобно работать разработчикам.",
      tags: ["сценарии", "прототип", "макеты", "UI-кит"],
      term: "от 2 недель",
      price: "по смете",
    },
    {
      title: "Брендинг и айдентика",
      need: "Бренд выглядит по-разному в каждом канале",
      text: "Логотип, цвета, шрифты и правила, по которым команда соберёт любой носитель.",
      tags: ["логотип", "фирменный стиль", "гайд", "мерч"],
      term: "3–6 недель",
      price: "по смете",
    },
    {
      title: "Игры и промо-игры",
      need: "Нужно вовлечь аудиторию и привести её к покупке",
      text: "Промо-игры для акций, мини-игры в Telegram и казуальные игры для браузера.",
      tags: ["геймдизайн", "графика", "Telegram", "промокоды"],
      term: ru.promo.term,
      price: ru.promo.price,
      promo: true,
    },
  ],
  changeTitle: "Не список услуг, а то, что меняется",
  changeText: "Что было до проекта и что бизнес получает после запуска.",
  changeCols: ["Направление", "Было", "Стало"],
  changes: [
    { area: "Сайт", before: "Предложение сложно объяснить, посетители уходят с первого экрана", after: "Люди понимают ценность и оставляют заявку" },
    { area: "Магазин", before: "Заказы принимают вручную по телефону и в мессенджерах", after: "Клиенты сами выбирают, оплачивают и видят статус заказа" },
    { area: "Продукт", before: "Идея не проверена, процесс держится на таблицах", after: "Пользователи проходят ключевой сценарий в продукте" },
    { area: "Интерфейс", before: "Пользователи путаются и пишут в поддержку", after: "Человек не думает, куда нажать" },
    { area: "Бренд", before: "Каждый носитель оформлен по-своему", after: "Бренд узнают в любом канале" },
    { area: "Игра", before: "Акция — это просто скидка", after: "Покупатели играют, возвращаются и приходят с промокодом" },
  ],
  benefits: [
    { title: "Одна команда", text: "Дизайн, код и запуск ведут одни и те же люди, поэтому ничего не теряется на стыках." },
    { title: "Результат каждую неделю", text: "Показываем макеты и рабочие версии, а не отчёты." },
    { title: "Понятный следующий шаг", text: "Вы всегда знаете, что делаем сейчас и что будет дальше." },
  ],
  planText: "На первом созвоне разбираем задачу и говорим, какое направление нужно сейчас, а без чего можно обойтись.",
  planCta: "Получить план проекта",
  casesTitle: "Проекты, которые уже работают",
  casesText: "Сайты и сервисы, которые мы запустили для клиентов.",
  pricesTitle: "Сколько это стоит",
  pricesText: "Вилки бюджета, сроки по неделям и что входит в цену.",
  pricesCta: "Смотреть цены",
};

const EN: ServicesContent = {
  meta: {
    title: "Services: websites, stores, MVPs, design, branding and games — Lemmus Studio",
    description:
      "What Lemmus Studio does: websites and landing pages, online stores, web services and MVPs, UI/UX design, branding and games. We start with the business need, not a list of technologies. Timelines and starting prices for each area.",
  },
  back: "Back to home",
  nav: "Services",
  worksLink: "See all work",
  label: "Services / by business need",
  title: ["Don't pick a service.", "Start with the need."],
  lead: "We won't make you choose between technologies. First we work out what has to change for your customers, your team or the business, and only then propose a solution.",
  cta: "Find the right fit",
  ctaSecondary: "Discuss your task",
  note: "If the task spans several areas, we build one project with no gaps: design, code and launch are run by one team.",
  chooseLabel: "Where to start",
  chooseTitle: "What should work better than it does today?",
  chooseText: "Pick the need closest to yours. Not sure? We'll work it out on a call.",
  quotes: ["“", "”"],
  termLabel: "Timeline",
  priceLabel: "Price",
  discuss: "Discuss",
  promoMore: "Learn more",
  directions: [
    {
      title: "Websites and landing pages",
      need: "We need to explain the product clearly and get leads",
      text: "Structure, copy, design and development. You can easily manage the site yourself afterwards.",
      tags: ["structure", "copy", "design", "development"],
      term: en.landing.term,
      price: en.landing.price,
    },
    {
      title: "Online stores and catalogs",
      need: "Customers should find products and order on their own",
      text: "A catalog with filters, cart, payments and sync with 1C or the supplier's warehouse.",
      tags: ["catalog", "cart and payments", "1C and warehouse", "analytics"],
      term: en.turnkey.term,
      price: en.turnkey.price,
    },
    {
      title: "Web services and MVPs",
      need: "We need to turn the idea into a working product",
      text: "From hypothesis and prototype to a first version with customer accounts, roles and an admin panel.",
      tags: ["product", "UX/UI", "frontend", "backend"],
      term: "from 6 weeks",
      price: en.turnkey.price,
    },
    {
      title: "UI/UX design",
      need: "Users get lost and don't reach their goal",
      text: "User flows, prototype, screens and a design system that developers find easy to work with.",
      tags: ["user flows", "prototype", "screens", "UI kit"],
      term: "from 2 weeks",
      price: "by estimate",
    },
    {
      title: "Branding and identity",
      need: "The brand looks different in every channel",
      text: "Logo, colors, typefaces and rules your team can use to build any asset.",
      tags: ["logo", "visual identity", "guidelines", "merch"],
      term: "3–6 weeks",
      price: "by estimate",
    },
    {
      title: "Games and promo games",
      need: "We need to engage the audience and lead it to a purchase",
      text: "Promo games for campaigns, Telegram mini games and casual browser games.",
      tags: ["game design", "graphics", "Telegram", "promo codes"],
      term: en.promo.term,
      price: en.promo.price,
      promo: true,
    },
  ],
  changeTitle: "Not a list of services, but what changes",
  changeText: "What it was like before the project and what the business gets after launch.",
  changeCols: ["Area", "Before", "After"],
  changes: [
    { area: "Website", before: "The offer is hard to explain, visitors leave from the first screen", after: "People see the value and get in touch" },
    { area: "Store", before: "Orders are taken by hand over the phone and in messengers", after: "Customers choose, pay and track their order on their own" },
    { area: "Product", before: "The idea is untested, the process lives in spreadsheets", after: "Users complete the key journey inside the product" },
    { area: "Interface", before: "Users get lost and write to support", after: "People don't have to think about where to click" },
    { area: "Brand", before: "Every asset is designed differently", after: "The brand is recognized in any channel" },
    { area: "Game", before: "A campaign is just a discount", after: "Customers play, come back and arrive with a promo code" },
  ],
  benefits: [
    { title: "One team", text: "The same people run design, code and launch, so nothing gets lost in hand-offs." },
    { title: "Results every week", text: "We show screens and working versions, not reports." },
    { title: "A clear next step", text: "You always know what we're doing now and what comes next." },
  ],
  planText: "On the first call we break the task down and tell you which area you need now and what you can skip.",
  planCta: "Get a project plan",
  casesTitle: "Projects already at work",
  casesText: "Websites, services and games we've launched for clients.",
  pricesTitle: "What it costs",
  pricesText: "Budget ranges, week-by-week timelines and what the price includes.",
  pricesCta: "See pricing",
};

const TJ: ServicesContent = {
  meta: {
    title: "Хизматҳо: сайтҳо, мағозаҳо, MVP, дизайн, брендинг ва бозиҳо — Студияи Леммус",
    description:
      "Студияи Леммус чӣ кор мекунад: сайтҳо ва лендингҳо, мағозаҳои онлайн, веб-хизматрасониҳо ва MVP, дизайни UI/UX, брендинг ва бозиҳо. Аз вазифаи тиҷорат оғоз мекунем, на аз рӯйхати технологияҳо. Мӯҳлат ва нархи «аз» барои ҳар самт.",
  },
  back: "Ба саҳифаи асосӣ",
  nav: "Хизматҳо",
  worksLink: "Ҳамаи корҳо",
  label: "Хизматҳо / аз рӯи вазифаи тиҷорат",
  title: ["Хизматро интихоб накунед.", "Аз вазифа оғоз кунед."],
  lead: "Шуморо маҷбур намекунем, ки байни технологияҳо интихоб кунед. Аввал мефаҳмем, ки барои мизоҷон, даста ё тиҷорати шумо чӣ бояд тағйир ёбад, ва танҳо баъд роҳи ҳалро пешниҳод мекунем.",
  cta: "Роҳи ҳалро интихоб кардан",
  ctaSecondary: "Вазифаро муҳокима кардан",
  note: "Агар вазифа ба якчанд самт дахл дошта бошад, як лоиҳаи ягона бе фосила месозем: дизайн, код ва оғозро як даста пеш мебарад.",
  chooseLabel: "Аз куҷо оғоз кард",
  chooseTitle: "Чӣ бояд беҳтар аз ҳозира кор кунад?",
  chooseText: "Вазифаеро интихоб кунед, ки ба вазифаи шумо наздиктар аст. Агар боварӣ надошта бошед, онро дар сӯҳбат муҳокима мекунем.",
  quotes: ["«", "»"],
  termLabel: "Мӯҳлат",
  priceLabel: "Нарх",
  discuss: "Муҳокима",
  promoMore: "Муфассал",
  directions: [
    {
      title: "Сайтҳо ва лендингҳо",
      need: "Бояд дар бораи маҳсулот фаҳмо нақл кард ва дархост гирифт",
      text: "Сохтор, матнҳо, дизайн ва таҳия. Баъд сайтро худатон ба осонӣ идора мекунед.",
      tags: ["сохтор", "матнҳо", "дизайн", "таҳия"],
      term: tj.landing.term,
      price: tj.landing.price,
    },
    {
      title: "Мағозаҳои онлайн ва каталогҳо",
      need: "Мизоҷон бояд худашон молро ёбанд ва фармоиш диҳанд",
      text: "Каталог бо филтрҳо, сабад, пардохт ва мубодила бо 1С ё анбори таъминкунанда.",
      tags: ["каталог", "сабад ва пардохт", "1С ва анбор", "таҳлил"],
      term: tj.turnkey.term,
      price: tj.turnkey.price,
    },
    {
      title: "Веб-хизматрасониҳо ва MVP",
      need: "Бояд ғояро ба маҳсулоти корӣ табдил дод",
      text: "Аз фарзия ва прототип то версияи аввал бо кабинетҳои шахсӣ, нақшҳо ва панели админ.",
      tags: ["маҳсулот", "UX/UI", "фронтенд", "бэкенд"],
      term: "аз 6 ҳафта",
      price: tj.turnkey.price,
    },
    {
      title: "Дизайни UI/UX",
      need: "Корбарон гум мешаванд ва ба мақсад намерасанд",
      text: "Сенарияҳо, прототип, макетҳо ва дизайн-система, ки бо онҳо кор кардан барои барномасозон осон аст.",
      tags: ["сенарияҳо", "прототип", "макетҳо", "UI-кит"],
      term: "аз 2 ҳафта",
      price: "аз рӯи смета",
    },
    {
      title: "Брендинг ва айдентика",
      need: "Бренд дар ҳар канал гуногун менамояд",
      text: "Логотип, рангҳо, шрифтҳо ва қоидаҳое, ки даста бо онҳо ҳар гуна маводро месозад.",
      tags: ["логотип", "услуби фирмавӣ", "дастур", "мерч"],
      term: "3–6 ҳафта",
      price: "аз рӯи смета",
    },
    {
      title: "Бозиҳо ва бозиҳои промо",
      need: "Бояд аудиторияро ҷалб кард ва ба харид овард",
      text: "Бозиҳои промо барои аксияҳо, мини-бозиҳо дар Telegram ва бозиҳои казуалӣ барои браузер.",
      tags: ["геймдизайн", "графика", "Telegram", "промокодҳо"],
      term: tj.promo.term,
      price: tj.promo.price,
      promo: true,
    },
  ],
  changeTitle: "На рӯйхати хизматҳо, балки он чи тағйир меёбад",
  changeText: "Пеш аз лоиҳа чӣ буд ва тиҷорат пас аз оғоз чӣ мегирад.",
  changeCols: ["Самт", "Буд", "Шуд"],
  changes: [
    { area: "Сайт", before: "Пешниҳодро фаҳмондан душвор аст, меҳмонон аз экрани аввал мераванд", after: "Одамон арзишро мефаҳманд ва дархост мегузоранд" },
    { area: "Мағоза", before: "Фармоишҳоро дастӣ тавассути телефон ва мессенҷерҳо қабул мекунанд", after: "Мизоҷон худашон интихоб, пардохт ва ҳолати фармоишро пайгирӣ мекунанд" },
    { area: "Маҳсулот", before: "Ғоя санҷида нашудааст, раванд дар ҷадвалҳо аст", after: "Корбарон сенарияи асосиро дар маҳсулот анҷом медиҳанд" },
    { area: "Интерфейс", before: "Корбарон гум мешаванд ва ба дастгирӣ менависанд", after: "Одам фикр намекунад, ки куҷо пахш кунад" },
    { area: "Бренд", before: "Ҳар мавод ба таври худ тарҳрезӣ шудааст", after: "Брендро дар ҳар канал мешиносанд" },
    { area: "Бозӣ", before: "Аксия — ин танҳо тахфиф", after: "Харидорон бозӣ мекунанд, бармегарданд ва бо промокод меоянд" },
  ],
  benefits: [
    { title: "Як даста", text: "Дизайн, код ва оғозро ҳамон одамон пеш мебаранд, бинобар ин дар байни марҳилаҳо чизе гум намешавад." },
    { title: "Натиҷа ҳар ҳафта", text: "Макетҳо ва версияҳои кориро нишон медиҳем, на ҳисобот." },
    { title: "Қадами навбатии равшан", text: "Шумо ҳамеша медонед, ки ҳозир чӣ мекунем ва баъд чӣ мешавад." },
  ],
  planText: "Дар сӯҳбати аввал вазифаро таҳлил мекунем ва мегӯем, ки ҳозир кадом самт лозим аст ва бе чӣ кор гузаронидан мумкин.",
  planCta: "Нақшаи лоиҳаро гирифтан",
  casesTitle: "Лоиҳаҳое, ки аллакай кор мекунанд",
  casesText: "Сайтҳо, хизматрасониҳо ва бозиҳое, ки барои мизоҷон оғоз кардем.",
  pricesTitle: "Ин чанд арзиш дорад",
  pricesText: "Доираҳои буҷет, мӯҳлатҳо аз рӯи ҳафтаҳо ва он чи ба нарх дохил мешавад.",
  pricesCta: "Нархҳоро дидан",
};

export const SERVICES: Record<Locale, ServicesContent> = { ru: RU, en: EN, tj: TJ };

/** Метаданные страницы услуг: канонический адрес, ссылки на другие языки и превью. */
export function servicesMetadata(locale: Locale): Metadata {
  const { title, description } = SERVICES[locale].meta;
  const url = `${STUDIO_SITE_URL}${servicesPath(locale)}`;
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HTML[l], `${STUDIO_SITE_URL}${servicesPath(l)}`]));
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { type: "website", locale: LOCALE_OG[locale], url, title, description, images: [SERVICES_OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SERVICES_OG_IMAGE.url] },
  };
}

/** Направления как список услуг студии (с ценой «от», где она есть) и путь от главной — для сниппета в поиске. */
export function servicesJsonLd(locale: Locale) {
  const S = SERVICES[locale];
  const url = `${STUDIO_SITE_URL}${servicesPath(locale)}`;
  const provider = { "@type": "ProfessionalService", "@id": `${STUDIO_SITE_URL}/#service` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": `${url}#services`,
        name: S.meta.title,
        url,
        itemListElement: S.directions.map((d, i) => {
          const min = Number(d.price.replace(/\D/g, ""));
          return {
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: d.title,
              description: d.text,
              provider,
              ...(min ? { offers: { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", minPrice: min, priceCurrency: "RUB" } } } : {}),
            },
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          // Название студии — вторая половина заголовка («… — Студия Леммус»).
          { "@type": "ListItem", position: 1, name: S.meta.title.split(" — ").pop(), item: `${STUDIO_SITE_URL}${LOCALE_PATH[locale]}` },
          { "@type": "ListItem", position: 2, name: S.nav, item: url },
        ],
      },
    ],
  };
}
