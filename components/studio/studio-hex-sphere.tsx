"use client";

/**
 * Сфера из шестиугольников для первого экрана: 283 плитки на передней полусфере, по рядам сверху вниз
 * идёт волна — плитка приподнимается и вспыхивает лаймовым, потом возвращается на место. Раз в цикл
 * плитки слетаются в пиксельную мозаику знака Lemnity, держат его и возвращаются на сферу.
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

import { LETTERS } from "@/components/lemnity-wordmark";

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

/* ── Логотип ── */

/** Цикл, секунды: сфера → сборка → знак → разборка → сфера. */
const CYCLE = 9.5;
const IN_START = 4;
const IN_END = 5.4;
const OUT_START = 7.6;
const OUT_END = 9;
/** Полёт одной плитки; остальное время сборки — разбег волны слева направо. */
const FLY = 0.95;
/** Ширина знака в долях диаметра сцены. */
const LOGO_WIDTH = 0.86;

type Logo = {
  /** Ширина клетки мозаики в долях диаметра. */
  cell: number;
  /** Центры клеток в долях диаметра от центра сцены. */
  cells: [number, number][];
  /** Клетка для каждой плитки (индекс в TILES) или -1, если плитка лишняя и тает. */
  target: number[];
  minX: number;
  maxX: number;
};

const tiltedX = (t: Tile) => t.c[0] * Math.cos(TILT) - t.c[1] * Math.sin(TILT);

/**
 * Знак растрируется и раскладывается в сетку шестиугольников — самую мелкую, на которую хватает плиток
 * сферы. Плитки и клетки сортируются слева направо, и клетке достаётся плитка с тем же местом в порядке:
 * так при сборке плитки летят в основном по вертикали, а не через всю сцену.
 */
function buildLogo(): Logo | null {
  const RES = 1400;
  const scale = RES / 169;
  const height = Math.ceil(38 * scale);
  const raster = document.createElement("canvas");
  raster.width = RES;
  raster.height = height;
  const g = raster.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.scale(scale, scale);
  for (const letter of LETTERS) g.fill(new Path2D(letter.d));
  const alpha = g.getImageData(0, 0, RES, height).data;
  const inside = (x: number, y: number) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    return xi >= 0 && yi >= 0 && xi < RES && yi < height && alpha[(yi * RES + xi) * 4 + 3] > 140;
  };

  let found: { cw: number; cells: [number, number][] } | null = null;
  for (let cw = 18; cw <= 80 && !found; cw += 0.25) {
    const rowH = (cw / 0.8660254) * 0.75;
    const cells: [number, number][] = [];
    for (let r = 0, y = rowH / 1.5; y < height; r++, y += rowH) {
      for (let x = r % 2 ? cw : cw / 2; x < RES; x += cw) if (inside(x, y)) cells.push([x, y]);
    }
    if (cells.length <= TILES.length) found = { cw, cells };
  }
  if (!found) return null;

  const k = LOGO_WIDTH / RES;
  const cells = found.cells.map(([x, y]): [number, number] => [(x - RES / 2) * k, (y - height / 2) * k]);
  const tilesByX = TILES.map((_, i) => i).sort((a, b) => tiltedX(TILES[a]) - tiltedX(TILES[b]));
  const cellsByX = cells.map((_, i) => i).sort((a, b) => cells[a][0] - cells[b][0] || cells[a][1] - cells[b][1]);
  const target = new Array<number>(TILES.length).fill(-1);
  const n = tilesByX.length;
  const m = cellsByX.length;
  for (let j = 0; j < m; j++) target[tilesByX[Math.min(n - 1, Math.round(((j + 0.5) * n) / m - 0.5))]] = cellsByX[j];
  const xs = cells.map((c) => c[0]);
  return { cell: found.cw * k, cells, target, minX: Math.min(...xs), maxX: Math.max(...xs) };
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Насколько плитка «собрана» в момент цикла `t`: 0 — на сфере, 1 — в знаке. `x01` — её место слева направо. */
function assembled(t: number, x01: number) {
  if (t < IN_START) return 0;
  if (t < OUT_START) return easeInOut(clamp01((t - IN_START - x01 * (IN_END - IN_START - FLY)) / FLY));
  return 1 - easeInOut(clamp01((t - OUT_START - x01 * (OUT_END - OUT_START - FLY)) / FLY));
}

