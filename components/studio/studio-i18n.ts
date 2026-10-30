/**
 * Языки сайта: русский (основной, /), английский (/en/) и таджикский (/tj/, кириллица).
 * В адресе и в коде таджикский — `tj`; в атрибуте lang и hreflang — стандартный код языка `tg`.
 *
 * Здесь два слоя: подписи интерфейса (UI) на всех трёх языках и переводы контента для en и tj.
 * Русский контент остаётся источником правды в studio-content.ts; localizeContent() подставляет
 * переводы поверх него, сохраняя картинки, ссылки и порядок. Модуль без "use client": им пользуются
 * и страницы (метаданные, JSON-LD), и клиентские компоненты.
 */

import {
  STUDIO_CLIENTS,
  STUDIO_FAQ,
  STUDIO_PROCESS,
  STUDIO_PROJECTS,
  STUDIO_QUOTE,
  STUDIO_SERVICES,
  STUDIO_STATS,
  STUDIO_TOPICS,
  STUDIO_WORKS,
  type StudioProject,
  type StudioService,
  type StudioStat,
  type StudioWork,
} from "./studio-content";

export type Locale = "ru" | "en" | "tj";

export const LOCALES: readonly Locale[] = ["ru", "en", "tj"];
/** Путь страницы языка от корня сайта (без basePath). */
export const LOCALE_PATH: Record<Locale, string> = { ru: "/", en: "/en/", tj: "/tj/" };
/** Код языка для атрибута lang и hreflang (ISO 639-1): у таджикского это tg, хотя в адресе — tj. */
export const LOCALE_HTML: Record<Locale, string> = { ru: "ru", en: "en", tj: "tg" };
export const LOCALE_LABEL: Record<Locale, string> = { ru: "RU", en: "EN", tj: "TJ" };
export const LOCALE_NAME: Record<Locale, string> = { ru: "Русский", en: "English", tj: "Тоҷикӣ" };
export const LOCALE_OG: Record<Locale, string> = { ru: "ru_RU", en: "en_US", tj: "tg_TJ" };

export type Ui = {
  nav: readonly [projects: string, works: string, services: string, about: string, contacts: string];
  studio: string;
  homeAria: string;
  sectionsAria: string;
  languageAria: string;
  openMenu: string;
  closeMenu: string;
  menu: string;
  contacts: string;
  heroEyebrow: string;
  heroLines: readonly [string, string, string];
  /** Какая строка заголовка первого экрана выделена акцентом. */
  heroAccent: number;
  /** Множитель кегля заголовка первого экрана: длинные слова (таджикское «Мураккабро») иначе не влезают. */
  heroScale: number;
  heroText: string;
  /** Манифест после первого экрана; фрагменты в [квадратных скобках] выделяются акцентом. */
  manifesto: string;
  /** Блок «что можем сделать вместе» перед формой заявки: подпись и список через косую черту. */
  buildTitle: string;
  buildItems: readonly string[];
  seeWork: string;
  writeUs: string;
  heroSide: { top: readonly string[]; since: string; places: readonly string[] };
  openProject: (title: string) => string;
  cursorView: string;
  cursorOpen: string;
  soon: string;
  ourProduct: string;
  workTitle: string;
  workText: string;
  closeView: string;
  prevWork: string;
  nextWork: string;
  galleryTitle: string;
  galleryText: string;
  openWork: (alt: string) => string;
  clientsTitle: string;
  clientsText: string;
  logoInvite: readonly [string, string];
  servicesTitle: string;
  servicesText: string;
  included: string;
  processTitle: string;
  infinity: string;
  togetherAria: string;
  togetherLines: readonly string[];
  aboutHead: readonly [string, string];
  aboutText: string;
  discuss: string;
  faqTitle: string;
  form: {
    subject: (topic: string) => string;
    name: string;
    contact: string;
    topic: string;
    errName: string;
    errContact: string;
    errMessage: string;
    label: string;
    head: readonly [string, string];
    text: string;
    need: string;
    namePlaceholder: string;
    contactPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    consent: readonly [before: string, link: string, after: string];
  };
  orderProject: string;
  footerTagline: string;
  platform: string;
  privacy: string;
  linksAria: string;
  preloaderTagline: string;
  ticker: readonly string[];
  game: { aria: string; hint: string; praise: readonly string[] };
};

