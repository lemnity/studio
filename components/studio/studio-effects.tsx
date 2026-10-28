"use client";

/**
 * Эффекты страницы «Лемнити Студия», перенесённые из исходников simakoov.ru (репозиторий smkv,
 * src/components/effects). Там они написаны на MUI + motion; здесь — на framer-motion и обычных
 * стилях, без MUI. Все эффекты гаснут при `prefers-reduced-motion` и на сенсорных экранах.
 */

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Медиа-запрос без расхождения гидрации: на сервере и в первом кадре — `false`, поэтому все
 * эффекты, завязанные на точный указатель, включаются только после монтирования.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Появление снизу при входе в экран. */
export function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Тонкая линия прогресса прокрутки над шапкой. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0 50%" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-[var(--st-accent)]"
    />
  );
}

/** Шумовое «зерно» поверх всей страницы. */
export function GrainOverlay() {
  return <div aria-hidden className="st-grain pointer-events-none fixed inset-[-10%] z-[55] opacity-[0.05]" />;
}

/**
 * Точка + отстающее кольцо вместо системного курсора; кольцо растёт над ссылками и кнопками.
 * Над элементом с `data-cursor="…"` вместо кольца раскрывается лаймовый круг с этой подписью
 * (по мотивам illan.ru: «zoom»-появление над кейсами). `data-cursor-tone="dark"` красит круг в тёмный —
 * для элементов, которые сами заливаются акцентом при наведении.
 */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(pointer: fine)");
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 });
  const active = !reduce && fine;

  useEffect(() => {
    if (!active) return;
    let lastX = -1;
    let lastY = -1;
    const inspect = (target: Element | null) => {
      setHover(!!target?.closest?.("a, button, summary"));
      const labelled = target?.closest?.("[data-cursor]");
      setLabel(labelled?.getAttribute("data-cursor") || null);
      setDark(labelled?.getAttribute("data-cursor-tone") === "dark");
    };
    const move = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      inspect(e.target as Element | null);
    };
    // При прокрутке колесом мышь стоит, а под ней уже другой элемент: без пересчёта круг
    // «Смотреть» оставался бы висеть над подвалом.
    const scroll = () => {
      if (lastX >= 0) inspect(document.elementFromPoint(lastX, lastY));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && !label ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-2 w-2 rounded-full bg-[var(--st-accent)]"
      />
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && !label ? 1 : 0, scale: hover ? 1.8 : 1 }}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-9 w-9 rounded-full border border-[var(--st-accent-70)]"
      />
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        initial={false}
        animate={{ opacity: visible && label ? 1 : 0, scale: visible && label ? 1 : 0.2 }}
        transition={{ duration: 0.4, ease: EASE }}
        className={cn(
          "st-micro pointer-events-none fixed left-0 top-0 z-[70] grid h-[96px] w-[96px] place-items-center rounded-full text-[10px] tracking-[0.2em] transition-colors duration-300",
          dark
            ? "bg-[var(--st-bg)] text-[var(--st-accent)] shadow-[0_0_40px_rgba(0,0,0,0.35)]"
            : "bg-[var(--st-accent)] text-[var(--st-bg)] shadow-[0_0_40px_var(--st-accent-35)]",
        )}
      >
        {label}
      </motion.div>
    </>
  );
}

/** Кнопка тянется за курсором в пределах `strength` пикселей. */
export function MagneticButton({ children, strength = 10 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * strength);
    y.set(Math.max(-1, Math.min(1, dy)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y, display: "inline-block" }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.div>
  );
}

/**
 * Буквы «набухают» рядом с курсором (по мотивам React Bits «Variable Proximity»). Шрифт статический,
 * поэтому толщину добавляет обводка: ширина глифа не меняется, строка не прыгает. Буквы сгруппированы
 * в неразрывные слова, чтобы перенос строк шёл между словами.
 */
export function VariableProximity({
  text,
  strokeColor = "currentColor",
  radius = 1.6,
  minRadiusPx = 90,
  maxStroke = 0.035,
}: {
  text: string;
  strokeColor?: string;
  radius?: number;
  minRadiusPx?: number;
  maxStroke?: number;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(pointer: fine)");
  const active = !reduce && fine;

  useEffect(() => {
    const root = rootRef.current;
    const letters = lettersRef.current.filter((el): el is HTMLSpanElement => !!el);
    if (!active || !root || letters.length === 0) return;
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    let lit = false;

    const clear = () => {
      if (!lit) return;
      for (const el of letters) el.style.webkitTextStrokeWidth = "0";
      lit = false;
    };
    const paint = () => {
      frame = 0;
      if (!pointer) return clear();
      const fontSize = parseFloat(getComputedStyle(root).fontSize) || 16;
      const reach = Math.max(fontSize * radius, minRadiusPx);
      const box = root.getBoundingClientRect();
      if (
        pointer.x < box.left - reach ||
        pointer.x > box.right + reach ||
        pointer.y < box.top - reach ||
        pointer.y > box.bottom + reach
      ) {
        return clear();
      }
      for (const el of letters) {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
        const t = Math.max(0, 1 - d / reach);
        const w = maxStroke * t * t * (3 - 2 * t);
        el.style.webkitTextStrokeWidth = w > 0.0005 ? `${w.toFixed(4)}em` : "0";
      }
      lit = true;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", schedule);
      letters.forEach((el) => (el.style.webkitTextStrokeWidth = "0"));
    };
  }, [active, text, radius, minRadiusPx, maxStroke]);

  if (!active) return <>{text}</>;

  lettersRef.current = [];
  let index = 0;
  const letterStyle = {
    display: "inline-block",
    WebkitTextStrokeWidth: 0,
    WebkitTextStrokeColor: strokeColor,
    transition: "-webkit-text-stroke-width 0.15s ease-out",
  } as const;

  return (
    <span ref={rootRef}>
      {text.split(/(\s+)/).map((part, wi) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return part;
        return (
          <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {[...part].map((ch) => {
              const i = index++;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    lettersRef.current[i] = el;
                  }}
                  style={letterStyle}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
