"use client";

/**
 * Сайт «Лемнити Студия»: лендинг студии разработки (вынесен из платформы lmntai, где жил на /studio).
 *
 * Вёрстка, типографика и анимации перенесены из исходников simakoov.ru (репозиторий smkv): почти
 * чёрный фон, Gilroy без жирных начертаний, микроподписи в разрядку, заголовок, выезжающий из-под
 * маски, список проектов с превью за курсором, бегущая строка клиентов, цитата, проявляющаяся по
 * словам при прокрутке. Отличия от оригинала: бренд Lemnity (знак),
 * тексты от лица студии, справа на первом экране — 3D-объект (studio-hex-sphere.tsx) вместо портрета.
 *
 * Эффекты — в studio-effects.tsx, тексты — в studio-content.ts. Шрифт Gilroy лежит в
 * public/studio/fonts.
 */

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe, Heart, Mail, Menu, MoreHorizontal, Plus, Quote, Send, X, ZoomIn } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

import { LemnityWordmark } from "@/components/lemnity-wordmark";
import { BASE_PATH, cn } from "@/lib/utils";

import {
  STUDIO_CONTACT_EMAIL,
  STUDIO_CONTACT_TG,
  STUDIO_PLATFORM_URL,
  STUDIO_PRIVACY_URL,
  clientLogoFilter,
  type StudioProject,
  type StudioService,
  type StudioStat,
} from "./studio-content";
import {
  CustomCursor,
  EASE,
  GrainOverlay,
  MagneticButton,
  PixelEdge,
  Reveal,
  ScrollProgress,
  VariableProximity,
  useMediaQuery,
} from "./studio-effects";
import { StudioGame } from "./studio-game";
import { StudioHexSphere } from "./studio-hex-sphere";
import { LOCALES, LOCALE_HTML, LOCALE_LABEL, LOCALE_NAME, LOCALE_PATH, type Locale, type StudioContent, type Ui } from "./studio-i18n";
import { StudioLocaleProvider, useStudioLocale } from "./studio-locale";
import {
  ClientSlotCta,
  DrawnCircle,
  DrawnUnderline,
  FooterMark,
  LineReveal,
  LogoSlots,
  ParallaxMedia,
  SmoothWheel,
  StudioPreloader,
  VelocityTicker,
  useIntroReady,
} from "./studio-wow";

/** Якоря разделов; подписи — в словаре (t.nav), в том же порядке. */
const NAV_HREFS = ["#work", "#gallery", "#services", "#about", "#contact"] as const;

/**
 * Выбор языка — выпадающее меню: кнопка с текущим языком, по клику список из трёх языков. Пункты —
 * обычные ссылки на статические страницы /, /en/, /tj/ (с учётом basePath GitHub Pages).
 * Закрывается по клику мимо, по Escape и при выборе.
 */
function LangSwitch({ className }: { className?: string }) {
  const { locale, t } = useStudioLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t.languageAria}: ${LOCALE_NAME[locale]}`}
        onClick={() => setOpen((v) => !v)}
        className="st-micro flex h-11 items-center gap-2 rounded-full border border-[var(--st-line)] px-3.5 transition-colors hover:border-[var(--st-accent-45)] focus-visible:border-[var(--st-accent)] focus-visible:outline-none"
      >
        <Globe aria-hidden className="h-4 w-4 text-[var(--st-muted)]" />
        {LOCALE_LABEL[locale]}
        <ChevronDown aria-hidden className={cn("h-4 w-4 text-[var(--st-muted)] transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            key="langs"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-[calc(100%+8px)] z-[70] m-0 min-w-[200px] list-none rounded border border-[var(--st-line)] bg-[var(--st-surface)] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {LOCALES.map((l) => (
              <li key={l}>
                <a
                  href={`${BASE_PATH}${LOCALE_PATH[l]}`}
                  hrefLang={LOCALE_HTML[l]}
                  lang={LOCALE_HTML[l]}
                  aria-current={l === locale ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded px-3 py-2.5 text-[16px] transition-colors hover:bg-[rgba(255,255,255,0.06)] focus-visible:bg-[rgba(255,255,255,0.06)] focus-visible:outline-none",
                    l === locale ? "text-[var(--st-text)]" : "text-[var(--st-muted)] hover:text-[var(--st-text)]",
                  )}
                >
                  <span className={cn("st-micro w-7", l === locale && "text-[var(--st-accent)]")}>{LOCALE_LABEL[l]}</span>
                  <span className="flex-1">{LOCALE_NAME[l]}</span>
                  {l === locale ? <Check aria-hidden className="h-4 w-4 text-[var(--st-accent)]" /> : null}
                </a>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

const NOISE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
);

/* Палитра и приёмы smkv/src/theme.ts; акцент заменён на лаймовый, как в оригинале (#c4ee18). */
const STYLES = `
@font-face { font-family: "StudioGilroy"; font-weight: 400; font-display: swap; src: url(${BASE_PATH}/studio/fonts/gilroy-regular.woff2) format("woff2"); }
@font-face { font-family: "StudioGilroy"; font-weight: 500; font-display: swap; src: url(${BASE_PATH}/studio/fonts/gilroy-medium.woff2) format("woff2"); }
@font-face { font-family: "StudioGilroy"; font-weight: 600; font-display: swap; src: url(${BASE_PATH}/studio/fonts/gilroy-semibold.woff2) format("woff2"); }
.lmnt-studio {
  --st-bg: #030303;
  --st-surface: #0d0d0d;
  --st-text: #f4f1ec;
  --st-text-72: rgba(244, 241, 236, 0.72);
  --st-muted: #8b8b87;
  --st-line: rgba(255, 255, 255, 0.09);
  --st-accent: #c4ee18;
  --st-accent-light: #dcff6b;
  --st-accent-dark: #8fb300;
  --st-accent-70: rgba(196, 238, 24, 0.7);
  --st-accent-45: rgba(196, 238, 24, 0.45);
  --st-accent-35: rgba(196, 238, 24, 0.35);
  --st-accent-03: rgba(196, 238, 24, 0.04);
  background: var(--st-bg);
  color: var(--st-text);
  font-family: "StudioGilroy", system-ui, sans-serif;
  overflow-x: clip;
}
.lmnt-studio ::selection { background: var(--st-accent); color: var(--st-bg); }
.lmnt-studio [id] { scroll-margin-top: 73px; }
@media (min-width: 900px) { .lmnt-studio [id] { scroll-margin-top: 89px; } }
.st-micro { font-size: 16px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; }
.st-title { font-size: 38px; font-weight: 400; letter-spacing: -0.025em; line-height: 1.05; }
@media (min-width: 640px) { .st-title { font-size: 46px; } }
@media (min-width: 1200px) { .st-title { font-size: 56px; } }
.st-ul { position: relative; }
.st-ul::after { content: ""; position: absolute; left: 0; bottom: -4px; width: 100%; height: 1px; background: var(--st-accent);
  transform: scaleX(0); transform-origin: left center; transition: transform .4s cubic-bezier(0.22,1,0.36,1); }
.st-ul:hover::after, .st-ul:focus-visible::after { transform: scaleX(1); }
.st-round { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 9999px; border: 1px solid var(--st-line);
  color: var(--st-text); transition: all .3s ease; }
