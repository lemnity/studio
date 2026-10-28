/**
 * Контент страницы «Лемнити Студия» (/studio).
 *
 * Состав взят с simakoov.ru (услуги, процесс, проекты, галерея, клиенты, FAQ) и переписан от лица
 * студии. Картинки скопированы в public/studio/*. Тексты держим здесь, а не в разметке: страницу
 * правят чаще по словам, чем по вёрстке.
 */

import { asset } from "@/lib/utils";

/** Адрес этого сайта: canonical, sitemap, Open Graph. Задаётся при выкатке через NEXT_PUBLIC_SITE_URL. */
export const STUDIO_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://studio.lemnity.ru").replace(/\/+$/, "");
/** Платформа Lemnity и её политика конфиденциальности — сайт студии своих документов не держит. */
export const STUDIO_PLATFORM_URL = "https://lemnity.ru";
export const STUDIO_PRIVACY_URL = "https://lemnity.ru/docs/privacy";

export const STUDIO_CONTACT_EMAIL = "hello@lemnity.ru";
export const STUDIO_CONTACT_TG = "https://t.me/lemnity_ru";

export type StudioProject = {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: readonly string[];
  image: string;
  /** Фокус кадра (CSS object-position): исходники шире слота, обрезка как в оригинале. */
  focus: string;
  /** Видимая часть исходника (у концепт-картинок по краям вшиты надписи); `imgW` — ширина файла. */
  crop?: { x: number; y: number; w: number; h: number; imgW: number };
  /** Белый логотип вместо названия в заголовке. */
  logo?: { src: string; width: number; height: number };
  url: string;
  flagship?: boolean;
};

export const STUDIO_PROJECTS: readonly StudioProject[] = [
  {
    id: "lemnity",
    number: "01",
    title: "Lemnity",
    description: "Наша собственная платформа для создания сайтов, чат-ботов и цифровых продуктов",
    tags: ["SaaS", "Конструктор", "AI", "Продукт"],
    image: asset("/studio/projects/lemnity-concept.png"),
    focus: "40% 50%",
    crop: { x: 0, y: 176, w: 466, h: 216, imgW: 466 },
    logo: { src: asset("/studio/clients/lemnity.svg"), width: 375, height: 95 },
    url: "https://lemnity.ru",
    flagship: true,
  },
  {
    id: "tumtipb",
    number: "02",
    title: "Дом науки и техники",
    description: "Образовательная платформа для профессионалов",
    tags: ["Образование", "Сайт", "Гос. сектор"],
    image: asset("/studio/projects/dom-nauki-site.webp"),
    focus: "72% 40%",
    url: "https://web.tumtipb.ru/",
  },
  {
    id: "prostyle",
    number: "03",
    title: "ProStyle",
    description: "Сувенирная продукция и корпоративные подарки",
    tags: ["Бренд", "Интернет-магазин", "Дизайн"],
    image: asset("/studio/projects/prostyle-site.webp"),
    focus: "60% 45%",
    logo: { src: asset("/studio/clients/prostyle.svg"), width: 340, height: 92 },
    url: "https://prostyle.agency/",
  },
  {
    id: "sphagnum",
    number: "04",
    title: "Sphagnum AE",
    description: "Живые субстраты для зелёных крыш, вертикальных садов и интерьеров",
    tags: ["Сайт", "Эко", "B2B"],
    image: asset("/studio/projects/sphagnum-concept.webp"),
    focus: "90% 45%",
    url: "https://lemnity.github.io/sphgnm/",
  },
  {
    id: "turdus",
    number: "05",
    title: "Модный театр TURDUS",
    description: "Иммерсивные спектакли в барах, ресторанах, квартирах и на улицах Екатеринбурга",
    tags: ["Сайт", "Афиша", "Театр"],
    image: asset("/studio/projects/turdus-site.webp"),
    focus: "30% 40%",
    url: "https://lemnity.github.io/trds/",
  },
];

export type StudioWorkKind = "site" | "app" | "ui" | "brand";