const RU: Ui = {
  nav: ["Проекты", "Работы", "Услуги", "О студии", "Контакты"],
  studio: "Студия",
  homeAria: "Лемнити Студия, наверх",
  sectionsAria: "Разделы",
  languageAria: "Язык",
  openMenu: "Открыть меню",
  closeMenu: "Закрыть меню",
  menu: "Меню",
  contacts: "Контакты",
  heroEyebrow: "Лемнити Студия · Разработка · UI/UX · Брендинг",
  heroLines: ["Делаем", "сложное", "простым."],
  heroAccent: 2,
  heroScale: 1,
  heroText: "Создаём сайты, интерфейсы, бренды, цифровые продукты и казуальные игры, которые помогают людям и бизнесу расти.",
  buildTitle: "Что мы можем сделать вместе",
  buildItems: [
    "корпоративный сайт", "лендинг", "интернет-магазин", "маркетплейс", "веб-приложение", "личный кабинет",
    "SaaS-платформа", "мобильное приложение", "дашборд", "CRM-система", "сервис бронирования", "внутренний инструмент",
    "AI-ассистент", "чат-бот", "MVP стартапа", "кликабельный прототип", "UX-аудит", "дизайн-система", "UI-кит",
    "логотип", "фирменный стиль", "брендбук", "мерч", "казуальная игра", "мини-игра в Telegram", "промо-игра",
    "геймификация", "анимация", "презентация", "контент для соцсетей",
  ],
  manifesto:
    "Лемнити Студия соединяет дизайн и технологии, чтобы создавать сайты, игры и [цифровые продукты]. От идеи до [UX], [UI], [кода] и запуска. За нами — [12 лет опыта] и команда, которой важны качество, ясность и смысл. Дизайнеры, которые думают как инженеры. Инженеры, которые проектируют с чувством. Вместе мы превращаем [сложное] в [простое], которое работает.",
  seeWork: "Смотреть работы",
  writeUs: "Написать нам",
  heroSide: { top: ["Идеи", "Продукты", "Люди"], since: "Лемнити Студия", places: ["Тюмень", "Россия", "Весь мир"] },
  openProject: (title) => `Открыть проект ${title}`,
  cursorView: "Смотреть",
  cursorOpen: "Открыть",
  soon: "Скоро",
  ourProduct: "Наш продукт",
  workTitle: "Избранные проекты",
  workText: "Продукты, бренды и цифровые решения, которые превращают идеи в работающие вещи.",
  closeView: "Закрыть просмотр",
  prevWork: "Предыдущая работа",
  nextWork: "Следующая работа",
  galleryTitle: "Галерея работ",
  galleryText: "Сайты, интерфейсы, приложения и брендинг: подборка работ разных лет.",
  openWork: (alt) => `Открыть работу: ${alt}`,
  clientsTitle: "Нам доверяют",
  clientsText: "Компании и команды, с которыми мы запускали бренды, сайты и продукты.",
  logoInvite: ["Здесь может быть", "ваш логотип →"],
  servicesTitle: "Чем мы занимаемся",
  servicesText: "Сайты, интерфейсы, бренды, цифровые продукты и игры: от идеи до запуска.",
  included: "Что входит",
  processTitle: "Как мы работаем",
  infinity: "бесконечность",
  togetherAria: "Давайте создадим что-то вместе: перейти к форме заявки",
  togetherLines: ["Давайте", "создадим", "что-то вместе"],
  aboutHead: ["Больше, чем", "дизайн"],
  aboutText:
    "Больше 12 лет в дизайне, продуктовой разработке и визуальных коммуникациях. Соединяем стратегию, дизайн и технологии, чтобы делать продукты с реальной пользой. На этом опыте выросла и наша платформа Lemnity.",
  discuss: "Обсудить проект",
  faqTitle: "Частые вопросы",
  form: {
    subject: (topic) => `Заявка в Лемнити Студию: ${topic}`,
    name: "Имя",
    contact: "Контакт",
    topic: "Тема",
    errName: "Укажите имя",
    errContact: "Укажите email или Telegram",
    errMessage: "Напишите пару слов о задаче, хотя бы 10 символов",
    label: "Контакты",
    head: ["Обсудим", "проект"],
    text: "Пара слов о задаче, и мы вернёмся с идеями, сроками и следующим шагом. Обычно отвечаем в течение дня.",
    need: "Что нужно",
    namePlaceholder: "Имя",
    contactPlaceholder: "Email или Telegram",
    message: "Сообщение",
    messagePlaceholder: "Что делаем, для кого и к какому сроку",
    send: "Отправить",
    consent: ["Нажимая кнопку, вы соглашаетесь с", "политикой конфиденциальности", ""],
  },
  orderProject: "Заказать проект",
  footerTagline: "Дизайн. Продукты. Идеи.",
  platform: "Платформа",
  privacy: "Конфиденциальность",
  linksAria: "Ссылки",
  preloaderTagline: "Дизайн · Продукты · Идеи",
  ticker: ["Сайты", "Интерфейсы", "Брендинг", "Продукты", "Приложения", "Lemnity"],
  game: {
    aria: "Мини-игра «Лопай соты»: нажимайте на группы сот одного цвета",
    hint: "👆 Нажмите на соты",
    praise: ["Супер!", "Вау!", "Отлично!", "Комбо!"],
  },
};