.st-round:hover, .st-round:focus-visible { border-color: var(--st-accent); box-shadow: 0 0 24px var(--st-accent-35); }
.st-grain { background-image: url("data:image/svg+xml,${NOISE}"); animation: st-grain 1.2s steps(6) infinite; will-change: transform; }
/* На телефонах зерно стоит: полноэкранный анимированный слой — лишняя нагрузка на слабый GPU. */
@media (hover: none), (max-width: 767px) { .st-grain { animation: none; will-change: auto; } }
@keyframes st-grain { 0%{transform:translate(0,0)} 20%{transform:translate(-3%,2%)} 40%{transform:translate(2%,-3%)} 60%{transform:translate(-2%,-1%)} 80%{transform:translate(3%,3%)} 100%{transform:translate(0,0)} }
.st-sheen {
  background-image: linear-gradient(100deg, transparent 42%, rgba(248,255,220,0.5) 50%, transparent 58%), linear-gradient(100deg, var(--st-accent-light) 0%, var(--st-accent) 70%, var(--st-accent-dark) 130%);
  background-size: 250% 100%, 100% 100%; background-repeat: no-repeat; background-position: 100% 0, 0 0;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: st-sheen 7s ease-in-out 2s infinite;
}
@keyframes st-sheen { 0% { background-position: 100% 0, 0 0; } 45%, 100% { background-position: 0% 0, 0 0; } }
.st-spin { animation: st-spin 18s linear infinite; }
.st-spin-slow { animation: st-spin 24s linear infinite; }
@keyframes st-spin { to { transform: rotate(360deg); } }
.st-preloader { display: none; }
html[data-st-intro="play"] .st-preloader { display: flex; }
.st-lr-mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.12em; margin-bottom: -0.12em; }
.st-lr-word { display: inline-block; transform: translateY(105%) rotate(4deg); transform-origin: 0 100%; opacity: 0;
  transition: transform 1.1s cubic-bezier(0.22,1,0.36,1), opacity .6s ease; }
.st-lr-on .st-lr-word { transform: none; opacity: 1; }
.st-fm path { transition: fill .35s ease; }
.st-fm path:hover { fill: var(--c); }
.st-inf-run { stroke-dasharray: 0.3 0.7; opacity: 0; filter: drop-shadow(0 0 4px var(--st-accent-70));
  animation: st-inf-run 2.6s linear 1.2s infinite, st-inf-in .6s ease 1.2s forwards; }
