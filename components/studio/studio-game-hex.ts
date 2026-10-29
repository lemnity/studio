/**
 * Мини-игра «Лопай соты» для карточки «Разработка игр». Поле конфетных шестиугольников с мордашками:
 * нажатие на группу одного цвета лопает её — соты срываются и с кувырком падают вниз, соты над ними
 * съезжают на освободившиеся места с отскоком, сверху падают новые. Пока игру не трогают, к самой
 * большой группе подлетает рука-курсор и лопает её сама — заодно показывает, как играть.
 *
 * Соты стоят плоской стороной вверх: так столбцы строго вертикальные и падение идёт без зигзага.
 * Без React и зависимостей — подключение в studio-game.tsx.
 */

export type HexPopOptions = {
  /** Только один статичный кадр — для prefers-reduced-motion. */
  still?: boolean;
};

export type HexPop = {
  /** Нажатие в точке холста (CSS-пиксели); без координат — лопнуть самую большую группу (клавиатура). */
  tap: (x?: number, y?: number) => void;
  setActive: (active: boolean) => void;
  destroy: () => void;
};

const COLORS: readonly (readonly [string, string])[] = [
  ["#ff6fa5", "#ffd0e2"],
  ["#ffc93c", "#fff0b8"],
  ["#2fd4a0", "#c6f7e6"],
  ["#4cb8ff", "#cdeaff"],
  ["#a98bff", "#e6dcff"],
];
const INK = "#3a1e2c";
const FONT = "StudioGilroy, Arial, sans-serif";
const ROWS = 5;
const S3 = Math.sqrt(3);
/** Через сколько секунд без нажатий игра снова играет сама. */
const AUTOPLAY_AFTER = 4;
const PRAISE = ["Супер!", "Вау!", "Отлично!", "Комбо!"];

type Cell = { color: number; off: number; vy: number; blink: number; wob: number };
type Debris = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; color: number; s: number };
type Drop = { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number };
type Float = { x: number; y: number; text: string; life: number; big: boolean };
type Hand = { c: number; r: number; x0: number; y0: number; x: number; y: number; t: number; done: boolean };