const EN: Ui = {
  nav: ["Projects", "Work", "Services", "About", "Contact"],
  studio: "Studio",
  homeAria: "Lemnity Studio, back to top",
  sectionsAria: "Sections",
  languageAria: "Language",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menu: "Menu",
  contacts: "Contact",
  heroEyebrow: "Lemnity Studio · Development · UI/UX · Branding",
  heroLines: ["We make", "the complex", "simple."],
  heroAccent: 2,
  heroScale: 0.76,
  heroText: "We build websites, interfaces, brands, digital products and casual games that help people and businesses grow.",
  buildTitle: "Things we can build together",
  buildItems: [
    "corporate website", "landing page", "online store", "marketplace", "web application", "customer portal",
    "SaaS platform", "mobile app", "dashboard", "CRM system", "booking service", "internal tool",
    "AI assistant", "chatbot", "startup MVP", "clickable prototype", "UX audit", "design system", "UI kit",
    "logo", "brand identity", "brand book", "merch", "casual game", "Telegram mini game", "promo game",
    "gamification", "animation", "presentation deck", "social content",
  ],
  manifesto:
    "Lemnity Studio brings design and technology together to create websites, games and [digital products]. From idea to [UX], [UI], [code] and launch. Behind it stand [12 years of experience] and a team that cares about craft, clarity and purpose. Designers who think like engineers. Engineers who design with feeling. Together, we turn [complexity] into [simplicity] that works.",
  seeWork: "See our work",
  writeUs: "Write to us",
  heroSide: { top: ["Ideas", "Products", "People"], since: "Lemnity Studio", places: ["Cyprus", "Russia", "Worldwide"] },
  openProject: (title) => `Open project ${title}`,
  cursorView: "View",
  cursorOpen: "Open",
  soon: "Soon",
  ourProduct: "Our product",
  workTitle: "Selected projects",
  workText: "Products, brands and digital solutions that turn ideas into things that work.",
  closeView: "Close preview",
  prevWork: "Previous work",
  nextWork: "Next work",
  galleryTitle: "Work gallery",
  galleryText: "Websites, interfaces, apps and branding: a selection of work from different years.",
  openWork: (alt) => `Open work: ${alt}`,
  clientsTitle: "Trusted by",
  clientsText: "Companies and teams we have launched brands, websites and products with.",
  logoInvite: ["This spot is for", "your logo →"],
  servicesTitle: "What we do",
  servicesText: "Websites, interfaces, brands, digital products and games: from idea to launch.",
  included: "What's included",
  processTitle: "How we work",
  infinity: "infinity",
  togetherAria: "Let's create something together: go to the request form",
  togetherLines: ["Let's", "create", "something together"],
  aboutHead: ["More than", "design"],
  aboutText:
    "Over 12 years in design, product development and visual communication. We combine strategy, design and technology to build products that are genuinely useful. Our Lemnity platform grew out of the same experience.",
  discuss: "Discuss a project",
  faqTitle: "Frequently asked questions",
  form: {
    subject: (topic) => `Request to Lemnity Studio: ${topic}`,
    name: "Name",
    contact: "Contact",
    topic: "Topic",
    errName: "Please enter your name",
    errContact: "Please enter your email or Telegram",
    errMessage: "Write a few words about the task, at least 10 characters",
    label: "Contact",
    head: ["Let's discuss", "your project"],
    text: "A few words about the task, and we'll come back with ideas, a timeline and the next step. We usually reply within a day.",
    need: "What you need",
    namePlaceholder: "Name",
    contactPlaceholder: "Email or Telegram",
    message: "Message",
    messagePlaceholder: "What we're building, for whom and by when",
    send: "Send",
    consent: ["By clicking the button, you agree to the", "privacy policy", ""],
  },
  orderProject: "Start a project",
  footerTagline: "Design. Products. Ideas.",
  platform: "Platform",
  privacy: "Privacy",
  linksAria: "Links",
  preloaderTagline: "Design · Products · Ideas",
  ticker: ["Websites", "Interfaces", "Branding", "Products", "Apps", "Lemnity"],
  game: {
    aria: "Mini-game “Pop the hexes”: tap groups of same-coloured hexes",
    hint: "👆 Tap the hexes",
    praise: ["Super!", "Wow!", "Great!", "Combo!"],
  },
};

