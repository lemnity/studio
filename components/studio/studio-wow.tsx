"use client";

/**
 * Эффекты страницы «Лемнити Студия» по мотивам illan.ru (там они собраны на GSAP + ScrollTrigger +
 * SplitType + Lenis + Lottie). Здесь — без новых зависимостей, на framer-motion и CSS:
 *
 *  - StudioPreloader   — заставка с буквами Lemnity при каждой загрузке;
 *  - SmoothWheel       — плавная прокрутка колесом на ПК (аналог Lenis, lerp ≈ 0.07);
 *  - LineReveal        — заголовок выезжает из маски построчно с лёгким поворотом (SplitType lines);
 *  - VelocityTicker    — две ленты крест-накрест, разгоняются от прокрутки и меняют направление;
 *  - LogoSlots         — ячейки логотипов клиентов, перелистывающиеся по очереди;
 *  - ParallaxMedia     — картинка сдвигается против курсора;
 *  - DrawnCircle / DrawnUnderline — обводка «от руки» (у illan — Lottie);
 *  - FooterMark        — гигантский знак в подвале, буквы поднимаются волной.
 *
 * Всё гаснет при `prefers-reduced-motion`; эффекты, завязанные на мышь, — на сенсорных экранах.
 */

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { LETTERS, LETTER_COLORS } from "@/components/lemnity-wordmark";
import { cn } from "@/lib/utils";

import { STUDIO_CLIENTS, clientLogoFilter } from "./studio-content";
import { EASE, useMediaQuery } from "./studio-effects";
import { STUDIO_INTRO_ATTR } from "./studio-intro";

/** Резкий «занавес» illan: медленный старт и финиш, быстрая середина. */
const CURTAIN = [0.76, 0, 0.24, 1] as const;

/* ───────────────────────────── Заставка ───────────────────────────── */

// Атрибут на <html> ставит загрузочный скрипт из studio-intro.ts до первой отрисовки.
const INTRO_ATTR = STUDIO_INTRO_ATTR;

let introReady = false;
const introListeners = new Set<() => void>();
function markIntroReady() {
  if (introReady) return;
  introReady = true;
  introListeners.forEach((l) => l());
}

/**
 * `true`, когда первый экран можно анимировать: заставки нет или занавес уже поднимается.
 * На сервере и при гидрации — `false`, поэтому анимации первого экрана ждут решения.
 */
export function useIntroReady(): boolean {
  return useSyncExternalStore(
    (cb) => {
      introListeners.add(cb);
      return () => introListeners.delete(cb);
    },
    () => introReady,
    () => false,
  );
}

type IntroPhase = "in" | "out" | "gone";