@keyframes st-inf-run { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
@keyframes st-inf-in { to { opacity: 1; } }
.st-beat-host:hover .st-beat { animation: st-beat .8s ease-in-out infinite; }
@keyframes st-beat { 0%,100% { transform: scale(1); } 30% { transform: scale(1.22); } 60% { transform: scale(.95); } }
.lmnt-studio details > summary::-webkit-details-marker { display: none; }
.lmnt-studio details[open] .st-faq-icon { transform: rotate(135deg); }
/* Светлый блок: те же компоненты, но токены перевёрнуты — тёмное на белом. */
.lmnt-studio .st-light {
  background: #f4f1ec;
  color: #0a0a0a;
  --st-text: #0a0a0a;
  --st-text-72: rgba(10, 10, 10, 0.82);
  --st-muted: rgba(10, 10, 10, 0.72);
  --st-line: rgba(10, 10, 10, 0.12);
  --st-surface: #fbfaf7;
  --st-accent: #0a0a0a;
  --st-accent-light: #0a0a0a;
  --st-accent-45: rgba(10, 10, 10, 0.45);
  --st-accent-35: rgba(10, 10, 10, 0.18);
}
.st-input { width: 100%; background: transparent; border: 0; border-bottom: 1px solid var(--st-line); padding: 12px 0;
  font-size: 16px; color: var(--st-text); outline: none; transition: border-color .3s; }
.st-input::placeholder { color: var(--st-muted); }
.st-input:focus { border-color: var(--st-accent); }
@media (prefers-reduced-motion: reduce) {
  .st-grain, .st-sheen, .st-spin, .st-spin-slow, .st-inf-run, .st-beat-host:hover .st-beat { animation: none !important; }
  .st-inf-run { opacity: 1; }
  .st-lr-word { transform: none; opacity: 1; transition: none; }
  .st-preloader { display: none !important; }
}
`;

function Dot() {
  return <span aria-hidden className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--st-accent)]" />;
}

/** Заголовок секции + пояснение справа, как в оригинале. */
function SectionHead({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <Reveal>
      <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <h2 id={id} className="st-title">
          <LineReveal text={title} />
        </h2>
        <p className="max-w-[300px] text-[16px] leading-relaxed text-[var(--st-muted)] md:pb-1">
          <VariableProximity text={text} />
        </p>
      </div>
    </Reveal>
  );
}

const container = "mx-auto w-full max-w-[1440px] px-5 md:px-12";

/* ───────────────────────────── Шапка и меню ───────────────────────────── */

function StudioHeader({ onContact }: { onContact: () => void }) {
  const { t } = useStudioLocale();
  const nav = NAV_HREFS.map((href, i) => ({ href, label: t.nav[i] }));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[400ms]",
          scrolled ? "border-[var(--st-line)] bg-[rgba(3,3,3,0.72)] backdrop-blur-[14px]" : "border-transparent bg-transparent",
        )}
      >
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <div className={cn(container, "grid h-[72px] grid-cols-[1fr_auto] items-center md:h-[88px] xl:grid-cols-[1fr_auto_1fr]")}>
            <a href="#top" aria-label={t.homeAria} className="flex items-center gap-3 justify-self-start">
              <LemnityWordmark className="h-[18px] w-auto text-[var(--st-text)] md:h-5" />
              <span className="st-micro border-l border-[var(--st-line)] pl-3 text-[16px] text-[var(--st-muted)]">{t.studio}</span>
            </a>
            {/* На 16px меню и фраза справа помещаются в строку только на широком экране; уже — кнопка меню. */}
            <nav aria-label={t.sectionsAria} className="hidden items-center gap-8 xl:flex 2xl:gap-12">
              {nav.map((n) => (
                <a key={n.href} href={n.href} className="st-micro st-ul transition-colors hover:text-[var(--st-accent-light)]">
                  <VariableProximity text={n.label} />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4 justify-self-end">
              <LangSwitch />
              <button type="button" aria-label={t.openMenu} onClick={() => setOpen(true)} className="st-round">
                <Menu className="h-4 w-4 xl:hidden" />
                <MoreHorizontal className="hidden h-4 w-4 xl:block" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-[65]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label={t.closeMenu} className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t.menu}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-[var(--st-line)] bg-[var(--st-bg)] p-5 sm:w-[420px] sm:p-10"
            >
              <div className="flex items-center justify-between">
                <LemnityWordmark className="h-5 w-auto text-[var(--st-text)]" />
                <button type="button" aria-label={t.closeMenu} onClick={() => setOpen(false)} className="st-round">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav aria-label={t.sectionsAria} className="mt-16 flex flex-col gap-4 sm:mt-20">
                {nav.map((n, i) => (
                  <motion.a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: EASE }}
                    className="st-ul w-fit text-[36px] font-medium leading-[1.15] tracking-[-0.03em] transition-colors hover:text-[var(--st-accent-light)] sm:text-[44px]"
                  >
                    {n.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mt-auto border-t border-[var(--st-line)] pt-6">
                <p className="st-micro mb-4 text-[var(--st-muted)]">{t.contacts}</p>
                <div className="flex flex-col gap-3">
                  <a href={STUDIO_CONTACT_TG} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-[16px] hover:text-[var(--st-accent-light)]">
                    <Send className="h-5 w-5 text-[var(--st-accent)]" /> Telegram
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onContact();
                    }}
                    className="inline-flex items-center gap-3 text-left text-[16px] hover:text-[var(--st-accent-light)]"
                  >
                    <Mail className="h-5 w-5 text-[var(--st-accent)]" /> {STUDIO_CONTACT_EMAIL}
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* ───────────────────────────── Первый экран ───────────────────────────── */

/**
 * 3D-объект справа (у оригинала здесь портрет): сфера из шестиугольников с бегущей волной, на чёрном фоне.
 * При прокрутке объект уезжает вниз медленнее текста (параллакс), на телефоне стоит под кнопками.
 */
function HeroObject({ scroll }: { scroll: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const ready = useIntroReady();
  const y = useTransform(scroll, [0, 1], [0, reduce ? 0 : 140]);
  const scale = useTransform(scroll, [0, 1], [1, reduce ? 1 : 0.86]);
  // Размер резиновый: --st-sphere плавно тянется за шириной экрана (44vw, от 340 до 860px), без ступенек
  // на брейкпоинтах; по вертикали сфера всегда по центру первого экрана.
  return (
    <motion.div
      aria-hidden
      style={{ y, scale }}
      className="pointer-events-none relative z-[1] mx-auto mt-2 aspect-square w-full max-w-[min(100%,520px)] md:absolute md:mt-0 md:max-w-none md:[--st-sphere:clamp(340px,44vw,860px)] md:right-[clamp(120px,11vw,220px)] md:top-[calc(50%-var(--st-sphere)/2)] md:w-[var(--st-sphere)]"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
        className="relative h-full w-full"
      >
        <StudioHexSphere className="relative h-full w-full" />
      </motion.div>
    </motion.div>
  );
}

function Hero({ onContact }: { onContact: () => void }) {
  const { t } = useStudioLocale();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  // Пока идёт заставка, первый экран стоит в начальном состоянии и стартует с подъёмом занавеса.
  const ready = useIntroReady();
  const shown = ready ? { opacity: 1, y: 0 } : undefined;

  const fadeUp = (delay: number, duration = 0.9) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: shown,
    transition: { duration, delay, ease: EASE },
  });
  const fadeIn = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: shown,
    transition: { duration: 0.7, delay, ease: EASE },
  });
  const side = [...t.heroSide.top, t.heroSide.since, ...t.heroSide.places];

  return (
    <section id="top" ref={ref} className="relative overflow-hidden">
      <div className={cn(container, "relative flex flex-col pb-12 pt-[120px] md:min-h-[max(100vh,720px)] md:pb-20 md:pt-[150px] lg:pt-[170px]")}>
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-[3]">
          <div className="md:max-w-[52%] lg:max-w-[50%]">
            <motion.p {...fadeUp(0.2)} className="st-micro text-[16px] tracking-[0.12em] text-[var(--st-muted)]">
              <VariableProximity text={t.heroEyebrow} />
            </motion.p>
            <h1
              style={{ "--hero-scale": t.heroScale } as CSSProperties}
              className="mt-5 text-[calc(clamp(52px,15vw,72px)*var(--hero-scale))] font-normal leading-[0.95] tracking-[-0.04em] md:mt-6 md:text-[calc(clamp(72px,8.6vw,150px)*var(--hero-scale))]"
            >
              {t.heroLines.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 && " "}
                  <span className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
                    <motion.span
                      className={cn("block", i === t.heroAccent && "st-sheen")}
                      initial={reduce ? false : { y: "110%" }}
                      animate={ready ? { y: "0%" } : undefined}
                      transition={{ duration: 1, delay: 0.35 + i * 0.12, ease: EASE }}
                    >
                      <VariableProximity
                        text={line}
                        strokeColor={i === t.heroAccent ? "var(--st-accent-light)" : "var(--st-text)"}
                      />
                    </motion.span>
                  </span>
                </Fragment>
              ))}
            </h1>
            <motion.p {...fadeUp(0.7, 0.8)} className="mt-6 max-w-[440px] text-base leading-[1.55] text-[var(--st-text-72)] md:mt-8 md:max-w-[380px] md:text-lg lg:max-w-[440px]">
              <VariableProximity text={t.heroText} />
            </motion.p>
            <motion.div {...fadeUp(0.8, 0.8)} className="mt-8 flex flex-wrap items-center gap-6 md:mt-10 sm:gap-8">
              <MagneticButton>
                <a
                  href="#work"
                  className="group inline-flex items-center gap-4 rounded-full border border-[var(--st-accent)] px-7 py-3.5 text-[16px] font-medium transition-colors hover:border-[var(--st-accent-light)] hover:bg-[rgba(196,238,24,0.1)] md:px-9 md:py-[18px]"
                >
                  <VariableProximity text={t.seeWork} />
                  <ArrowRight className="h-4 w-4 transition-transform duration-[350ms] group-hover:translate-x-[5px]" />
                </a>
              </MagneticButton>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onContact}
                  className="st-ul text-[16px] underline decoration-[rgba(244,241,236,0.5)] underline-offset-4 transition-colors hover:text-[var(--st-accent-light)] hover:decoration-transparent"
                >
                  {t.writeUs}
                </button>
                <Dot />
              </span>
            </motion.div>

            <motion.div {...fadeIn(0.9)} className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 md:hidden">
              {side.map((label) => (
                <span key={label} className="st-micro text-[16px] leading-[1.9] tracking-[0.12em] text-[var(--st-muted)]">
                  {label}
                </span>
              ))}
              <Globe aria-hidden className="st-spin h-4 w-4 text-[var(--st-muted)]" />
            </motion.div>
          </div>
        </motion.div>

        <HeroObject scroll={scrollYProgress} />

        {/* Боковая колонка, как у оригинала, без подписи автора. */}
        <div className="absolute bottom-14 right-12 top-[140px] z-[3] hidden w-[120px] flex-col justify-between md:flex lg:bottom-[72px] lg:top-[170px]">
          <div>
            {t.heroSide.top.map((label, i) => (
              <motion.p key={label} {...fadeIn(0.6 + i * 0.08)} className="st-micro text-[16px] leading-[1.9] tracking-[0.12em]">
                {label}
              </motion.p>
            ))}
            <motion.div {...fadeIn(0.84)}>
              <div className="my-5 h-px w-5 bg-[var(--st-muted)]" />
              <p className="st-micro text-[16px] leading-[1.9] tracking-[0.12em]">{t.heroSide.since}</p>
            </motion.div>
          </div>
          <div>
            {t.heroSide.places.map((label, i) => (
              <motion.p key={label} {...fadeIn(0.9 + i * 0.08)} className="st-micro text-[16px] leading-[1.9] tracking-[0.12em]">
                {label}
              </motion.p>
            ))}
            <motion.div {...fadeIn(1.1)}>
              <Globe aria-hidden className="st-spin mt-3 h-[18px] w-[18px]" />
            </motion.div>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[120px] bg-gradient-to-b from-transparent to-[var(--st-bg)]" />
    </section>
  );
}

/* ───────────────────────────── Манифест ───────────────────────────── */

type ManifestoWord = { parts: { text: string; accent: boolean }[]; space: boolean };

/**
 * Разбирает текст манифеста на слова: фрагменты в [скобках] — акцент. Знак препинания сразу после
 * выделения («[UX],») склеивается с ним в одно слово, чтобы перенос строки их не разорвал.
 */
function parseManifesto(text: string): ManifestoWord[] {
  const words: ManifestoWord[] = [];
  let glue = false;
  for (const [i, segment] of text.split(/\[([^\]]+)\]/).entries()) {
    const accent = i % 2 === 1;
    for (const piece of segment.split(/(\s+)/)) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) {
        if (words.length) words[words.length - 1].space = true;
        glue = false;
        continue;
      }
      const last = words[words.length - 1];
      if (glue && last && !last.space) last.parts.push({ text: piece, accent });
      else words.push({ parts: [{ text: piece, accent }], space: false });
      glue = true;
    }
  }
  return words;
}

/** Крупный текст о студии сразу после первого экрана: слова проявляются по мере прокрутки, ключевые — лаймом. */
function Manifesto() {
  const { t } = useStudioLocale();
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const words = parseManifesto(t.manifesto);

  return (
    <section className="relative">
      <div className={cn(container, "py-20 md:py-32")}>
        <p ref={ref} className="m-0 max-w-[1280px] text-[clamp(30px,4.4vw,68px)] font-normal leading-[1.1] tracking-[-0.03em]">
          <span className="sr-only">{t.manifesto.replace(/[[\]]/g, "")}</span>
          <span aria-hidden>
            {words.map((w, i) => {
              const content = (
                <>
                  {w.parts.map((part, pi) => (
                    <span key={pi} className={part.accent ? "text-[var(--st-accent)]" : undefined}>
                      {part.text}
                    </span>
                  ))}
                  {w.space ? " " : null}
                </>
              );
              return reduce ? (
                <span key={i}>{content}</span>
              ) : (
                <Word key={i} progress={scrollYProgress} index={i} total={words.length}>
                  {content}
                </Word>
              );
            })}
          </span>
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────── Проекты ───────────────────────────── */

/**
 * Показывает только `project.crop` исходника и растягивает его на слот, как `object-fit: cover`
 * по вырезанному кадру (CroppedImage из smkv): у концепт-картинок по краям вшиты чужие надписи.
 */
function ProjectImage({ project }: { project: StudioProject }) {
  const c = project.crop;
  if (!c) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.image}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ objectPosition: project.focus }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  const ratio = c.w / c.h;
  const [fx, fy] = project.focus.split(" ").map((v) => parseFloat(v) / 100);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ containerType: "size" }}>
      <div
        className="absolute overflow-hidden"
        style={
          {
            "--fw": `max(100cqw, calc(100cqh * ${ratio}))`,
            width: "var(--fw)",
            aspectRatio: `${c.w} / ${c.h}`,
            left: `calc((100cqw - var(--fw)) * ${fx})`,
            top: `calc((100cqh - var(--fw) / ${ratio}) * ${fy})`,
          } as React.CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute h-auto max-w-none select-none"
          style={{
            width: `${(c.imgW / c.w) * 100}%`,
            left: `${(-c.x / c.w) * 100}%`,
            top: `${(-c.y / c.h) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function ArrowCircle({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="st-row-arrow grid place-items-center rounded-full border border-[rgba(244,241,236,0.35)] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <ArrowRight className="h-[18px] w-[18px]" />
    </span>
  );
}

const rowHover =
  "[&:hover_.st-row-arrow]:-rotate-45 [&:hover_.st-row-arrow]:border-[var(--st-accent)] [&:hover_.st-row-arrow]:bg-[var(--st-accent)] [&:hover_.st-row-arrow]:text-[var(--st-bg)]";

function FlagshipRow({ project }: { project: StudioProject }) {
  const { t } = useStudioLocale();
  return (
    <Reveal className="border-b border-[var(--st-line)]">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.openProject(project.title)}
        data-cursor={t.cursorView}
        className={cn(
          "grid grid-cols-[40px_1fr] items-center gap-x-3 gap-y-5 py-8 transition-colors hover:bg-[var(--st-accent-03)] md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-x-8 md:px-2 md:py-10 [&:hover_.st-flag-media]:scale-[1.03]",
          rowHover,
        )}
      >
        <span className="self-start pt-2 text-[16px] tracking-[0.12em] text-[var(--st-accent)]">{project.number}</span>
        <div className="min-w-0">
          <span className="mb-5 inline-block rounded-full bg-[var(--st-accent)] px-3 py-1 text-[16px] font-semibold uppercase tracking-[0.12em] text-[var(--st-bg)] md:mb-6">
            {t.ourProduct}
          </span>
          <h3 className="m-0 leading-none">
            {project.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.logo.src} alt={project.title} width={project.logo.width} height={project.logo.height} className="block h-[52px] w-auto max-w-full md:h-[76px] lg:h-[92px]" />
            ) : (
              <span className="text-5xl md:text-7xl">{project.title}</span>
            )}
          </h3>
          <p className="mt-5 max-w-[440px] text-[16px] leading-normal text-[rgba(244,241,236,0.8)] md:mt-6 md:text-lg">
            <VariableProximity text={project.description} />
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <ArrowCircle size={52} />
            <span className="text-[16px] text-[var(--st-muted)]">{project.tags.map((t) => `#${t}`).join("  ")}</span>
          </div>
        </div>
        <div className="relative col-start-2 aspect-[16/10] overflow-hidden rounded-lg border border-[var(--st-line)] shadow-[0_40px_80px_-40px_var(--st-accent-35)] md:col-start-auto">
          <div className="st-flag-media absolute inset-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <ParallaxMedia>
              <ProjectImage project={project} />
            </ParallaxMedia>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

/**
 * Строка проекта при наведении заливается акцентом снизу вверх, текст и стрелка становятся тёмными.
 * Заливка — псевдоэлемент под контентом, поэтому дочерние элементы подняты над ним.
 */
const rowFill =
  "before:absolute before:inset-0 before:origin-bottom before:scale-y-0 before:bg-[var(--st-accent)] before:transition-transform before:duration-[450ms] before:ease-[cubic-bezier(0.22,1,0.36,1)] before:content-[''] hover:before:scale-y-100 focus-visible:before:scale-y-100 [&>*]:relative [&>*]:z-[1] " +
  "[&:hover_.st-row-arrow]:-rotate-45 [&:hover_.st-row-arrow]:border-[var(--st-bg)] [&:hover_.st-row-arrow]:bg-[var(--st-bg)] [&:hover_.st-row-arrow]:text-[var(--st-accent)] " +
  "[&:focus-visible_.st-row-arrow]:-rotate-45 [&:focus-visible_.st-row-arrow]:border-[var(--st-bg)] [&:focus-visible_.st-row-arrow]:bg-[var(--st-bg)] [&:focus-visible_.st-row-arrow]:text-[var(--st-accent)]";
const onFill = "transition-colors duration-300 group-hover:text-[var(--st-bg)] group-focus-visible:text-[var(--st-bg)]";

function ProjectRow({ project, onHover }: { project: StudioProject; onHover: (p: StudioProject | null) => void }) {
  const { t } = useStudioLocale();
  // Незапущенный проект — не ссылка: строка та же, но клик никуда не ведёт.
  const Row = project.soon ? "div" : "a";
  const link = project.soon
    ? {}
    : { href: project.url, target: "_blank", rel: "noopener noreferrer", "aria-label": t.openProject(project.title) };
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(project)}
      onPointerLeave={() => onHover(null)}
      className="border-b border-[var(--st-line)]"
    >
      <Row
        {...link}
        data-cursor={project.soon ? t.soon : t.cursorView}
        data-cursor-tone="dark"
        className={cn(
          "group relative grid grid-cols-[40px_1fr_auto] items-start gap-x-3 gap-y-2.5 py-6 transition-[padding] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] [grid-template-areas:'num_title_end'_'num_desc_desc'_'num_thumb_thumb'] md:grid-cols-[64px_minmax(0,1.1fr)_minmax(0,1fr)_132px] md:items-center md:gap-x-8 md:px-2 md:py-7 md:[grid-template-areas:'num_title_desc_end'] md:hover:px-6 md:focus-visible:px-6",
          rowFill,
        )}
      >
        <span className={cn("pt-2 text-[16px] tracking-[0.12em] text-[var(--st-muted)] [grid-area:num] md:pt-0", onFill)}>{project.number}</span>
        <h3 className={cn("text-[26px] font-normal leading-[1.1] tracking-[-0.02em] [grid-area:title] md:text-[34px] lg:text-[40px]", onFill)}>
          <VariableProximity text={project.title} />
        </h3>
        <div className="min-w-0 [grid-area:desc]">
          <p className={cn("max-w-[420px] text-[16px] leading-[1.55] text-[var(--st-text-72)]", onFill)}>
            <VariableProximity text={project.description} />
          </p>
          <p className={cn("mt-1.5 text-[16px] text-[var(--st-muted)]", onFill)}>{project.tags.map((t) => `#${t}`).join("  ")}</p>
        </div>
        <div className="relative mt-1 aspect-[16/10] overflow-hidden rounded border border-[var(--st-line)] [grid-area:thumb] md:hidden">
          <ProjectImage project={project} />
        </div>
        <div className="justify-self-end [grid-area:end]">
          {project.soon ? (
            <span className={cn("st-micro inline-block rounded-full border border-current px-4 py-2 text-[var(--st-muted)]", onFill)}>{t.soon}</span>
          ) : (
            <ArrowCircle />
          )}
        </div>
      </Row>
    </motion.li>
  );
}