const TJ: Ui = {
  nav: ["Лоиҳаҳо", "Корҳо", "Хизматҳо", "Дар бораи мо", "Тамос"],
  studio: "Студия",
  homeAria: "Лемнити Студия, ба боло",
  sectionsAria: "Бахшҳо",
  languageAria: "Забон",
  openMenu: "Кушодани меню",
  closeMenu: "Пӯшидани меню",
  menu: "Меню",
  contacts: "Тамос",
  heroEyebrow: "Лемнити Студия · Таҳия · UI/UX · Брендинг",
  heroLines: ["Мураккабро", "содда", "мекунем."],
  heroAccent: 1,
  heroScale: 0.78,
  heroText:
    "Мо сайтҳо, интерфейсҳо, брендҳо, маҳсулоти рақамӣ ва бозиҳои казуалӣ месозем, ки ба одамон ва тиҷорат дар рушд кӯмак мекунанд.",
  buildTitle: "Чӣ метавонем якҷоя созем",
  buildItems: [
    "сайти корпоративӣ", "лендинг", "мағозаи онлайн", "маркетплейс", "веб-барнома", "кабинети шахсӣ",
    "платформаи SaaS", "барномаи мобилӣ", "дашборд", "системаи CRM", "хизмати фармоиш", "абзори дохилӣ",
    "ёрдамчии AI", "чат-бот", "MVP-и стартап", "прототипи кликшаванда", "аудити UX", "дизайн-система", "UI-кит",
    "логотип", "услуби фирмавӣ", "брендбук", "мерч", "бозии казуалӣ", "мини-бозӣ дар Telegram", "бозии таблиғотӣ",
    "геймификатсия", "аниматсия", "презентатсия", "контент барои шабакаҳои иҷтимоӣ",
  ],
  manifesto:
    "Лемнити Студия дизайн ва технологияро муттаҳид мекунад, то сайтҳо, бозиҳо ва [маҳсулоти рақамӣ] созад. Аз ғоя то [UX], [UI], [код] ва оғоз. Пушти мо [12 сол таҷриба] ва дастае истодааст, ки барояш сифат, равшанӣ ва маъно муҳим аст. Дизайнерҳое, ки мисли муҳандисон фикр мекунанд. Муҳандисоне, ки бо эҳсос тарҳрезӣ мекунанд. Якҷоя мо [мураккабро] [содда] ва коркунанда мекунем.",
  seeWork: "Дидани корҳо",
  writeUs: "Ба мо нависед",
  heroSide: { top: ["Ғояҳо", "Маҳсулот", "Одамон"], since: "Лемнити Студия", places: ["Тоҷикистон", "Русия", "Тамоми ҷаҳон"] },
  openProject: (title) => `Кушодани лоиҳаи ${title}`,
  cursorView: "Дидан",
  cursorOpen: "Кушодан",
  soon: "Ба зудӣ",
  ourProduct: "Маҳсулоти мо",
  workTitle: "Лоиҳаҳои мунтахаб",
  workText: "Маҳсулот, брендҳо ва ҳалли рақамӣ, ки ғояҳоро ба чизҳои коркунанда табдил медиҳанд.",
  closeView: "Пӯшидани намоиш",
  prevWork: "Кори қаблӣ",
  nextWork: "Кори навбатӣ",
  galleryTitle: "Галереяи корҳо",
  galleryText: "Сайтҳо, интерфейсҳо, барномаҳо ва брендинг: интихоби корҳои солҳои гуногун.",
  openWork: (alt) => `Кушодани кор: ${alt}`,
  clientsTitle: "Ба мо эътимод доранд",
  clientsText: "Ширкатҳо ва дастаҳое, ки бо онҳо брендҳо, сайтҳо ва маҳсулот ба кор андохтем.",
  logoInvite: ["Ин ҷо метавонад бошад", "логотипи шумо →"],
  servicesTitle: "Мо чӣ кор мекунем",
  servicesText: "Сайтҳо, интерфейсҳо, брендҳо, маҳсулоти рақамӣ ва бозиҳо: аз ғоя то оғоз.",
  included: "Чӣ дохил мешавад",
  processTitle: "Чӣ тавр кор мекунем",
  infinity: "беохирӣ",
  togetherAria: "Биёед якҷоя чизе созем: гузариш ба шакли дархост",
  togetherLines: ["Биёед", "якҷоя", "чизе созем"],
  aboutHead: ["Бештар аз", "дизайн"],
  aboutText:
    "Зиёда аз 12 сол дар дизайн, таҳияи маҳсулот ва коммуникатсияҳои визуалӣ. Стратегия, дизайн ва технологияҳоро муттаҳид мекунем, то маҳсулоти воқеан муфид созем. Платформаи мо Lemnity низ аз ҳамин таҷриба ба вуҷуд омадааст.",
  discuss: "Муҳокимаи лоиҳа",
  faqTitle: "Саволҳои маъмул",
  form: {
    subject: (topic) => `Дархост ба Лемнити Студия: ${topic}`,
    name: "Ном",
    contact: "Тамос",
    topic: "Мавзӯъ",
    errName: "Номи худро нависед",
    errContact: "Email ё Telegram-и худро нависед",
    errMessage: "Дар бораи вазифа чанд калима нависед, на камтар аз 10 аломат",
    label: "Тамос",
    head: ["Лоиҳаро", "муҳокима кунем"],
    text: "Дар бораи вазифа чанд калима нависед, ва мо бо ғояҳо, мӯҳлатҳо ва қадами навбатӣ бармегардем. Одатан дар давоми як рӯз ҷавоб медиҳем.",
    need: "Чӣ лозим аст",
    namePlaceholder: "Ном",
    contactPlaceholder: "Email ё Telegram",
    message: "Паём",
    messagePlaceholder: "Чӣ месозем, барои кӣ ва то кадом мӯҳлат",
    send: "Фиристодан",
    consent: ["Бо пахш кардани тугма, шумо ба", "сиёсати махфият", "розӣ мешавед"],
  },
  orderProject: "Фармоиши лоиҳа",
  footerTagline: "Дизайн. Маҳсулот. Ғояҳо.",
  platform: "Платформа",
  privacy: "Махфият",
  linksAria: "Пайвандҳо",
  preloaderTagline: "Дизайн · Маҳсулот · Ғояҳо",
  ticker: ["Сайтҳо", "Интерфейсҳо", "Брендинг", "Маҳсулот", "Барномаҳо", "Lemnity"],
  game: {
    aria: "Мини-бозии «Шонаҳоро таркон»: ба гурӯҳҳои шонаҳои ҳамранг пахш кунед",
    hint: "👆 Ба шонаҳо пахш кунед",
    praise: ["Офарин!", "Вау!", "Аъло!", "Комбо!"],
  },
};