export type StudioWork = {
  src: string;
  width: number;
  height: number;
  full: string;
  fullWidth: number;
  fullHeight: number;
  alt: string;
  kind: StudioWorkKind;
};

export const STUDIO_WORKS: readonly StudioWork[] = [
  { src: asset("/studio/works/work-08.webp"), width: 720, height: 1080, full: asset("/studio/works/work-08-full.webp"), fullWidth: 1230, fullHeight: 5734, alt: "Лендинг коворкинга Fifty Four", kind: "site" },
  { src: asset("/studio/works/work-20.webp"), width: 700, height: 497, full: asset("/studio/works/work-20-full.webp"), fullWidth: 700, fullHeight: 497, alt: "Дашборд ОФД", kind: "ui" },
  { src: asset("/studio/works/work-13.webp"), width: 720, height: 1080, full: asset("/studio/works/work-13-full.webp"), fullWidth: 790, fullHeight: 2352, alt: "Мобильное приложение fashion-магазина", kind: "app" },
  { src: asset("/studio/works/work-05.webp"), width: 720, height: 509, full: asset("/studio/works/work-05-full.webp"), fullWidth: 843, fullHeight: 596, alt: "Логотип MANSON для службы дезинсекции", kind: "brand" },
  { src: asset("/studio/works/work-11.webp"), width: 720, height: 1080, full: asset("/studio/works/work-11-full.webp"), fullWidth: 910, fullHeight: 3114, alt: "Сайт производителя дверей iDoors", kind: "site" },
  { src: asset("/studio/works/work-25.webp"), width: 720, height: 426, full: asset("/studio/works/work-25-full.webp"), fullWidth: 1473, fullHeight: 872, alt: "Таск-менеджер «Планёрка»", kind: "ui" },
  { src: asset("/studio/works/work-28.webp"), width: 720, height: 750, full: asset("/studio/works/work-28-full.webp"), fullWidth: 1600, fullHeight: 1667, alt: "Интернет-магазин Lemnity", kind: "site" },
  { src: asset("/studio/works/work-01.webp"), width: 720, height: 728, full: asset("/studio/works/work-01-full.webp"), fullWidth: 1426, fullHeight: 1441, alt: "Мерч: худи с айдентикой события", kind: "brand" },
  { src: asset("/studio/works/work-14.webp"), width: 720, height: 1080, full: asset("/studio/works/work-14-full.webp"), fullWidth: 1500, fullHeight: 2991, alt: "Интернет-магазин продуктов", kind: "app" },
  { src: asset("/studio/works/work-35.webp"), width: 720, height: 512, full: asset("/studio/works/work-35-full.webp"), fullWidth: 1440, fullHeight: 1024, alt: "Админ-панель с виджетами", kind: "ui" },
  { src: asset("/studio/works/work-16.webp"), width: 720, height: 1080, full: asset("/studio/works/work-16-full.webp"), fullWidth: 1566, fullHeight: 2584, alt: "Корпоративный сайт строительной компании", kind: "site" },
  { src: asset("/studio/works/work-03.webp"), width: 600, height: 338, full: asset("/studio/works/work-03-full.webp"), fullWidth: 880, fullHeight: 495, alt: "Лендинг конференции AntiConf", kind: "site" },
  { src: asset("/studio/works/work-37.webp"), width: 720, height: 1080, full: asset("/studio/works/work-37-full.webp"), fullWidth: 877, fullHeight: 2062, alt: "Фармацевтический маркетплейс MSP", kind: "site" },
  { src: asset("/studio/works/work-12.webp"), width: 720, height: 470, full: asset("/studio/works/work-12-full.webp"), fullWidth: 1400, fullHeight: 913, alt: "Логотип Reger Diamond", kind: "brand" },
  { src: asset("/studio/works/work-24.webp"), width: 715, height: 1073, full: asset("/studio/works/work-24-full.webp"), fullWidth: 715, fullHeight: 1586, alt: "Интернет-магазин Smart Metal", kind: "site" },
  { src: asset("/studio/works/work-40.webp"), width: 720, height: 410, full: asset("/studio/works/work-40-full.webp"), fullWidth: 1600, fullHeight: 911, alt: "HR-портал сотрудника", kind: "ui" },
  { src: asset("/studio/works/work-31.webp"), width: 720, height: 1080, full: asset("/studio/works/work-31-full.webp"), fullWidth: 940, fullHeight: 1461, alt: "Интернет-магазин светильников Savoy", kind: "site" },
  { src: asset("/studio/works/work-34.webp"), width: 720, height: 1080, full: asset("/studio/works/work-34-full.webp"), fullWidth: 1301, fullHeight: 4490, alt: "Лендинг MStroy", kind: "site" },
];

