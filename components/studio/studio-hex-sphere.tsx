"use client";

/**
 * Сфера из шестиугольников для первого экрана: 283 плитки на передней полусфере, по рядам сверху вниз
 * идёт волна — плитка приподнимается и вспыхивает лаймовым, потом возвращается на место.
 *
 * Перенос «Hex Sphere / CSS experiment» Павла Трошкина (https://x.com/troshkin_pavel). В оригинале каждая
 * плитка — DOM-элемент с 3D-трансформом, clip-path и анимированными CSS-переменными: браузер каждый кадр
 * пересчитывал стили и перерисовывал 283 слоя, и на слабых устройствах первый экран проседал до единиц
 * кадров в секунду. Здесь та же математика (ортографическая проекция, те же формулы волны и цвета)
 * рисуется на одном canvas — несколько сотен многоугольников за кадр.
 *
 * Сетка конформная: широты рядов равномерны в проекции Меркатора, поэтому плитки сохраняют форму
 * и уменьшаются к полюсам пропорционально cos(широты).
 */

import { useEffect, useRef } from "react";

/** Широты рядов от экватора к полюсу; второе полушарие — зеркально. */
const LATS = [0, 11.065181, 21.728828, 31.657978, 40.630535, 48.541965, 55.385245, 61.219919, 66.142642, 70.264923, 73.698777];
/** Шаг по долготе: 28 плиток на полный круг, видна передняя половина. */
const LON_STEP = 360 / 28;
/** Размер плитки на экваторе в долях диаметра сцены. */
const EQUATOR_SIZE = 0.090478;
/** Волна: ряд стартует на ROW_STEP позже предыдущего, полный цикл — 21 шаг. */
const ROW_STEP = 0.14;
const WAVE = 21 * ROW_STEP;
/** Наклон всей сферы (rotateZ(-10deg) в оригинале). */
const TILT = (-10 * Math.PI) / 180;

const rad = (deg: number) => (deg * Math.PI) / 180;

type Tile = {
  row: number;
  /** Центр на единичной сфере в координатах CSS: x вправо, y вниз, z к зрителю. */
  c: [number, number, number];
  /** Касательные оси плитки: east — вдоль долготы, south — вдоль широты (вниз по экрану). */
  e: [number, number, number];
  s: [number, number, number];
  size: number;
  offset: number;
  /** Светлота цвета покоя в OKLab (серый, светлее к центру). */
  restL: number;
};

const TILES: Tile[] = [];
for (let row = 0; row < LATS.length * 2 - 1; row++) {
  const k = row - (LATS.length - 1);
  const lat = rad(Math.sign(k) * LATS[Math.abs(k)]);
  const count = row % 2 === 0 ? 13 : 14;
  const size = EQUATOR_SIZE * Math.cos(lat);
  for (let i = 0; i < count; i++) {
    const lon = rad((i - (count - 1) / 2) * LON_STEP);
    const depth = Math.cos(lat) * Math.cos(lon);
    TILES.push({
      row,
      c: [Math.cos(lat) * Math.sin(lon), Math.sin(lat), depth],
      e: [Math.cos(lon), 0, -Math.sin(lon)],
      s: [-Math.sin(lat) * Math.sin(lon), Math.cos(lat), -Math.sin(lat) * Math.cos(lon)],
      size,
      offset: 0.035 * Math.sin(lon * 2 + rad(row * 23)) + 0.01 * Math.sin(lon * 5 - rad(row * 11)),
      restL: 0.1 + 0.12 * depth,
    });
  }
}
// Дальние плитки рисуем первыми, как сортировал бы браузер по глубине.
TILES.sort((a, b) => a.c[2] - b.c[2]);

/** Цвет вспышки — oklch(91% .21 125) в OKLab. */
const HL_L = 0.91;
const HL_A = 0.21 * Math.cos(rad(125));
const HL_B = 0.21 * Math.sin(rad(125));

const toSrgb = (x: number) => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
};

/** OKLab → sRGB-строка для fillStyle. */
function oklab(L: number, a: number, b: number) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return `rgb(${r},${g},${bl})`;
}

/** Цвет покоя не меняется — считаем один раз на плитку. */
const REST = TILES.map((t) => oklab(t.restL, 0, 0));

const HEX: readonly (readonly [number, number])[] = [
  [0, -0.5],
  [0.5, -0.25],
  [0.5, 0.25],
  [0, 0.5],
  [-0.5, 0.25],
  [-0.5, -0.25],
];

/** Кадр сферы диаметром `d` в момент `time` (секунды); `null` — статичная сфера без волны. */
function draw(ctx: CanvasRenderingContext2D, d: number, time: number | null) {
  const R = d * 0.42;
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
  ctx.clearRect(-d / 2, -d / 2, d, d);
  for (let i = 0; i < TILES.length; i++) {
    const t = TILES[i];
    let lift = 0;
    if (time !== null) {
      const phase = (((time - t.row * ROW_STEP) / WAVE) % 1 + 1) % 1;
      const tilePhase = ((phase - t.offset) % 1 + 1) % 1;
      lift = 0.5 - 0.5 * Math.cos(2 * Math.PI * Math.min(1, tilePhase / 0.4));
    }
    const hl = lift ** 4;
    // Ширина как у ::before в оригинале (+1px против щелей), высота — по пропорции шестиугольника.
    const w = ((d * t.size) / 0.96) * 1.015 + 1;
    const h = w / 0.8660254038;
    // Подъём плитки — вдоль нормали, которая у сферы совпадает с направлением на центр плитки.
    const r = R + d * 0.05 * lift;
    const cx = t.c[0] * r;
    const cy = t.c[1] * r;
    ctx.beginPath();
    for (let p = 0; p < 6; p++) {
      const u = HEX[p][0] * w;
      const v = HEX[p][1] * h;
      const x = cx + u * t.e[0] + v * t.s[0];
      const y = cy + u * t.e[1] + v * t.s[1];
      if (p === 0) ctx.moveTo(x * cos - y * sin, x * sin + y * cos);
      else ctx.lineTo(x * cos - y * sin, x * sin + y * cos);
    }
    ctx.closePath();
    ctx.fillStyle = hl < 0.002 ? REST[i] : oklab(t.restL + (HL_L - t.restL) * hl, HL_A * hl, HL_B * hl);
    ctx.fill();
  }
}

export function StudioHexSphere({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    let d = 0;
    let frame = 0;
    let visible = false;

    const render = (now: number) => {
      frame = 0;
      if (!d) return;
      draw(ctx, d, reduce.matches ? null : (now - start) / 1000);
      if (visible && !reduce.matches && !document.hidden) frame = requestAnimationFrame(render);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const resize = () => {
      const box = host.getBoundingClientRect();
      d = Math.floor(Math.min(box.width, box.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(d * dpr);
      canvas.height = Math.round(d * dpr);
      canvas.style.width = `${d}px`;
      canvas.style.height = `${d}px`;
      ctx.setTransform(dpr, 0, 0, dpr, (d * dpr) / 2, (d * dpr) / 2);
      kick();
    };

    // Вне экрана и в фоновой вкладке волна стоит.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    const ro = new ResizeObserver(resize);
    io.observe(host);
    ro.observe(host);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", kick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      reduce.removeEventListener("change", kick);
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden className={`grid place-items-center overflow-clip ${className ?? ""}`}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