export function StudioPreloader() {
  const [phase, setPhase] = useState<IntroPhase>("in");
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute(INTRO_ATTR) !== "play") {
      setPhase("gone");
      markIntroReady();
      return;
    }
    html.style.overflow = "hidden";

    const started = performance.now();
    const DURATION = 1500;
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - started) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      if (counterRef.current) counterRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    const out = window.setTimeout(() => {
      setPhase("out");
      markIntroReady();
    }, DURATION + 250);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(out);
      html.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "gone") return;
    document.documentElement.style.overflow = "";
    document.documentElement.setAttribute(INTRO_ATTR, "done");
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <motion.div
      aria-hidden
      className="st-preloader fixed inset-0 z-[80] flex-col justify-between bg-[var(--st-bg)] px-5 py-6 md:px-12 md:py-10"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: phase === "out" ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 0.9, delay: phase === "out" ? 0.35 : 0, ease: CURTAIN }}
      onAnimationComplete={() => {
        if (phase === "out") setPhase("gone");
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <span className="st-micro text-[10px] tracking-[0.3em] text-[var(--st-muted)]">Лемнити Студия</span>
        <span className="st-micro hidden text-[10px] tracking-[0.3em] text-[var(--st-muted)] sm:inline">Дизайн · Продукты · Идеи</span>
      </div>

      <svg viewBox="0 0 169 38" className="mx-auto block w-[min(78vw,880px)] overflow-hidden text-[var(--st-text)]" fill="currentColor">
        {LETTERS.map((l) => (
          <motion.path
            key={l.order}
            d={l.d}
            initial={{ y: 42 }}
            animate={{ y: phase === "out" ? -42 : 0 }}
            transition={{
              duration: 0.9,
              delay: phase === "out" ? l.order * 0.035 : 0.15 + l.order * 0.07,
              ease: phase === "out" ? CURTAIN : EASE,
            }}
          />
        ))}
      </svg>

      <div className="flex items-end justify-between gap-6">
        <div className="mb-3 h-px flex-1 bg-[var(--st-line)]">
          <div ref={barRef} className="h-px origin-left bg-[var(--st-accent)]" style={{ transform: "scaleX(0)" }} />
        </div>
        <span ref={counterRef} className="text-[42px] font-normal leading-none tracking-[-0.03em] tabular-nums md:text-[64px]">
          000
        </span>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── Плавная прокрутка ───────────────────────────── */

/** Есть ли между целью события и документом свой прокручиваемый контейнер (модалка, текстовое поле). */
function hasScrollableAncestor(el: Element | null, deltaY: number): boolean {
  for (let node = el; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (!/(auto|scroll)/.test(style.overflowY)) continue;
    if (node.scrollHeight <= node.clientHeight) continue;
    const canDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
    const canUp = node.scrollTop > 0;
    if ((deltaY > 0 && canDown) || (deltaY < 0 && canUp)) return true;
  }
  return false;
}

/**
 * Плавная прокрутка колесом (Lenis на illan, `lerp: 0.068`, только ≥992px). Перехватываем только
 * вертикальное колесо: клавиатура, полоса прокрутки, якоря и `scrollIntoView` идут штатно, а цель
 * синхронизируется с фактической позицией, как только наша анимация стоит.
 */
export function SmoothWheel() {
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 992px)");
  const enabled = fine && !reduce;

  useEffect(() => {
    if (!enabled) return;
    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let last = 0;
    let animating = false;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const locked = () =>
      getComputedStyle(document.documentElement).overflow === "hidden" || getComputedStyle(document.body).overflow === "hidden";

    const step = (now: number) => {
      const dt = Math.min(64, last ? now - last : 1000 / 60);
      last = now;
      // lerp 0.068 за кадр 60 Гц, приведённый к реальной длительности кадра.
      const k = 1 - Math.pow(1 - 0.068, dt / (1000 / 60));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo(0, current);
      if (current !== target) {
        frame = requestAnimationFrame(step);
      } else {
        animating = false;
        last = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented || locked()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (hasScrollableAncestor(e.target as Element | null, e.deltaY)) return;
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!animating) current = target = window.scrollY;
      target = Math.max(0, Math.min(maxScroll(), target + delta));
      if (!animating) {
        animating = true;
        frame = requestAnimationFrame(step);
      }
    };
    const onScroll = () => {
      if (!animating) current = target = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  return null;
}

/* ───────────────────────────── Заголовок по строкам ───────────────────────────── */

/**
 * Текст выезжает из маски строками: `y: 105% → 0`, поворот 4° → 0, шаг между строками 0.12 с
 * (у illan — SplitType по строкам и GSAP `y: 5rem, rotateZ: 1, stagger: 0.2`). Строки
 * определяются по факту переноса: слова группируются по `offsetTop` после раскладки и после
 * загрузки шрифта, поэтому разбивка на любой ширине совпадает с тем, что видно.
 */
export function LineReveal({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const assign = () => {
      const words = Array.from(root.querySelectorAll<HTMLElement>("[data-lr-word]"));
      let line = -1;
      let top = Number.NEGATIVE_INFINITY;
      for (const w of words) {
        const t = (w.parentElement as HTMLElement).getBoundingClientRect().top;
        if (t > top + 2) {
          line += 1;
          top = t;
        }
        w.style.transitionDelay = `${(delay + line * 0.12).toFixed(2)}s`;
      }
    };
    assign();
    void document.fonts?.ready.then(assign);
    window.addEventListener("resize", assign);
    return () => window.removeEventListener("resize", assign);
  }, [text, delay]);

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span ref={ref} className={cn("st-lr", inView && "st-lr-on", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            {i > 0 ? " " : null}
            <span className="st-lr-mask">
              <span data-lr-word className="st-lr-word">
                {w}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

/* ───────────────────────────── Бегущая строка от прокрутки ───────────────────────────── */

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

const TICKER_WORDS = ["Сайты", "Интерфейсы", "Брендинг", "Продукты", "Приложения", "Lemnity"] as const;

function TickerRow({ baseVelocity, lime, active }: { baseVelocity: number; lime?: boolean; active: boolean }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  // У illan: базовая скорость 0.8, ускорение от прокрутки ×16, плавный возврат к базе.
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!active) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const sequence = [...TICKER_WORDS, ...TICKER_WORDS];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div style={{ x }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {sequence.map((w, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span
                  className={cn(
                    "px-[0.3em] py-[0.06em] text-[clamp(34px,5.6vw,92px)] font-normal leading-[1.08] tracking-[-0.04em]",
                    lime ? "text-[var(--st-bg)]" : "text-transparent [-webkit-text-stroke:1px_rgba(244,241,236,0.38)]",
                  )}
                >
                  {w}
                </span>
                <span className={cn("text-[clamp(16px,2vw,32px)]", lime ? "text-[var(--st-bg)]" : "text-[var(--st-accent)]")}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function VelocityTicker() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  const reduce = useReducedMotion();
  const run = inView && !reduce;
  // Ленты шире экрана на 12%: под наклоном их концы иначе не доставали бы до краёв. На узком экране
  // наклон круче — при малой ширине тёмная лента иначе целиком пряталась бы под лаймовой.
  return (
    <section aria-hidden ref={ref} className="relative h-[clamp(180px,30vw,420px)] select-none overflow-hidden">
      <div className="absolute -left-[6%] top-1/2 w-[112%] -translate-y-1/2 rotate-[7deg] border-y md:rotate-[3.5deg] border-[var(--st-line)] bg-[var(--st-surface)]">
        <TickerRow baseVelocity={2} active={run} />
      </div>
      <div className="absolute -left-[6%] top-1/2 z-[1] w-[112%] -translate-y-1/2 -rotate-[8deg] bg-[var(--st-accent)] md:-rotate-[4deg] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <TickerRow baseVelocity={-2.4} lime active={run} />
      </div>
    </section>
  );
}

/* ───────────────────────────── Ячейки логотипов ───────────────────────────── */

/**
 * Последняя ячейка сетки клиентов — приглашение стать следующим. Клиентов 11, и без неё в сетке
 * на 2, 3 и 4 колонки оставалась бы пустая дыра; с ней ячеек 12 и ряды заполнены ровно.
 */
export function ClientSlotCta() {
  return (
    <a
      href="#contact"
      className="group flex h-[92px] flex-col items-center justify-center gap-1.5 rounded border border-dashed border-[rgba(244,241,236,0.18)] text-center transition-colors hover:border-[var(--st-accent)] hover:bg-[var(--st-accent-03)] focus-visible:border-[var(--st-accent)] focus-visible:outline-none md:h-[132px]"
    >
      <span className="st-micro text-[10px] tracking-[0.24em] text-[var(--st-muted)]">Здесь может быть</span>
      <span className="text-[15px] transition-colors group-hover:text-[var(--st-accent)] md:text-base">ваш логотип →</span>
    </a>
  );
}

/**
 * Все логотипы клиентов сразу. При входе в экран ячейки открываются шторкой волной, а дальше раз в
 * 2.4 с две случайные ячейки меняются логотипами той же шторкой (по мотивам ячеек illan.ru, где
 * логотипы листаются по кругу). Наведение ставит обмен на паузу.
 */
export function LogoSlots() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const entered = useInView(ref, { once: true, amount: 0.2 });
  const [order, setOrder] = useState<number[]>(() => STUDIO_CLIENTS.map((_, i) => i));
  const [swapped, setSwapped] = useState<readonly number[]>([]);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = window.setInterval(() => {
      const n = STUDIO_CLIENTS.length;
      const a = Math.floor(Math.random() * n);
      let b = Math.floor(Math.random() * (n - 1));
      if (b >= a) b += 1;
      setSwapped([a, b]);
      setOrder((prev) => {
        const next = [...prev];
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    }, 2400);
    return () => window.clearInterval(id);
  }, [inView, paused, reduce]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
    >
      {order.map((idx, slot) => {
        const c = STUDIO_CLIENTS[idx];
        // Первое открытие идёт волной по ячейкам, обмен — с небольшим сдвигом второй ячейки пары.
        const delay = swapped.length ? swapped.indexOf(slot) * 0.12 : slot * 0.06;
        return (
          <div
            key={slot}
            aria-hidden
            className="relative h-[92px] overflow-hidden rounded border border-[var(--st-line)] transition-colors hover:border-[var(--st-accent-45)] hover:bg-[var(--st-accent-03)] md:h-[132px] [&:hover_img]:opacity-100"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={idx}
                initial={{ y: "100%" }}
                animate={{ y: entered || reduce ? "0%" : "100%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: reduce ? 0 : 0.8, delay: Math.max(0, delay), ease: CURTAIN }}
                className="absolute inset-0 grid place-items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.src}
                  alt=""
                  width={c.width}
                  height={c.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{ filter: clientLogoFilter(c) }}
                  className="h-auto max-h-[34px] w-auto max-w-[62%] opacity-60 transition-opacity duration-300 md:max-h-[46px]"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
      <ClientSlotCta />
    </div>
  );
}

/* ───────────────────────────── Параллакс за курсором ───────────────────────────── */

/** Картинка уезжает против курсора на `strength` пикселей (у illan — слои товаров, 0.02–0.04 от смещения). */
export function ParallaxMedia({ children, strength = 18 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 110, damping: 20, mass: 0.6 });
  const y = useSpring(0, { stiffness: 110, damping: 20, mass: 0.6 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(-((e.clientX - r.left) / r.width - 0.5) * 2 * strength);
    y.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div style={{ x, y, inset: -strength }} onPointerMove={onMove} onPointerLeave={onLeave} className="absolute">
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── Обводка «от руки» ───────────────────────────── */

const drawProps = (delay: number) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, amount: 0.8 },
  transition: { pathLength: { duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] as const }, opacity: { duration: 0.01, delay } },
});

/** Овал вокруг слова, нарисованный одним росчерком (у illan — Lottie `lotti1.json`). */
export function DrawnCircle({ children, delay = 0.5 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -left-[9%] -top-[20%] h-[140%] w-[118%] overflow-visible"
      >
        <motion.path
          d="M262 26C210 6 74 4 30 34C-4 58 22 104 128 110C222 116 298 92 288 54C280 22 214 10 150 14"
          fill="none"
          stroke="var(--st-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...(reduce ? {} : drawProps(delay))}
        />
      </svg>
    </span>
  );
}

/** Подчёркивание-росчерк под словом (у illan — Lottie `lotti2.json`). */
export function DrawnUnderline({ children, delay = 0.5 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.2em] left-0 h-[0.32em] w-full overflow-visible"
      >
        <motion.path
          d="M3 15C46 7 118 4 197 9C150 11 92 15 52 21"
          fill="none"
          stroke="var(--st-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          {...(reduce ? {} : drawProps(delay))}
        />
      </svg>
    </span>
  );
}

/* ───────────────────────────── Гигантский знак в подвале ───────────────────────────── */

/**
 * Знак Lemnity во всю ширину: при входе в экран буквы поднимаются волной, при уходе — опускаются
 * (у illan: `toggleActions: "play none none reverse"`). Над буквой курсор зажигает её цвет из той
 * же палитры, что у знака на экране входа.
 */
export function FooterMark() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const shown = inView || !!reduce;
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 169 38" fill="currentColor" className="st-fm block h-auto w-full overflow-hidden text-[var(--st-text)]">
      {LETTERS.map((l) => (
        <motion.path
          key={l.order}
          d={l.d}
          style={{ "--c": LETTER_COLORS[l.order] } as React.CSSProperties}
          initial={reduce ? false : { y: 40 }}
          animate={{ y: shown ? 0 : 40 }}
          transition={{ duration: 0.9, delay: shown ? l.order * 0.07 : 0, ease: EASE }}
        />
      ))}
    </svg>
  );
}