/**
 * `filter` — свой фильтр вместо белого силуэта по умолчанию: у знака «C» деталь нарисована цветом,
 * а не вырезана, и `brightness(0) invert(1)` залил бы его сплошным белым квадратом.
 */
export const STUDIO_CLIENTS: readonly { name: string; src: string; width: number; height: number; filter?: string }[] = [
  { name: "Lemnity", src: asset("/studio/clients/lemnity.svg"), width: 375, height: 95 },
  { name: "ProStyle", src: asset("/studio/clients/prostyle.svg"), width: 340, height: 92 },
  { name: "iDoors", src: asset("/studio/clients/i-doors.svg"), width: 342, height: 119 },
  { name: "Fifty Four", src: asset("/studio/clients/fifty-four.svg"), width: 342, height: 112 },
  { name: "MStroy", src: asset("/studio/clients/mstroy.svg"), width: 369, height: 118 },
  { name: "Simourg", src: asset("/studio/clients/simourg.svg"), width: 249, height: 49 },
  { name: "Театр «Либерта»", src: asset("/studio/clients/teatr-liberta.webp"), width: 433, height: 160 },
  { name: "MSP", src: asset("/studio/clients/msp.svg"), width: 321, height: 109 },
  { name: "Simval", src: asset("/studio/clients/simval.svg"), width: 344, height: 90 },
  { name: "Идеальная пара", src: asset("/studio/clients/idealnaya-para.svg"), width: 342, height: 164 },
  { name: "Dvigex", src: asset("/studio/clients/dvigex.webp"), width: 146, height: 160 },
  { name: "C", src: asset("/studio/clients/c-mark.svg"), width: 197, height: 197, filter: "grayscale(1)" },
];

/** Фильтр логотипа клиента на тёмном фоне: белый силуэт, если у логотипа нет своего. */
export const clientLogoFilter = (client: { filter?: string }) => client.filter ?? "brightness(0) invert(1)";

export type StudioService = { title: string; text: string; deliverables: readonly string[] };

export const STUDIO_SERVICES: readonly StudioService[] = [
  {
    title: "Разработка сайтов и веб-приложений",
    text: "Делаем сайты и веб-приложения, которые быстро загружаются и понятны с первого экрана. Дизайн и код ведёт одна команда, поэтому между макетом и готовым сайтом ничего не теряется. Подходит компаниям, сервисам и образовательным платформам.",
    deliverables: ["корпоративный сайт или сервис", "адаптивная вёрстка для телефона и компьютера", "личные кабинеты и формы"],
  },
  {
    title: "UI/UX-дизайн интерфейсов",
    text: "Проектируем интерфейсы, в которых человек не думает, куда нажать. Начинаем со сценариев и структуры, потом рисуем макеты и прототип. Результат отдаём в виде, с которым удобно работать разработчикам.",
    deliverables: ["структура и пользовательские сценарии", "прототип", "макеты экранов", "дизайн-система и UI-кит", "передача макетов в разработку"],
  },
  {
    title: "Лендинги и интернет-магазины",
    text: "Делаем страницы, которые ведут посетителя к одному действию, и магазины, где удобно выбирать и покупать. Работаем над структурой текста, визуалом и скоростью. Пример из практики: сайт ProStyle, корпоративные подарки и сувениры.",
    deliverables: ["лендинг или многостраничный сайт", "интернет-магазин с каталогом и корзиной", "форма заявки", "адаптивная версия"],
  },
  {
    title: "Брендинг и айдентика",
    text: "Помогаем бренду выглядеть цельно: от логотипа до сайта и мерча. Сначала формулируем, чем вы отличаетесь, потом превращаем это в визуальный язык и собираем правила, которыми удобно пользоваться команде.",
    deliverables: ["логотип и знак", "цвета, шрифты, стиль", "фирменные носители и мерч", "гайд по использованию", "оформление сайта в стиле бренда"],
  },
  {
    title: "Цифровой продукт и MVP",
    text: "Помогаем превратить идею в работающий продукт: от гипотезы и прототипа до первой версии. Мы сами запустили платформу Lemnity и знаем, что на старте важно, а что можно отложить.",
    deliverables: ["уточнение идеи и состава первой версии", "кликабельный прототип", "дизайн и разработка MVP", "план развития продукта", "запуск и первые доработки"],
  },
];

