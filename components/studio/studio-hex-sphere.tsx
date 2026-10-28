"use client";

/**
 * Сфера из шестиугольников для первого экрана: 283 плитки на передней полусфере, по рядам сверху вниз
 * идёт волна — плитка приподнимается и вспыхивает голубым, потом возвращается на место. Чистый CSS
 * (@property, sin(), cos(), mod()), JS только раскладывает плитки и ставит анимацию на паузу вне экрана.
 *
 * Перенос «Hex Sphere / CSS experiment» Павла Трошкина (https://x.com/troshkin_pavel).
 *
 * Сетка конформная: широты рядов равномерны в проекции Меркатора, поэтому плитки сохраняют форму
 * и уменьшаются к полюсам пропорционально cos(широты).
 */

import { useEffect, useRef, type CSSProperties } from "react";

/** Широты рядов от экватора к полюсу; второе полушарие — зеркально. */
const LATS = [0, 11.065181, 21.728828, 31.657978, 40.630535, 48.541965, 55.385245, 61.219919, 66.142642, 70.264923, 73.698777];
/** Шаг по долготе: 28 плиток на полный круг, видна передняя половина. */
const LON_STEP = 360 / 28;
/** Размер плитки на экваторе в долях диаметра сцены. */
const EQUATOR_SIZE = 0.090478;

const ROWS = Array.from({ length: LATS.length * 2 - 1 }, (_, row) => {
  const k = row - (LATS.length - 1);
  const lat = Math.sign(k) * LATS[Math.abs(k)];
  const count = row % 2 === 0 ? 13 : 14;
  // Округляем до 6 знаков: Math.cos на сервере и в браузере может разойтись в последнем бите — и гидратация
  // увидит другой style.
  const size = (EQUATOR_SIZE * Math.cos((lat * Math.PI) / 180)).toFixed(6);
  const tiles = Array.from({ length: count }, (_, i) => ((i - (count - 1) / 2) * LON_STEP).toFixed(6));
  return { row, lat, size, tiles };
});

const STYLES = `
@property --st-hex-lift { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --st-hex-phase { syntax: "<number>"; inherits: true; initial-value: 0; }
.st-hex-host { container-type: size; display: grid; place-items: center; }
.st-hex-scene {
  --diameter: min(100cqw, 100cqh);
  --radius: calc(var(--diameter) * .42);
  --row-step: .14s;
  --wave-duration: calc(21 * var(--row-step));
  position: relative;
  width: var(--diameter);
  height: var(--diameter);
  overflow: clip;
}
.st-hex-sphere { position: absolute; inset: 0; transform: rotateZ(-10deg); transform-style: preserve-3d; }
.st-hex-row {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: st-hex-wave var(--wave-duration) linear calc(var(--row) * var(--row-step) - var(--wave-duration)) infinite;
}
.st-hex-scene[data-paused] .st-hex-row { animation-play-state: paused; }
.st-hex-tile {
  --phase-offset: calc(.035 * sin(var(--longitude) * 2 + var(--row) * 23deg) + .01 * sin(var(--longitude) * 5 - var(--row) * 11deg));
  --tile-phase: mod(calc(var(--st-hex-phase) - var(--phase-offset)), 1);
  --pulse: clamp(0, var(--tile-phase) / .4, 1);
  --st-hex-lift: calc(.5 - .5 * cos(360deg * var(--pulse)));
  --highlight: calc(var(--st-hex-lift) * var(--st-hex-lift) * var(--st-hex-lift) * var(--st-hex-lift));
  --x: calc(var(--radius) * cos(var(--latitude)) * sin(var(--longitude)));
  --y: calc(var(--radius) * sin(var(--latitude)));
  --z: calc(var(--radius) * cos(var(--latitude)) * cos(var(--longitude)));
  --depth: calc(cos(var(--latitude)) * cos(var(--longitude)));
  --rest-color: oklch(calc(10% + 12% * var(--depth)) 0 1);
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transform: translate3d(var(--x), var(--y), var(--z)) rotateY(var(--longitude)) rotateX(calc(-1 * var(--latitude)));
}
.st-hex-tile::before {
  content: "";
  position: absolute;
  width: calc(var(--diameter) * var(--size) / .96 * 1.015 + 1px);
  aspect-ratio: .8660254038;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  background: color-mix(in oklab, var(--rest-color), oklch(90% .105 220) calc(100% * var(--highlight)));
  backface-visibility: hidden;
  transform: translate(-50%, -50%) translateZ(calc(var(--diameter) * .05 * var(--st-hex-lift)));
}
@keyframes st-hex-wave { from { --st-hex-phase: 0; } to { --st-hex-phase: 1; } }
@media (prefers-reduced-motion: reduce) {
  .st-hex-row { animation: none; --st-hex-phase: 0; }
  .st-hex-tile { --st-hex-lift: 0; }
}
`;

export function StudioHexSphere({ className }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  // Вне экрана волна стоит: 283 плитки с 3D-трансформами не должны считаться впустую.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const io = new IntersectionObserver(([entry]) => {
      scene.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    io.observe(scene);
    return () => io.disconnect();
  }, []);

  return (
    <div aria-hidden className={`st-hex-host ${className ?? ""}`}>
      <style href="st-hex-sphere" precedence="default">
        {STYLES}
      </style>
      <div ref={sceneRef} className="st-hex-scene">
        <div className="st-hex-sphere">
          {ROWS.map(({ row, lat, size, tiles }) => (
            <div key={row} className="st-hex-row" style={{ "--row": row } as CSSProperties}>
              {tiles.map((lon) => (
                <span
                  key={lon}
                  className="st-hex-tile"
                  style={{ "--latitude": `${lat}deg`, "--longitude": `${lon}deg`, "--size": size } as CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