export const UI: Record<Locale, Ui> = { ru: RU, en: EN, tj: TJ };

/* ───────────────────────────── Переводы контента ───────────────────────────── */

type ProjectTr = { title?: string; description: string; tags: readonly string[] };
type ContentTr = {
  projects: Record<string, ProjectTr>;
  /** Подписи работ галереи — в том же порядке, что STUDIO_WORKS. */
  works: readonly string[];
  /** Названия клиентов, которые переводятся (остальные — латиницей как есть). */
  clients: Record<string, string>;
  services: readonly Pick<StudioService, "title" | "text" | "deliverables">[];
  process: readonly { title: string; text: string }[];
  /** Подписи цифр — в том же порядке, что STUDIO_STATS. */
  stats: readonly string[];
  quote: readonly string[];
  faq: readonly { q: string; a: string }[];
  topics: readonly string[];
};

const EN_CONTENT: ContentTr = {
  projects: {
    lemnity: { description: "Our own platform for building websites, chatbots and digital products", tags: ["SaaS", "Builder", "AI", "Product"] },
    tumtipb: { title: "House of Science and Technology", description: "An educational platform for professionals", tags: ["Education", "Website", "Public sector"] },
    prostyle: { description: "Promotional merchandise and corporate gifts", tags: ["Brand", "Online store", "Design"] },
    sphagnum: { description: "Living substrates for green roofs, vertical gardens and interiors", tags: ["Website", "Eco", "B2B"] },
    turdus: {
      title: "TURDUS Fashion Theatre",
      description: "Immersive performances in bars, restaurants, apartments and on the streets of Yekaterinburg",
      tags: ["Website", "Playbill", "Theatre"],
    },
  },
  works: [
    "Fifty Four coworking landing page",
    "Fiscal data operator dashboard",
    "Fashion store mobile app",
    "MANSON logo for a pest control service",
    "iDoors door manufacturer website",
    "“Planyorka” task manager",
    "Lemnity online store",
    "Merch: an event-branded hoodie",
    "Grocery online store",
    "Admin panel with widgets",
    "Construction company corporate website",
    "AntiConf conference landing page",
    "MSP pharmaceutical marketplace",
    "Reger Diamond logo",
    "Smart Metal online store",
    "Employee HR portal",
    "Savoy lighting online store",
    "MStroy landing page",
  ],
  clients: { "Театр «Либерта»": "Liberta Theatre", "Идеальная пара": "Idealnaya Para" },
  services: [
    {
      title: "Websites and web applications",
      text: "We build websites and web apps that load fast and make sense from the first screen. One team handles design and code, so nothing gets lost between the mockup and the finished site. A good fit for companies, services and educational platforms.",
      deliverables: ["corporate website or service", "responsive layout for phone and desktop", "user accounts and forms"],
    },
    {
      title: "UI/UX interface design",
      text: "We design interfaces where people don't have to think about where to click. We start with user flows and structure, then draw mockups and a prototype. You get the result in a form developers find easy to work with.",
      deliverables: ["structure and user flows", "prototype", "screen mockups", "design system and UI kit", "handoff to development"],
    },
    {
      title: "Landing pages and online stores",
      text: "We make pages that lead visitors to a single action, and stores where choosing and buying is easy. We work on text structure, visuals and speed. A case from our practice: the ProStyle website for corporate gifts and souvenirs.",
      deliverables: ["landing page or multi-page site", "online store with catalogue and cart", "request form", "responsive version"],
    },
    {
      title: "Branding and identity",
      text: "We help brands look consistent, from the logo to the website and merch. First we put into words what makes you different, then turn it into a visual language and a set of rules your team can easily follow.",
      deliverables: ["logo and mark", "colours, fonts, style", "branded materials and merch", "usage guide", "website styled to the brand"],
    },
    {
      title: "Digital product and MVP",
      text: "We help turn an idea into a working product, from hypothesis and prototype to the first version. We launched the Lemnity platform ourselves and know what matters at the start and what can wait.",
      deliverables: ["refining the idea and the scope of version one", "clickable prototype", "MVP design and development", "product roadmap", "launch and first iterations"],
    },
    {
      title: "Game development",
      text: "We make casual and mini games for the browser, Telegram and promo campaigns, as well as commercial games built around business goals. We design the game loop, draw the graphics and take it all the way to release. Try it: the game in this card is live.",
      deliverables: ["casual games for browser and mobile", "mini games for Telegram, websites and campaigns", "commercial games with monetisation", "game design, graphics and animation", "release and support"],
    },
  ],
  process: [
    { title: "Getting to know the task", text: "You tell us about the task, audience and timeline. We ask questions and say honestly what's realistic and what's better left out." },
    { title: "Structure and concept", text: "We put together the structure, user flows and the first concept, and agree on direction before the detailed work." },
    { title: "Design and prototype", text: "We draw mockups and a clickable prototype. You see how the product will work and make changes early on." },
    { title: "Development", text: "We build the layout and write the code, showing interim versions along the way rather than at the very end." },
    { title: "Launch and support", text: "We test on different devices, launch, and stay in touch for further improvements." },
  ],
  stats: ["years of experience", "projects", "countries", "ideas in progress"],
  quote: ["Good design makes", "the complex clear", "and the possible closer."],
  faq: [
    {
      q: "How long does a project take?",
      a: "It depends on the scope: a landing page is quicker than a service with user accounts. After a short introduction to the task we give you a realistic timeline and stages, not a guess.",
    },
    {
      q: "How much does it cost?",
      a: "The price depends on the task, scope and timeline, so there is no fixed price list. Tell us what you need: we'll estimate the project and explain what the cost is made of.",
    },
    {
      q: "What technologies do you use?",
      a: "We pick the tool for the task. If the Lemnity platform suits the project, we build on it, and you can easily manage the site yourself afterwards. If you need custom logic, we write it from scratch in React and TypeScript.",
    },
    {
      q: "Do you work remotely?",
      a: "Yes. The studio is based in Cyprus, and our clients come from different cities and countries. We talk in whichever messenger suits you or by video.",
    },
    {
      q: "Who will run the project?",
      a: "Each project gets a dedicated manager who keeps track of deadlines and collects feedback. Design and development are done by the studio team, without outsourcing.",
    },
    {
      q: "Do you support the site after launch?",
      a: "Yes. After launch we stay in touch: we fix issues, improve and grow the project. We agree on the support format in advance.",
    },
  ],
  topics: ["Website", "Brand and identity", "Product and UI", "Other"],
};