/** Детерминированный «шум» 0..1 — лёгкая неровность яркости мозаики. */
const noise = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const HEX: readonly (readonly [number, number])[] = [
  [0, -0.5],
  [0.5, -0.25],
  [0.5, 0.25],
  [0, 0.5],
  [-0.5, 0.25],
  [-0.5, -0.25],
];

/**
 * Кадр сцены диаметром `d` в момент `time` (секунды); `null` — статичная сфера без волны и без знака.
 * `logo` — мозаика знака; пока её нет (или time === null), рисуется только сфера.
 */
function draw(ctx: CanvasRenderingContext2D, d: number, time: number | null, logo: Logo | null) {
  const R = d * 0.42;
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
  const cycle = time === null ? 0 : time % CYCLE;
  const cellW = logo ? logo.cell * d : 0;
  const cellH = cellW / 0.8660254038;
  // Блик идёт по знаку слева направо, пока он собран.
  const shine = ((cycle - IN_END) / (OUT_START - IN_END)) * 1.6 - 0.3;
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

    // Положение в знаке: k = 0 — плитка на сфере, 1 — на своей клетке; лишние плитки тают на месте.
    const cell = logo && time !== null ? logo.target[i] : -1;
    let k = 0;
    let lx = 0;
    let ly = 0;
    let x01 = 0;
    if (cell >= 0 && logo) {
      [lx, ly] = logo.cells[cell];
      x01 = (lx - logo.minX) / (logo.maxX - logo.minX);
      k = assembled(cycle, x01);
    } else if (logo && time !== null) {
      k = assembled(cycle, tiltedX(t) * 0.5 + 0.5);
    }
    const shrink = cell >= 0 ? 1 : 1 - k;
    if (shrink <= 0.01) continue;

    ctx.beginPath();
    for (let p = 0; p < 6; p++) {
      const u = HEX[p][0] * w * shrink;
      const v = HEX[p][1] * h * shrink;
      const x = cx + u * t.e[0] + v * t.s[0];
      const y = cy + u * t.e[1] + v * t.s[1];
      let sx = x * cos - y * sin;
      let sy = x * sin + y * cos;
      if (k > 0 && cell >= 0) {
        // Плоский шестиугольник клетки с зазором — мозаика читается как пиксели.
        sx += (lx * d + HEX[p][0] * cellW * 0.9 - sx) * k;
        sy += (ly * d + HEX[p][1] * cellH * 0.9 - sy) * k;
      }
      if (p === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    if (k > 0 && cell >= 0) {
      const glow = Math.max(0, 1 - Math.abs(x01 - shine) / 0.12);
      const L = t.restL + (HL_L - t.restL) * hl;
      const target = 0.8 + 0.07 * noise(cell) + 0.12 * glow;
      ctx.fillStyle = oklab(L + (target - L) * k, HL_A * (hl + (0.95 - hl) * k), HL_B * (hl + (0.95 - hl) * k));
    } else {
      ctx.fillStyle = hl < 0.002 ? REST[i] : oklab(t.restL + (HL_L - t.restL) * hl, HL_A * hl, HL_B * hl);
    }
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
    const logo = buildLogo();
    const start = performance.now();
    let d = 0;
    let frame = 0;
    let visible = false;

    const render = (now: number) => {
      frame = 0;
      if (!d) return;
      draw(ctx, d, reduce.matches ? null : (now - start) / 1000, logo);
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
