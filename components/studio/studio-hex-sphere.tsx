"use client";

/**
 * Сфера из шестиугольников для первого экрана: 283 плитки на передней полусфере, по рядам сверху вниз
 * идёт волна — плитка приподнимается и вспыхивает лаймовым, потом возвращается на место. В покое все
 * плитки серые; на каждом проходе волны изредка какая-нибудь плитка становится эпицентром — от неё по
 * поверхности сферы расходится синяя рябь, и плитки приподнимаются, когда через них проходит фронт.
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
  /** Номер плитки в раскладке (до сортировки по глубине) — зерно выбора эпицентров ряби. */
  id: number;
  /** Светлота цвета покоя в OKLab (серый, светлее к центру). */
  restL: number;
};

/** OKLCH → OKLab. */
const lch = (L: number, C: number, h: number): [number, number, number] => [L, C * Math.cos(rad(h)), C * Math.sin(rad(h))];
/** Цвет вспышки — oklch(91% .21 125). */
const LIME_FLASH = lch(0.91, 0.21, 125);
/** Цвет ряби — oklch(76% .19 258), светлее синего Lemnity (#3d7bff), чтобы читался на тёмной сфере. */
const RIPPLE_COLOR = lch(0.76, 0.19, 258);
/** Доля плиток-эпицентров на проходе волны: в среднем пять-шесть ряби за цикл. */
const RIPPLE_SHARE = 0.022;
/** Рябь живёт столько секунд, бежит со скоростью RIPPLE_SPEED рад/с, ширина фронта — RIPPLE_WIDTH рад. */
const RIPPLE_LIFE = 2;
const RIPPLE_SPEED = 0.4;
const RIPPLE_WIDTH = 0.11;
/** Детерминированный «шум» 0..1: на сервере и в браузере выбираются одни и те же плитки. */
const noise = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const TILES: Tile[] = [];
let tileId = 0;
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
      id: tileId++,
      restL: 0.1 + 0.12 * depth,
    });
  }
}
// Дальние плитки рисуем первыми, как сортировал бы браузер по глубине.
TILES.sort((a, b) => a.c[2] - b.c[2]);

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
/** Угловые расстояния между центрами плиток по сфере — по ним бежит рябь. */
const ANGLES = TILES.map((a) =>
  Float32Array.from(TILES, (b) => Math.acos(Math.min(1, a.c[0] * b.c[0] + a.c[1] * b.c[1] + a.c[2] * b.c[2]))),
);

const HEX: readonly (readonly [number, number])[] = [
  [0, -0.5],
  [0.5, -0.25],
  [0.5, 0.25],
  [0, 0.5],
  [-0.5, 0.25],
  [-0.5, -0.25],
];

/** Шестиугольник плитки с центром (cx, cy) на экране. */
function hexPath(ctx: CanvasRenderingContext2D, t: Tile, cx: number, cy: number, w: number, h: number) {
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
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
}

const mix = (a: [number, number, number], b: [number, number, number], k: number) =>
  oklab(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);

/** Кадр сферы диаметром `d` в момент `time` (секунды); `null` — статичная сфера без волны. */
function draw(ctx: CanvasRenderingContext2D, d: number, time: number | null) {
  const R = d * 0.42;
  ctx.clearRect(-d / 2, -d / 2, d, d);
  const lifts = new Float32Array(TILES.length);
  const ripple = new Float32Array(TILES.length);

  if (time !== null) {
    for (let i = 0; i < TILES.length; i++) {
      const t = TILES[i];
      const wave = (time - t.row * ROW_STEP) / WAVE - t.offset;
      const n = Math.floor(wave);
      lifts[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * Math.min(1, (wave - n) / 0.4));
      // Эпицентр выбирается на каждом проходе волны заново; рябь стартует, когда плитка в верхней точке.
      // Смотрим текущий и прошлый проход: рябь прошлого прохода может ещё бежать.
      for (const pass of [n, n - 1]) {
        if (noise(t.id * 31.7 + pass * 7.13) >= RIPPLE_SHARE) continue;
        const age = time - ((pass + 0.2 + t.offset) * WAVE + t.row * ROW_STEP);
        if (age < 0 || age >= RIPPLE_LIFE) continue;
        const front = age * RIPPLE_SPEED;
        const amp = Math.pow(1 - age / RIPPLE_LIFE, 1.6);
        const angles = ANGLES[i];
        for (let j = 0; j < TILES.length; j++) {
          const g = Math.exp(-(((angles[j] - front) / RIPPLE_WIDTH) ** 2)) * amp;
          if (g > ripple[j]) ripple[j] = g;
        }
      }
    }
  }

  for (let i = 0; i < TILES.length; i++) {
    const t = TILES[i];
    const lift = lifts[i];
    const rip = ripple[i];
    // Ширина как у ::before в оригинале (+1px против щелей), высота — по пропорции шестиугольника.
    const w = ((d * t.size) / 0.96) * 1.015 + 1;
    const h = w / 0.8660254038;
    // Подъём плитки — вдоль нормали, которая у сферы совпадает с направлением на центр плитки.
    const r = R + d * 0.05 * lift + d * 0.03 * rip;
    hexPath(ctx, t, t.c[0] * r, t.c[1] * r, w, h);
    const hl = lift ** 4;
    const blue = Math.min(1, rip * 1.1);
    // Лайм и синий не смешиваются между собой: плитка берёт цвет того импульса, что сейчас сильнее.
    if (blue > hl && blue > 0.01) ctx.fillStyle = mix([t.restL, 0, 0], RIPPLE_COLOR, blue);
    else ctx.fillStyle = hl < 0.002 ? REST[i] : mix([t.restL, 0, 0], LIME_FLASH, hl);
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