const TJ_CONTENT: ContentTr = {
  projects: {
    lemnity: { description: "Платформаи худи мо барои сохтани сайтҳо, чат-ботҳо ва маҳсулоти рақамӣ", tags: ["SaaS", "Конструктор", "AI", "Маҳсулот"] },
    tumtipb: { title: "Хонаи илм ва техника", description: "Платформаи таълимӣ барои мутахассисон", tags: ["Маориф", "Сайт", "Бахши давлатӣ"] },
    prostyle: { description: "Маҳсулоти тӯҳфавӣ ва тӯҳфаҳои корпоративӣ", tags: ["Бренд", "Мағозаи онлайн", "Дизайн"] },
    sphagnum: { description: "Субстратҳои зинда барои бомҳои сабз, боғҳои амудӣ ва интерйерҳо", tags: ["Сайт", "Эко", "B2B"] },
    turdus: {
      title: "Театри мӯди TURDUS",
      description: "Намоишҳои иммерсивӣ дар барҳо, тарабхонаҳо, хонаҳо ва кӯчаҳои Екатеринбург",
      tags: ["Сайт", "Афиша", "Театр"],
    },
  },
  works: [
    "Лендинги коворкинги Fifty Four",
    "Дашборди оператори маълумоти фискалӣ",
    "Барномаи мобилии мағозаи мӯд",
    "Логотипи MANSON барои хадамоти дезинсексия",
    "Сайти истеҳсолкунандаи дарҳои iDoors",
    "Менеҷери вазифаҳои «Планёрка»",
    "Мағозаи онлайни Lemnity",
    "Мерч: ҳудӣ бо айдентикаи чорабинӣ",
    "Мағозаи онлайни маҳсулоти хӯрокворӣ",
    "Панели админ бо виҷетҳо",
    "Сайти корпоративии ширкати сохтмонӣ",
    "Лендинги конфронси AntiConf",
    "Маркетплейси фармасевтии MSP",
    "Логотипи Reger Diamond",
    "Мағозаи онлайни Smart Metal",
    "Портали HR барои кормандон",
    "Мағозаи онлайни чароғҳои Savoy",
    "Лендинги MStroy",
  ],
  clients: { "Театр «Либерта»": "Театри «Либерта»" },
  services: [
    {
      title: "Таҳияи сайтҳо ва веб-барномаҳо",
      text: "Сайтҳо ва веб-барномаҳое месозем, ки зуд бор мешаванд ва аз экрани аввал фаҳмоанд. Дизайн ва кодро як даста пеш мебарад, бинобар ин байни макет ва сайти тайёр чизе гум намешавад. Барои ширкатҳо, хизматрасониҳо ва платформаҳои таълимӣ мувофиқ аст.",
      deliverables: ["сайти корпоративӣ ё хизматрасонӣ", "тарҳбандии мутобиқ барои телефон ва компютер", "кабинетҳои шахсӣ ва шаклҳо"],
    },
    {
      title: "Дизайни интерфейсҳои UI/UX",
      text: "Интерфейсҳое тарҳрезӣ мекунем, ки дар онҳо одам фикр намекунад, ки куҷо пахш кунад. Аз сенарияҳо ва сохтор оғоз мекунем, баъд макетҳо ва прототип мекашем. Натиҷаро дар шакле месупорем, ки бо он кор кардан барои таҳиягарон қулай аст.",
      deliverables: ["сохтор ва сенарияҳои корбарон", "прототип", "макетҳои экранҳо", "дизайн-система ва UI-кит", "супоридани макетҳо ба таҳия"],
    },
    {
      title: "Лендингҳо ва мағозаҳои онлайн",
      text: "Саҳифаҳое месозем, ки меҳмонро ба як амал мебаранд, ва мағозаҳое, ки дар онҳо интихоб ва харид қулай аст. Бо сохтори матн, визуал ва суръат кор мекунем. Мисол аз амалия: сайти ProStyle, тӯҳфаҳо ва сувенирҳои корпоративӣ.",
      deliverables: ["лендинг ё сайти бисёрсаҳифа", "мағозаи онлайн бо каталог ва сабад", "шакли дархост", "версияи мутобиқ"],
    },
    {
      title: "Брендинг ва айдентика",
      text: "Ба бренд кӯмак мекунем, ки яклухт намояд: аз логотип то сайт ва мерч. Аввал муайян мекунем, ки шумо бо чӣ фарқ мекунед, баъд инро ба забони визуалӣ табдил дода, қоидаҳое ҷамъ меоварем, ки истифодаашон барои даста қулай аст.",
      deliverables: ["логотип ва нишона", "рангҳо, ҳуруф, услуб", "маводи фирмавӣ ва мерч", "дастур оид ба истифода", "ороиши сайт дар услуби бренд"],
    },
    {
      title: "Маҳсулоти рақамӣ ва MVP",
      text: "Кӯмак мекунем, ки ғоя ба маҳсулоти коркунанда табдил ёбад: аз фарзия ва прототип то версияи аввал. Мо худамон платформаи Lemnity-ро ба кор андохтем ва медонем, ки дар оғоз чӣ муҳим аст ва чиро метавон ба таъхир гузошт.",
      deliverables: ["аниқ кардани ғоя ва таркиби версияи аввал", "прототипи кликшаванда", "дизайн ва таҳияи MVP", "нақшаи рушди маҳсулот", "оғоз ва такмилҳои аввал"],
    },
    {
      title: "Таҳияи бозиҳо",
      text: "Бозиҳои казуалӣ ва мини-бозиҳо барои браузер, Telegram ва аксияҳои таблиғотӣ, инчунин бозиҳои тиҷоратӣ барои вазифаҳои бизнес месозем. Сикли бозиро фикр мекунем, графика мекашем ва то релиз мерасонем. Санҷед: бозӣ дар ин корт зинда аст.",
      deliverables: ["бозиҳои казуалӣ барои браузер ва телефон", "мини-бозиҳо барои Telegram, сайтҳо ва аксияҳо", "бозиҳои тиҷоратӣ бо монетизатсия", "геймдизайн, графика ва аниматсия", "релиз ва дастгирӣ"],
    },
  ],
  process: [
    { title: "Шиносоӣ ва вазифа", text: "Шумо дар бораи вазифа, аудитория ва мӯҳлатҳо нақл мекунед. Мо савол медиҳем ва ростқавлона мегӯем, ки чӣ воқеӣ аст ва чиро беҳтар аст хориҷ кард." },
    { title: "Сохтор ва консепсия", text: "Сохтор, сенарияҳо ва консепсияи аввалро ҷамъ меорем. Пеш аз кори муфассал дар бораи самт мувофиқа мекунем." },
    { title: "Дизайн ва прототип", text: "Макетҳо ва прототипи кликшаванда мекашем. Шумо мебинед, ки маҳсулот чӣ тавр кор мекунад, ва онро дар марҳилаи аввал ислоҳ мекунед." },
    { title: "Таҳия", text: "Тарҳбандӣ ва барномасозӣ мекунем. Версияҳои фосилавиро дар ҷараёни кор нишон медиҳем, на дар охир." },
    { title: "Оғоз ва дастгирӣ", text: "Дар дастгоҳҳои гуногун месанҷем, ба кор меандозем ва барои такмил дар тамос мемонем." },
  ],
  stats: ["сол таҷриба", "лоиҳа", "кишвар", "ғоя дар кор"],
  quote: ["Дизайни хуб", "мураккабро фаҳмо", "ва имконпазирро наздик мекунад."],
  faq: [
    {
      q: "Лоиҳа чӣ қадар вақт мегирад?",
      a: "Аз ҳаҷм вобаста аст: лендинг нисбат ба хизматрасонӣ бо кабинети шахсӣ зудтар сохта мешавад. Пас аз шиносоии кӯтоҳ бо вазифа мӯҳлат ва марҳилаҳои воқеиро мегӯем, на рақами тахминӣ.",
    },
    {
      q: "Нархаш чанд аст?",
      a: "Нарх аз вазифа, ҳаҷм ва мӯҳлат вобаста аст, бинобар ин нархномаи собит нест. Нависед, ки чӣ кор кардан лозим аст: лоиҳаро арзёбӣ карда, мефаҳмонем, ки арзиш аз чӣ иборат аст.",
    },
    {
      q: "Бо кадом технологияҳо кор мекунед?",
      a: "Абзорро мувофиқи вазифа интихоб мекунем. Агар платформаи Lemnity ба лоиҳа мувофиқ бошад, дар он месозем ва баъд идора кардани сайт барои худатон осон мешавад. Агар мантиқи худӣ лозим бошад, аз сифр бо React ва TypeScript менависем.",
    },
    {
      q: "Шумо фосилавӣ кор мекунед?",
      a: "Бале. Студия дар Тоҷикистон ҷойгир аст, мизоҷон бошанд аз шаҳрҳо ва кишварҳои гуногун. Дар мессенҷери барои шумо қулай ё тавассути видео муошират мекунем.",
    },
    {
      q: "Лоиҳаро кӣ пеш мебарад?",
      a: "Ба лоиҳа менеҷер вобаста карда мешавад: ӯ мӯҳлатҳоро назорат мекунад ва ислоҳҳоро ҷамъ меорад. Дизайн ва таҳияро дастаи студия анҷом медиҳад, бе супоридан ба тарафи сеюм.",
    },
    {
      q: "Оё пас аз оғоз сайтро дастгирӣ мекунед?",
      a: "Бале. Пас аз оғоз дар тамос мемонем: камбудиҳоро ислоҳ мекунем, лоиҳаро такмил медиҳем ва рушд медиҳем. Шакли дастгириро пешакӣ муҳокима мекунем.",
    },
  ],
  topics: ["Сайт", "Бренд ва айдентика", "Маҳсулот ва UI", "Дигар"],
};