const PREVIEW_W = 380;
const PREVIEW_H = 240;

function Projects() {
  const { t, c } = useStudioLocale();
  const [flagship, ...rest] = c.projects;
  const reduce = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 900px)");
  const [hovered, setHovered] = useState<StudioProject | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 220, damping: 26, mass: 0.5 });
  const y = useSpring(py, { stiffness: 220, damping: 26, mass: 0.5 });
  const follow = (e: React.PointerEvent) => {
    // Отступ больше радиуса круга курсора «Смотреть» (64px), чтобы превью не наезжало на него.
    px.set(e.clientX + 80);
    py.set(e.clientY - PREVIEW_H / 2);
  };

  return (
    <section id="work" aria-labelledby="work-title">
      <div className={cn(container, "py-16 md:py-12")}>
        <SectionHead id="work-title" title={t.workTitle} text={t.workText} />
        <div onPointerMove={canHover ? follow : undefined} className="border-t border-[var(--st-line)]">
          <FlagshipRow project={flagship} />
          <ul className="m-0 list-none p-0">
            {rest.map((p) => (
              <ProjectRow key={p.id} project={p} onHover={canHover ? setHovered : () => {}} />
            ))}
          </ul>
        </div>
      </div>

      {canHover ? (
        <motion.div
          aria-hidden
          style={{ x, y, width: PREVIEW_W, height: PREVIEW_H }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          className="pointer-events-none fixed left-0 top-0 z-40 overflow-hidden rounded-lg border border-[var(--st-accent-35)] bg-[var(--st-surface)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
        >
          <AnimatePresence initial={false}>
            {hovered ? (
              <motion.div
                key={hovered.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <ProjectImage project={hovered} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </section>
  );
}

/* ───────────────────────────── Галерея ───────────────────────────── */

function Lightbox({ index, onClose, onChange }: { index: number | null; onClose: () => void; onChange: (i: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { t, c } = useStudioLocale();
  const works = c.works;
  const total = works.length;
  const work = index === null ? null : works[index];

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onChange((index + dir + total) % total);
    },
    [index, onChange, total],
  );

  useEffect(() => {
    if (index === null) return;
    scrollRef.current?.scrollTo({ top: 0 });
    for (const n of [index - 1, index + 1]) {
      const img = new Image();
      img.src = works[(n + total) % total].full;
    }
  }, [index, total, works]);

  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, go, onClose]);

  return (
    <AnimatePresence>
      {work && index !== null ? (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="st-lightbox-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[66] flex flex-col bg-[rgba(3,3,3,0.97)] backdrop-blur-[10px]"
        >
          <div className="flex items-center gap-4 border-b border-[var(--st-line)] px-5 py-3 md:px-12 md:py-4">
            <span aria-live="polite" className="st-micro shrink-0 tabular-nums text-[var(--st-accent)]">
              {pad(index + 1)} / {pad(total)}
            </span>
            <h2 id="st-lightbox-title" className="min-w-0 flex-1 truncate text-[16px] text-[var(--st-muted)]">
              {work.alt}
            </h2>
            <button ref={closeRef} type="button" aria-label={t.closeView} onClick={onClose} className="st-round shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <button type="button" aria-label={t.prevWork} onClick={() => go(-1)} className="st-round absolute left-2 top-1/2 z-[2] -translate-y-1/2 bg-[rgba(3,3,3,0.6)] backdrop-blur-sm md:left-6">
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>
            <button type="button" aria-label={t.nextWork} onClick={() => go(1)} className="st-round absolute right-2 top-1/2 z-[2] -translate-y-1/2 bg-[rgba(3,3,3,0.6)] backdrop-blur-sm md:right-6">
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
            <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
              <div className="flex min-h-full items-center justify-center px-5 py-4 md:px-24 md:py-8">
                <motion.img
                  key={work.full}
                  src={work.full}
                  alt={work.alt}
                  width={work.fullWidth}
                  height={work.fullHeight}
                  decoding="async"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  style={{ maxWidth: Math.min(work.fullWidth, 1200) }}
                  className="block h-auto w-full rounded"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Gallery() {
  const { t, c } = useStudioLocale();
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <section id="gallery" aria-labelledby="gallery-title">
      <div className={cn(container, "py-16 md:py-20")}>
        <SectionHead id="gallery-title" title={t.galleryTitle} text={t.galleryText} />
        <ul className="m-0 list-none columns-2 gap-3 p-0 md:columns-3 md:gap-[18px] min-[1440px]:columns-4 [&>li]:mb-3 md:[&>li]:mb-[18px]">
          {c.works.map((w, i) => (
            <li key={w.src} className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={t.openWork(w.alt)}
                  aria-haspopup="dialog"
                  data-cursor={t.cursorOpen}
                  className="group relative block w-full overflow-hidden rounded border border-[var(--st-line)] bg-[var(--st-surface)] transition-[border-color,box-shadow] duration-[400ms] hover:border-[var(--st-accent-45)] hover:shadow-[0_0_28px_rgba(196,238,24,0.12)] focus-visible:border-[var(--st-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--st-accent)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.src}
                    alt={w.alt}
                    width={w.width}
                    height={w.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                  />
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent from-40% to-[rgba(3,3,3,0.55)] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100 group-focus-visible:opacity-100">
                    {/* С мышью вместо значка лупы появляется круг курсора «Открыть». */}
                    <span className="grid h-[52px] w-[52px] scale-[0.8] place-items-center rounded-full bg-[var(--st-accent)] text-[var(--st-bg)] transition-transform duration-[400ms] group-hover:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hidden">
                      <ZoomIn className="h-5 w-5" />
                    </span>
                  </span>
                </button>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox index={active} onClose={close} onChange={setActive} />
    </section>
  );
}

/* ───────────────────────────── Клиенты ───────────────────────────── */

function ClientLogo({ client }: { client: StudioContent["clients"][number] }) {
  return (
    <div aria-hidden className="grid h-[92px] w-[168px] shrink-0 place-items-center rounded border border-[var(--st-line)] transition-colors hover:border-[var(--st-accent-45)] hover:bg-[var(--st-accent-03)] md:h-[120px] md:w-[232px] [&:hover_img]:opacity-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={client.src}
        alt=""
        width={client.width}
        height={client.height}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ filter: clientLogoFilter(client) }}
        className="h-auto max-h-[34px] w-auto max-w-[62%] opacity-50 transition-opacity md:max-h-[42px]"
      />
    </div>
  );
}

function Clients() {
  const { t, c } = useStudioLocale();
  const reduce = useReducedMotion();
  return (
    <section id="clients" aria-labelledby="clients-title">
      <div className={cn(container, "py-16 md:py-20")}>
        <SectionHead id="clients-title" title={t.clientsTitle} text={t.clientsText} />
        <ul className="sr-only">
          {c.clients.map((client) => (
            <li key={client.src}>{client.name}</li>
          ))}
        </ul>
        <Reveal delay={0.1}>
          {reduce ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 [&>div]:w-auto">
              {c.clients.map((client) => (
                <ClientLogo key={client.src} client={client} />
              ))}
              <ClientSlotCta />
            </div>
          ) : (
            <LogoSlots />
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Услуги и процесс ───────────────────────────── */

const cardClass =
  "flex h-full flex-col gap-4 rounded border border-[var(--st-line)] bg-[var(--st-surface)] p-5 transition-[border-color,box-shadow] duration-300 hover:border-[var(--st-accent-45)] hover:shadow-[0_0_32px_rgba(196,238,24,0.06)] md:p-6";

/**
 * Раскладка услуг без дыр: на ПК — три карточки, потом две пошире, потом игры во всю строку
 * (слева текст, справа игровая сцена); на планшете — 2×2, затем MVP и игры во всю ширину.
 */
function serviceSpan(i: number, s: StudioService) {
  if (s.game) return "md:col-span-2 lg:col-span-6";
  if (i < 3) return "lg:col-span-2";
  return i === 4 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3";
}

function ServiceBody({ service: s }: { service: StudioService }) {
  const { t } = useStudioLocale();
  return (
    <>
      <h3 className="text-xl font-medium leading-[1.25] tracking-[-0.01em] md:text-[22px]">
        <VariableProximity text={s.title} />
      </h3>
      <p className="text-[16px] leading-[1.65] text-[var(--st-text-72)]">
        <VariableProximity text={s.text} />
      </p>
      <ul aria-label={t.included} className="m-0 mt-auto grid list-none gap-1.5 p-0 pt-2">
        {s.deliverables.map((d) => (
          <li key={d} className="relative pl-[18px] text-[16px] leading-normal before:absolute before:left-0 before:top-[0.6em] before:h-px before:w-2 before:bg-[var(--st-accent)]">
            <VariableProximity text={d} />
          </li>
        ))}
      </ul>
    </>
  );
}

function Services() {
  const { t, c } = useStudioLocale();
  return (
    <section id="services" aria-labelledby="services-title" data-cursor-tone="dark" className="st-light">
      <div className={cn(container, "py-16 md:py-20")}>
        <SectionHead id="services-title" title={t.servicesTitle} text={t.servicesText} />
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-6">
          {c.services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.08} className={serviceSpan(i, s)}>
              {s.game ? (
                <article className={cn(cardClass, "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-8")}>
                  <div className="flex flex-col gap-4">
                    <ServiceBody service={s} />
                  </div>
                  <StudioGame className="order-first h-[180px] md:order-none md:h-auto md:min-h-[280px]" />
                </article>
              ) : (
                <article className={cardClass}>
                  <ServiceBody service={s} />
                </article>
              )}
            </Reveal>
          ))}
        </div>

        <div className="mt-14 md:mt-[72px]">
          <Reveal>
            <h3 className="mb-6 text-[28px] font-normal leading-[1.1] tracking-[-0.02em] md:mb-8 md:text-[34px]">
              <VariableProximity text={t.processTitle} />
            </h3>
          </Reveal>
          {/* На двух колонках пятый шаг растянут на всю ширину — иначе он стоял бы в строке один. */}
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 md:gap-4 lg:grid-cols-5 sm:[&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-1">
            {c.process.map((p, i) => (
              <li key={p.title} className="flex [&>div]:flex [&>div]:min-w-0 [&>div]:flex-1">
                <Reveal delay={i * 0.06}>
                  <div className={cn(cardClass, "flex-1 gap-2.5")}>
                    <span aria-hidden className="text-[16px] tracking-[0.12em] text-[var(--st-accent)]">
                      {pad(i + 1)}
                    </span>
                    <h4 className="text-[17px] font-medium leading-[1.3]">
                      <VariableProximity text={p.title} />
                    </h4>
                    <p className="text-[16px] leading-[1.6] text-[var(--st-muted)]">
                      <VariableProximity text={p.text} />
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── О студии ───────────────────────────── */

const numberClass = "flex h-11 items-center text-4xl font-normal leading-none tracking-[-0.02em] md:text-[40px]";

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const shown = reduce ? value : n;
  const suffixOn = reduce || done;
  return (
    <p ref={ref} className={numberClass}>
      <span className="sr-only">{`${value}${suffix}`}</span>
      <span aria-hidden>{shown}</span>
      {suffix ? (
        <span
          aria-hidden
          className="inline-block transition-[opacity,transform] duration-[400ms]"
          style={{ opacity: suffixOn ? 1 : 0, transform: suffixOn ? "none" : "translateY(6px)" }}
        >
          {suffix}
        </span>
      ) : null}
    </p>
  );
}

/** Восьмёрка одной линией через центр (viewBox 48×24). */
const LEMNISCATE =
  "M24,12 C28,6 33,4 37,4 C42,4 45,8 45,12 C45,16 42,20 37,20 C33,20 28,18 24,12 " +
  "C20,6 15,4 11,4 C6,4 3,8 3,12 C3,16 6,20 11,20 C15,20 20,18 24,12 Z";

function InfinityMark() {
  const { t } = useStudioLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const stroke = { fill: "none", strokeWidth: 3.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <div ref={ref} className={numberClass} role="img" aria-label={t.infinity}>
      <svg aria-hidden viewBox="0 0 48 24" className="h-6 w-12 overflow-visible">
        <motion.path
          d={LEMNISCATE}
          {...stroke}
          stroke="var(--st-accent)"
          initial={reduce ? false : { pathLength: 0, opacity: 1 }}
          animate={inView || reduce ? { pathLength: 1, opacity: reduce ? 1 : 0.32 } : undefined}
          transition={{ pathLength: { duration: 1.4, ease: "easeInOut" }, opacity: { duration: 0.8, delay: 1.4 } }}
        />
        {!reduce && inView ? <path d={LEMNISCATE} {...stroke} stroke="var(--st-accent)" pathLength={1} className="st-inf-run" /> : null}
      </svg>
    </div>
  );
}

function Stat({ stat }: { stat: StudioStat }) {
  return (
    <div>
      {stat.kind === "number" ? <CountUp value={stat.value} suffix={stat.suffix} /> : <InfinityMark />}
      <p className="st-micro mt-3 whitespace-nowrap text-[16px] tracking-[0.12em] opacity-80">
        <VariableProximity text={stat.label} />
      </p>
    </div>
  );
}

/* Scroll Reveal (React Bits): слова проявляются из 10% и теряют размытие, блок выпрямляется. */
const staggerFor = (total: number) => Math.max(0.05, 2.5 / total);

function Word({ children, progress, index, total }: { children: ReactNode; progress: MotionValue<number>; index: number; total: number }) {
  const stagger = staggerFor(total);
  const span = 1 + (total - 1) * stagger;
  const local = useTransform(progress, (p) => Math.min(1, Math.max(0, p * span - index * stagger)));
  const opacity = useTransform(local, [0, 1], [0.1, 1]);
  const filter = useTransform(local, (t) => `blur(${((1 - t) * 4).toFixed(2)}px)`);
  return <motion.span style={{ opacity, filter, display: "inline-block", whiteSpace: "pre" }}>{children}</motion.span>;
}

function QuoteBlock() {
  const { c } = useStudioLocale();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: words } = useScroll({ target: ref, offset: ["start 0.92", "start 0.25"] });
  const { scrollYProgress: tilt } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const rotate = useTransform(tilt, [0, 1], [3, 0]);
  const lines = c.quote.map((l) => l.split(" "));
  const total = lines.flat().length;
  let i = 0;

  return (
    <div ref={ref} className="relative pl-10 pt-2 md:pl-[52px]">
      <Quote aria-hidden className="absolute -left-1 -top-3 h-12 w-12 rotate-180 text-[var(--st-accent)] opacity-[0.22] md:-top-4 md:h-14 md:w-14" />
      <motion.div style={reduce ? undefined : { rotate, transformOrigin: "0% 50%" }}>
        <blockquote className="m-0 text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-4xl md:text-[34px] lg:text-[46px]">
          <span className="sr-only">{c.quote.join(" ")}</span>
          {lines.map((line, li) => (
            <span key={li} aria-hidden className="block">
              {line.map((w, wi) => {
                const idx = i++;
                const word = wi < line.length - 1 ? `${w} ` : w;
                return reduce ? (
                  <span key={wi}>{word}</span>
                ) : (
                  <Word key={wi} progress={words} index={idx} total={total}>
                    {word}
                  </Word>
                );
              })}
            </span>
          ))}
        </blockquote>
      </motion.div>
    </div>
  );
}

function CreateTogether({ onContact }: { onContact: () => void }) {
  const { t } = useStudioLocale();
  return (
    <button
      type="button"
      onClick={onContact}
      aria-label={t.togetherAria}
      className="group flex shrink-0 items-center gap-6 rounded-full text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[10px] focus-visible:outline-[var(--st-accent)]"
    >
      <span aria-hidden className="relative h-[72px] w-[72px] shrink-0">
        <span className="st-spin-slow pointer-events-none absolute -inset-[7px] rounded-full border border-dashed border-[rgba(196,238,24,0.55)]" />
        <span className="st-round !h-[72px] !w-[72px] !border-[rgba(244,241,236,0.3)] group-hover:!border-[var(--st-accent)] group-hover:shadow-[0_0_24px_var(--st-accent-35)]">
          <MoreHorizontal className="h-5 w-5" />
        </span>
      </span>
      <span aria-hidden className="transition-colors duration-300 group-hover:text-[var(--st-accent-light)]">
        {t.togetherLines.map((line, i, all) => (
          <span key={line} className="st-micro flex items-center gap-3 text-[16px] leading-[1.9] tracking-[0.12em]">
            <VariableProximity text={line} />
            {i === all.length - 1 ? <Dot /> : null}
          </span>
        ))}
      </span>
    </button>
  );
}

function About({ onContact }: { onContact: () => void }) {
  const { t, c } = useStudioLocale();
  return (
    <section id="about" aria-labelledby="about-title">
      <div className={cn(container, "grid gap-y-12 py-16 md:grid-cols-[minmax(0,34fr)_auto_minmax(0,66fr)] md:gap-x-8 md:py-12 lg:gap-x-10")}>
        <Reveal>
          <div className="md:pr-4">
            <h2 id="about-title" className="st-title !text-[38px] sm:!text-[44px] md:!text-[42px] lg:!text-[48px]">
              <span className="block">
                <LineReveal text={t.aboutHead[0]} />
              </span>
              <span className="block">
                <DrawnUnderline delay={0.7}>
                  <LineReveal text={t.aboutHead[1]} delay={0.12} />
                </DrawnUnderline>
              </span>
            </h2>
            <p className="mt-6 max-w-[360px] text-[16px] leading-[1.7] text-[var(--st-text-72)]">
              <VariableProximity text={t.aboutText} />
            </p>
            <span className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={onContact}
                className="st-ul text-[16px] underline decoration-[rgba(244,241,236,0.5)] underline-offset-4 transition-colors hover:text-[var(--st-accent-light)] hover:decoration-transparent"
              >
                {t.discuss}
              </button>
              <Dot />
            </span>
          </div>
        </Reveal>

        <div aria-hidden className="hidden w-px bg-[var(--st-line)] md:block" />

        <div className="min-w-0">
          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:pt-3">
              {c.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={cn(
                    i % 2 ? "border-l border-[var(--st-line)] px-6" : "",
                    "md:border-l md:px-5 lg:px-10",
                    i === 0 ? "md:border-l-0 md:pl-0" : "md:border-[var(--st-line)]",
                  )}
                >
                  <Stat stat={s} />
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-14 flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center md:mt-16 md:gap-8 md:pl-3">
              <QuoteBlock />
              <CreateTogether onContact={onContact} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

function Faq() {
  const { t, c } = useStudioLocale();
  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className={cn(container, "grid items-start gap-8 py-16 md:grid-cols-[1fr_2fr] md:gap-12 md:py-20")}>
        <Reveal>
          <h2 id="faq-title" className="st-title">
            <LineReveal text={t.faqTitle} />
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="border-t border-[var(--st-line)]">
            {c.faq.map((f) => (
              <details key={f.q} className="group border-b border-[var(--st-line)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 md:py-5">
                  <span className="text-[17px] font-medium leading-[1.3] transition-colors group-hover:text-[var(--st-accent-light)] md:text-xl">
                    <VariableProximity text={f.q} />
                  </span>
                  <Plus className="st-faq-icon h-5 w-5 shrink-0 text-[var(--st-accent)] transition-transform duration-300" />
                </summary>
                <p className="max-w-[720px] pb-6 text-[16px] leading-[1.7] text-[var(--st-muted)]">
                  <VariableProximity text={f.a} />
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Контакты ───────────────────────────── */

function buildMailto(form: Ui["form"], topic: string, name: string, contact: string, message: string): string {
  const subject = form.subject(topic);
  const body = [`${form.name}: ${name}`, `${form.contact}: ${contact}`, `${form.topic}: ${topic}`, "", message].join("\n");
  return `mailto:${STUDIO_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Contact() {
  const { t, c } = useStudioLocale();
  const f = t.form;
  const [topic, setTopic] = useState(c.topics[0]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Форма доезжает снизу вместе с прокруткой (у illan: `y: 14rem → 0` от «top 95%» до «top 30%»).
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 95%", "start 30%"] });
  const formY = useTransform(scrollYProgress, [0, 1], [reduce || !wide ? 0 : 224, 0]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(f.errName);
    if (!contact.trim()) return setError(f.errContact);
    if (message.trim().length < 10) return setError(f.errMessage);
    setError(null);
    window.location.href = buildMailto(f, topic, name.trim(), contact.trim(), message.trim());
  };

  return (
    <section ref={sectionRef} id="contact" aria-labelledby="contact-title" className="border-t border-[var(--st-line)]">
      <div className={cn(container, "grid gap-12 py-16 md:grid-cols-2 md:py-24")}>
        <Reveal>
          <p className="st-micro text-[var(--st-accent)]">{f.label}</p>
          <h2 id="contact-title" className="mt-4 text-[48px] font-normal leading-[0.95] tracking-[-0.04em] md:text-[88px]">
            <LineReveal text={f.head[0]} />
            <br />
            <DrawnCircle delay={0.6}>
              <span className="st-sheen">{f.head[1]}</span>
            </DrawnCircle>
          </h2>
          <p className="mt-6 max-w-[380px] text-base leading-[1.6] text-[var(--st-text-72)]">
            <VariableProximity text={f.text} />
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <a href={STUDIO_CONTACT_TG} target="_blank" rel="noopener noreferrer" className="st-ul inline-flex w-fit items-center gap-3 text-[16px] hover:text-[var(--st-accent-light)]">
              <Send className="h-5 w-5 text-[var(--st-accent)]" /> Telegram
            </a>
            <a href={`mailto:${STUDIO_CONTACT_EMAIL}`} className="st-ul inline-flex w-fit items-center gap-3 text-[16px] hover:text-[var(--st-accent-light)]">
              <Mail className="h-5 w-5 text-[var(--st-accent)]" /> {STUDIO_CONTACT_EMAIL}
            </a>
          </div>
        </Reveal>

        <motion.div style={{ y: formY }}>
          <form onSubmit={onSubmit} noValidate className="rounded border border-[var(--st-line)] bg-[var(--st-surface)] p-6 md:p-10">
            <fieldset>
              <legend className="st-micro mb-4 text-[var(--st-muted)]">{f.need}</legend>
              <div className="flex flex-wrap gap-2">
                {c.topics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={topic === item}
                    onClick={() => setTopic(item)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[16px] transition-colors",
                      topic === item
                        ? "border-[var(--st-accent)] bg-[var(--st-accent)] text-[var(--st-bg)]"
                        : "border-[var(--st-line)] text-[var(--st-muted)] hover:border-[var(--st-accent-45)] hover:text-[var(--st-text)]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 grid gap-2">
              <label className="sr-only" htmlFor="st-name">{f.name}</label>
              <input id="st-name" className="st-input" placeholder={f.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />
              <label className="sr-only" htmlFor="st-contact">{f.contactPlaceholder}</label>
              <input id="st-contact" className="st-input" placeholder={f.contactPlaceholder} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={160} />
              <label className="sr-only" htmlFor="st-message">{f.message}</label>
              <textarea id="st-message" className="st-input min-h-28 resize-y" placeholder={f.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} />
            </div>
            {error ? (
              <p role="alert" className="mt-4 text-[16px] text-[#ff7b6b]">
                {error}
              </p>
            ) : null}
            <MagneticButton strength={6}>
              <button type="submit" className="group mt-8 inline-flex items-center gap-4 rounded-full bg-[var(--st-accent)] py-2 pl-7 pr-2 text-[16px] font-semibold text-[var(--st-bg)] transition-transform hover:-translate-y-0.5">
                {f.send}
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--st-bg)] text-[var(--st-accent)] transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </MagneticButton>
            <p className="mt-5 text-[16px] leading-relaxed text-[var(--st-muted)]">
              {f.consent[0]}{" "}
              <a href={STUDIO_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--st-text)]">
                {f.consent[1]}
              </a>
              {f.consent[2] ? ` ${f.consent[2]}` : ""}.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Плавающая кнопка и подвал ───────────────────────────── */

function FloatingCta({ onContact }: { onContact: () => void }) {
  const { t } = useStudioLocale();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  // Над светлым блоком кнопка становится тёмной — так она заметнее на белом.
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const contact = document.getElementById("contact");
      const contactTop = contact ? contact.getBoundingClientRect().top + y : Infinity;
      setVisible(y > window.innerHeight * 0.6 && y + window.innerHeight < contactTop + 160);
      const ctaY = window.innerHeight - 48;
      setOnLight(
        Array.from(document.querySelectorAll(".st-light")).some((el) => {
          const r = el.getBoundingClientRect();
          return r.top < ctaY && r.bottom > ctaY;
        }),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="floating-cta"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] z-[45] flex justify-center"
        >
          <button
            type="button"
            onClick={onContact}
            className={cn(
              "st-beat-host pointer-events-auto inline-flex h-[52px] items-center gap-2.5 rounded-full pl-6 pr-2 text-[16px] font-semibold tracking-[-0.01em] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_var(--st-accent-35)] transition-[transform,box-shadow,background-color,color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_24px_var(--st-accent-35)] md:h-14 md:pl-7 md:text-base",
              onLight ? "bg-[var(--st-bg)] text-[var(--st-accent)]" : "bg-[var(--st-accent)] text-[var(--st-bg)]",
            )}
          >
            <VariableProximity text={t.orderProject} />
            <span
              aria-hidden
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full transition-colors duration-300 md:h-10 md:w-10",
                onLight ? "bg-[var(--st-accent)] text-[var(--st-bg)]" : "bg-[var(--st-bg)] text-[var(--st-accent)]",
              )}
            >
              <Heart className="st-beat h-[18px] w-[18px] fill-current" />
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StudioFooter() {
  const { t } = useStudioLocale();
  // Нижняя строка подвала — намеренно мельче остального сайта (исключение из минимума 16px): служебные подписи.
  // «!» нужен, потому что размер и разрядку задаёт и сам .st-micro, а его стили подключаются позже Tailwind.
  const micro = "st-micro !text-[12px] !tracking-[0.2em] text-[var(--st-muted)]";
  const link = cn(micro, "transition-colors hover:text-[var(--st-text)]");
  return (
    <footer className="border-t border-[var(--st-line)]">
      <div className={cn(container, "pt-14 md:pt-20")}>
        <FooterMark />
      </div>
      <div className={cn(container, "grid items-center justify-items-center gap-y-6 py-10 md:grid-cols-[1fr_auto_1fr] md:justify-items-stretch md:py-8")}>
        <div className="flex items-center gap-5 md:justify-self-start">
          <LemnityWordmark className="h-4 w-auto text-[var(--st-text)]" />
          <span className={micro}>© {new Date().getFullYear()}</span>
        </div>
        <p className={cn(micro, "text-center")}>{t.footerTagline}</p>
        <nav aria-label={t.linksAria} className="flex flex-wrap items-center justify-center gap-6 md:justify-self-end md:gap-8">
          <a href={STUDIO_PLATFORM_URL} target="_blank" rel="noopener noreferrer" className={link}>{t.platform}</a>
          <a href={STUDIO_CONTACT_TG} target="_blank" rel="noopener noreferrer" className={link}>Telegram</a>
          <a href={STUDIO_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={link}>{t.privacy}</a>
        </nav>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Страница ───────────────────────────── */

function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className="lmnt-studio min-h-dvh antialiased">
      <style href="lmnt-studio" precedence="default">
        {STYLES}
      </style>
      {children}
    </div>
  );
}

/** Страница студии на языке `locale` (по умолчанию русский). */
export function StudioPage({ locale = "ru" }: { locale?: Locale }) {
  const goContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <StudioLocaleProvider locale={locale}>
      <StudioPageBody onContact={goContact} />
    </StudioLocaleProvider>
  );
}

function StudioPageBody({ onContact: goContact }: { onContact: () => void }) {
  return (
    <StudioShell>
      <StudioPreloader />
      <SmoothWheel />
      <ScrollProgress />
      <StudioHeader onContact={goContact} />
      <main>
        <Hero onContact={goContact} />
        <Manifesto />
        <Projects />
        <Gallery />
        <VelocityTicker />
        <Clients />
        <PixelEdge from="var(--st-bg)" to="#f4f1ec" />
        <Services />
        <PixelEdge from="#f4f1ec" to="var(--st-bg)" />
        <About onContact={goContact} />
        <Faq />
        <Contact />
      </main>
      <StudioFooter />
      <FloatingCta onContact={goContact} />
      <GrainOverlay />
      <CustomCursor />
    </StudioShell>
  );
}
