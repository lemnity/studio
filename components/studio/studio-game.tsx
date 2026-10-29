"use client";

/**
 * Живая мини-игра в карточке «Разработка игр». Сама игра — в studio-game-hex.ts; здесь только
 * подключение: пауза вне экрана, нажатие мышью или пальцем, Enter/пробел с клавиатуры, статичный
 * кадр без анимаций.
 */

import { useEffect, useRef } from "react";

import { startHexPop, type HexPop } from "./studio-game-hex";

export function StudioGame({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<HexPop | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = startHexPop(canvas, { still });
    gameRef.current = game;
    const io = new IntersectionObserver(([entry]) => game.setActive(entry.isIntersecting));
    io.observe(canvas);
    return () => {
      io.disconnect();
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Мини-игра «Лопай соты»: нажимайте на группы сот одного цвета"
      onPointerDown={(e) => {
        e.preventDefault();
        const box = canvasRef.current?.getBoundingClientRect();
        if (box) gameRef.current?.tap(e.clientX - box.left, e.clientY - box.top);
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          gameRef.current?.tap();
        }
      }}
      className={`relative block w-full cursor-pointer touch-manipulation overflow-hidden rounded border border-[var(--st-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--st-text)] ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </button>
  );
}