const CONTENT_TR: Record<Exclude<Locale, "ru">, ContentTr> = { en: EN_CONTENT, tj: TJ_CONTENT };

export type StudioContent = {
  projects: readonly StudioProject[];
  works: readonly StudioWork[];
  clients: typeof STUDIO_CLIENTS;
  services: readonly StudioService[];
  process: readonly { title: string; text: string }[];
  stats: readonly StudioStat[];
  quote: readonly string[];
  faq: readonly { q: string; a: string }[];
  topics: readonly string[];
};

/** Контент на нужном языке: картинки, ссылки и порядок — из studio-content.ts, тексты — из переводов. */
export function localizeContent(locale: Locale): StudioContent {
  if (locale === "ru") {
    return {
      projects: STUDIO_PROJECTS,
      works: STUDIO_WORKS,
      clients: STUDIO_CLIENTS,
      services: STUDIO_SERVICES,
      process: STUDIO_PROCESS,
      stats: STUDIO_STATS,
      quote: STUDIO_QUOTE,
      faq: STUDIO_FAQ,
      topics: STUDIO_TOPICS,
    };
  }
  const tr = CONTENT_TR[locale];
  return {
    projects: STUDIO_PROJECTS.map((p) => {
      const t = tr.projects[p.id];
      return t ? { ...p, title: t.title ?? p.title, description: t.description, tags: t.tags } : p;
    }),
    works: STUDIO_WORKS.map((w, i) => ({ ...w, alt: tr.works[i] ?? w.alt })),
    clients: STUDIO_CLIENTS.map((c) => ({ ...c, name: tr.clients[c.name] ?? c.name })),
    services: STUDIO_SERVICES.map((s, i) => ({ ...s, ...tr.services[i] })),
    process: tr.process,
    stats: STUDIO_STATS.map((s, i) => ({ ...s, label: tr.stats[i] ?? s.label })),
    quote: tr.quote,
    faq: tr.faq,
    topics: tr.topics,
  };
}