export const STUDIO_PROCESS: readonly { title: string; text: string }[] = [
  { title: "Знакомство и задача", text: "Вы рассказываете о задаче, аудитории и сроках. Мы задаём вопросы и честно говорим, что реально, а что лучше убрать." },
  { title: "Структура и концепция", text: "Собираем структуру, сценарии и первую концепцию. Договариваемся о направлении до детальной работы." },
  { title: "Дизайн и прототип", text: "Рисуем макеты и кликабельный прототип. Вы видите, как продукт будет работать, и правите его на раннем этапе." },
  { title: "Разработка", text: "Верстаем и программируем. Промежуточные версии показываем по ходу, а не в самом конце." },
  { title: "Запуск и поддержка", text: "Проверяем на разных устройствах, запускаем и остаёмся на связи для доработок." },
];

export type StudioStat = { kind: "number"; value: number; suffix: string; label: string } | { kind: "infinity"; label: string };

export const STUDIO_STATS: readonly StudioStat[] = [
  { kind: "number", value: 12, suffix: "+", label: "лет опыта" },
  { kind: "number", value: 50, suffix: "+", label: "проектов" },
  { kind: "number", value: 3, suffix: "", label: "страны" },
  { kind: "infinity", label: "идей в работе" },
];

/** Подписи боковой колонки первого экрана (у оригинала там же подпись автора, у студии её нет). */
export const STUDIO_HERO_SIDE = { top: ["Идеи", "Продукты", "Люди"], since: "Лемнити Студия", places: ["Тюмень", "Россия", "Весь мир"] };

export const STUDIO_QUOTE: readonly string[] = ["Хороший дизайн делает", "сложное понятным,", "а возможное ближе."];

export const STUDIO_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "Сколько времени занимает проект?",
    a: "Зависит от объёма: лендинг делается быстрее, чем сервис с личным кабинетом. После короткого знакомства с задачей называем реалистичный срок и этапы, а не цифру на глаз.",
  },
  {
    q: "Сколько это стоит?",
    a: "Цена зависит от задачи, объёма и сроков, поэтому фиксированного прайса нет. Напишите, что нужно сделать: оценим проект и объясним, из чего складывается стоимость.",
  },
  {
    q: "На каких технологиях вы работаете?",
    a: "Выбираем инструмент под задачу. Если проекту подходит платформа Lemnity, собираем на ней, и сайтом потом легко управлять самим. Если нужна своя логика, пишем с нуля на React и TypeScript.",
  },
  {
    q: "Вы работаете удалённо?",
    a: "Да. Студия в Тюмени, а клиенты из разных городов и стран. Общаемся в удобном вам мессенджере или по видео.",
  },
  {
    q: "Кто будет вести проект?",
    a: "За проектом закрепляется менеджер, он держит сроки и собирает правки. Дизайн и разработку делает команда студии, без передачи на сторону.",
  },
  {
    q: "Поддерживаете ли сайт после запуска?",
    a: "Да. После запуска остаёмся на связи: исправляем недочёты, дорабатываем и развиваем проект. Формат поддержки обсуждаем заранее.",
  },
];

export const STUDIO_TOPICS: readonly string[] = ["Сайт", "Бренд и айдентика", "Продукт и UI", "Другое"];