export function startHexPop(canvas: HTMLCanvasElement, options: HexPopOptions = {}): HexPop {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { tap() {}, setActive() {}, destroy() {} };
  const g = ctx;

  let W = 0;
  let H = 0;
  let frame = 0;
  let last = 0;
  let active = true;

  let seed = 1;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  let cols = 0;
  let R = 0;
  let ox = 0;
  let oy = 0;
  let grid: Cell[][] = [];
  let debris: Debris[] = [];
  let drops: Drop[] = [];
  let floats: Float[] = [];
  let score = 0;
  let idle = AUTOPLAY_AFTER;
  let autoIn = 0.8;
  let hand: Hand | null = null;

  const gravity = () => R * 87;
  const cellX = (c: number) => ox + c * 1.5 * R;
  const cellY = (c: number, r: number) => oy + r * S3 * R + (c % 2) * ((S3 * R) / 2);
  const fresh = (): Cell => ({ color: Math.floor(rand() * COLORS.length), off: 0, vy: 0, blink: rand() * 6, wob: 0 });
  const settled = (cell: Cell | undefined) => !!cell && Math.abs(cell.off) < 0.5 && Math.abs(cell.vy) < 1;

  function neighbours(c: number, r: number): [number, number][] {
    const steps = c % 2
      ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
      : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
    return steps
      .map(([dc, dr]): [number, number] => [c + dc, r + dr])
      .filter(([a, b]) => a >= 0 && b >= 0 && a < cols && b < ROWS);
  }

  function cluster(c: number, r: number): [number, number][] {
    const color = grid[c][r].color;
    const seen = new Set([`${c},${r}`]);
    const out: [number, number][] = [[c, r]];
    const stack: [number, number][] = [[c, r]];
    while (stack.length) {
      const [a, b] = stack.pop()!;
      for (const [x, y] of neighbours(a, b)) {
        const key = `${x},${y}`;
        const cell = grid[x][y];
        if (!seen.has(key) && settled(cell) && cell.color === color) {
          seen.add(key);
          out.push([x, y]);
          stack.push([x, y]);
        }
      }
    }
    return out;
  }

  function biggestGroup() {
    let best: { c: number; r: number; size: number } | null = null;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (!settled(grid[c][r])) continue;
        const size = cluster(c, r).length;
        if (!best || size > best.size) best = { c, r, size };
      }
    }
    return best;
  }

  function pop(c: number, r: number) {
    if (!settled(grid[c][r])) return;
    const group = cluster(c, r);
    if (group.length < 2) {
      grid[c][r].wob = 0.3;
      return;
    }
    const points = group.length * group.length * 5;
    score += points;
    let sx = 0;
    let sy = 0;
    const gone = new Set(group.map(([a, b]) => `${a},${b}`));
    for (const [a, b] of group) {
      const x = cellX(a);
      const y = cellY(a, b) + grid[a][b].off;
      const color = grid[a][b].color;
      sx += x;
      sy += y;
      // Сама сота срывается и падает с кувырком, вокруг — брызги её цвета.
      debris.push({ x, y, vx: (rand() - 0.5) * R * 6, vy: -R * (3 + rand() * 4), rot: 0, vr: (rand() - 0.5) * 10, color, s: 1 });
      for (let i = 0; i < 5; i++) {
        drops.push({ x, y, vx: (rand() - 0.5) * R * 10, vy: -rand() * R * 9, life: 1, color: COLORS[color][0], r: R * (0.1 + rand() * 0.12) });
      }
    }
    // Столбцы оседают: оставшиеся соты съезжают вниз (смещение гасится гравитацией), сверху — новые.
    for (let a = 0; a < cols; a++) {
      const keep: { cell: Cell; from: number }[] = [];
      for (let b = 0; b < ROWS; b++) if (!gone.has(`${a},${b}`)) keep.push({ cell: grid[a][b], from: b });
      const missing = ROWS - keep.length;
      if (!missing) continue;
      const column: Cell[] = [];
      for (let i = 0; i < missing; i++) {
        const cell = fresh();
        cell.off = -(missing - i + 1.2) * S3 * R - rand() * R;
        column.push(cell);
      }
      keep.forEach(({ cell, from }, i) => {
        cell.off += (from - (missing + i)) * S3 * R;
        column.push(cell);
      });
      grid[a] = column;
    }
    const big = group.length >= 5;
    floats.push({
      x: sx / group.length,
      y: sy / group.length,
      text: big ? `${PRAISE[Math.floor(rand() * PRAISE.length)]} +${points}` : `+${points}`,
      life: 1,
      big,
    });
  }

  function step(dt: number) {
    idle += dt;
    const fall = gravity();
    for (const column of grid) {
      for (const cell of column) {
        cell.blink -= dt;
        if (cell.blink < -0.15) cell.blink = 2 + rand() * 5;
        cell.wob = Math.max(0, cell.wob - dt);
        if (cell.off < 0 || cell.vy) {
          cell.vy += fall * dt;
          cell.off += cell.vy * dt;
          if (cell.off >= 0) {
            cell.off = 0;
            // Быстрое приземление даёт короткий отскок, медленное — просто встаёт.
            cell.vy = cell.vy > R * 6 ? -cell.vy * 0.28 : 0;
          }
        }
      }
    }
    for (const d of debris) {
      d.vy += fall * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
      d.s = Math.max(0.4, d.s - dt * 0.4);
    }
    debris = debris.filter((d) => d.y < H + R * 2);
    for (const p of drops) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += R * 22 * dt;
      p.life -= dt * 1.6;
    }
    drops = drops.filter((p) => p.life > 0);
    for (const f of floats) {
      f.y -= R * 1.2 * dt;
      f.life -= dt * 0.8;
    }
    floats = floats.filter((f) => f.life > 0);

    if (idle < AUTOPLAY_AFTER) {
      hand = null;
      return;
    }
    if (!hand) {
      autoIn -= dt;
      if (autoIn <= 0) {
        const best = biggestGroup();
        if (best) hand = { c: best.c, r: best.r, x0: W * 0.92, y0: H * 1.1, x: cellX(best.c), y: cellY(best.c, best.r), t: 0, done: false };
      }
      return;
    }
    hand.t += dt;
    if (hand.t > 0.55 && !hand.done) {
      hand.done = true;
      pop(hand.c, hand.r);
    }
    if (hand.t > 0.9) {
      hand = null;
      autoIn = 0.7;
    }
  }

  function hexAt(x: number, y: number, r: number) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    g.closePath();
  }

  function gem(x: number, y: number, r: number, color: number, cell: Cell | null) {
    const [base, light] = COLORS[color];
    g.fillStyle = "rgba(120, 60, 90, 0.16)";
    hexAt(x, y + R * 0.1, r);
    g.fill();
    g.fillStyle = base;
    hexAt(x, y, r);
    g.fill();
    g.fillStyle = light;
    g.globalAlpha = 0.55;
    hexAt(x - r * 0.2, y - r * 0.24, r * 0.4);
    g.fill();
    g.globalAlpha = 1;
    if (!cell) return;
    const eye = cell.blink < 0 ? r * 0.03 : r * 0.13;
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(x - r * 0.24, y + r * 0.06, r * 0.09, eye, 0, 0, Math.PI * 2);
    g.ellipse(x + r * 0.24, y + r * 0.06, r * 0.09, eye, 0, 0, Math.PI * 2);
    g.fill();
  }

  function pill(text: string, x: number, y: number, size: number, time: number) {
    g.font = `600 ${Math.round(size)}px ${FONT}`;
    const width = g.measureText(text).width;
    const pad = size * 0.8;
    const h = size * 2;
    g.globalAlpha = 0.88 + 0.12 * Math.sin(time * 4);
    g.fillStyle = COLORS[0][0];
    g.beginPath();
    g.roundRect(x, y, width + pad * 2, h, h / 2);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillText(text, x + pad, y + h / 2 + 1);
    g.textBaseline = "alphabetic";
  }

  function draw(time: number) {
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#fff6e9");
    sky.addColorStop(1, "#ffe3ef");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        const x = cellX(c) + (cell.wob ? Math.sin(cell.wob * 40) * R * 0.08 : 0);
        const y = cellY(c, r) + cell.off;
        // Сплющивание на отскоке — сота читается как мягкая конфета.
        const squash = cell.vy < 0 ? 1 + Math.min(0.15, -cell.vy / (R * 40)) : 1;
        g.save();
        g.translate(x, y);
        g.scale(squash, 1 / squash);
        gem(0, 0, R * 0.92, cell.color, cell);
        if ((c + r) % 3 === 0 && cell.blink >= 0) {
          g.strokeStyle = INK;
          g.lineWidth = Math.max(1, R * 0.055);
          g.beginPath();
          g.arc(0, R * 0.28, R * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
          g.stroke();
        }
        g.restore();
      }
    }

    for (const d of debris) {
      g.save();
      g.translate(d.x, d.y);
      g.rotate(d.rot);
      gem(0, 0, R * 0.92 * d.s, d.color, null);
      g.restore();
    }
    for (const p of drops) {
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = p.color;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;

    g.textAlign = "center";
    for (const f of floats) {
      g.globalAlpha = Math.min(1, f.life * 1.5);
      g.font = `700 ${Math.round(R * (f.big ? 0.8 : 0.6))}px ${FONT}`;
      g.lineWidth = R * 0.14;
      g.strokeStyle = "#fff";
      g.strokeText(f.text, f.x, f.y);
      g.fillStyle = f.big ? "#ff3d8a" : INK;
      g.fillText(f.text, f.x, f.y);
    }
    g.globalAlpha = 1;
    g.textAlign = "left";

    if (hand) {
      const k = Math.min(1, hand.t / 0.45);
      const ease = 1 - Math.pow(1 - k, 3);
      const press = hand.t > 0.45 && hand.t < 0.7 ? 0.85 : 1;
      g.save();
      g.translate(hand.x0 + (hand.x - hand.x0) * ease, hand.y0 + (hand.y - hand.y0) * ease);
      g.scale(press, press);
      g.rotate(-0.4);
      g.fillStyle = "#fff";
      g.strokeStyle = INK;
      g.lineWidth = Math.max(1.5, R * 0.07);
      g.beginPath();
      g.roundRect(-R * 0.16, 0, R * 0.32, R * 0.7, R * 0.16);
      g.fill();
      g.stroke();
      g.beginPath();
      g.roundRect(-R * 0.3, R * 0.45, R * 0.75, R * 0.6, R * 0.22);
      g.fill();
      g.stroke();
      g.restore();
    }

    g.font = `700 ${Math.round(H * 0.075)}px ${FONT}`;
    g.textAlign = "right";
    g.fillStyle = INK;
    g.fillText(String(score), W - H * 0.06, H * 0.13);
    g.textAlign = "left";
    if (idle >= AUTOPLAY_AFTER) pill("👆 Нажмите на соты", H * 0.05, H * 0.05, H * 0.05, time);
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = (H * 0.8) / ((ROWS + 0.5) * S3);
    const nextCols = Math.max(5, Math.floor((W * 0.94 - 2 * R) / (1.5 * R)) + 1);
    const gridW = (nextCols - 1) * 1.5 * R + 2 * R;
    const gridH = (ROWS + 0.5) * S3 * R;
    ox = (W - gridW) / 2 + R;
    oy = (H - gridH) / 2 + (S3 * R) / 2 + H * 0.05;
    if (nextCols !== cols) {
      cols = nextCols;
      seed = 1;
      grid = Array.from({ length: cols }, () => Array.from({ length: ROWS }, fresh));
    }
    if (options.still) draw(0);
  }

  function loop(now: number) {
    frame = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (W && H && cols) {
      step(dt);
      draw(now / 1000);
    }
    if (active && !document.hidden) frame = requestAnimationFrame(loop);
    else last = 0;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const onVisibility = () => {
    if (!document.hidden && active && !frame && !options.still) frame = requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", onVisibility);
  if (!options.still) frame = requestAnimationFrame(loop);

  return {
    tap(x, y) {
      idle = 0;
      if (options.still || !cols) return;
      if (x === undefined || y === undefined) {
        const best = biggestGroup();
        if (best) pop(best.c, best.r);
        return;
      }
      let target: [number, number] | null = null;
      let nearest = Infinity;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ROWS; r++) {
          const d = Math.hypot(cellX(c) - x, cellY(c, r) + grid[c][r].off - y);
          if (d < nearest) {
            nearest = d;
            target = [c, r];
          }
        }
      }
      if (target && nearest < R) pop(target[0], target[1]);
    },
    setActive(next) {
      active = next;
      if (active && !frame && !options.still) frame = requestAnimationFrame(loop);
    },
    destroy() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
