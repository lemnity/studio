/**
 * Мини-игра «Лопай соты» для карточки «Разработка игр». Поле шестиугольников: нажатие на группу одного
 * цвета лопает её — соты срываются и падают вниз, соты над ними съезжают на освободившиеся места
 * с отскоком, сверху падают новые. Пока игру не трогают, к самой большой группе подлетает рука-курсор
 * и лопает её сама — заодно показывает, как играть.
 *
 * Механика одна, внешний вид — тема (`theme`): конфетная, ванильная, супер-казуальная, современная.
 * Соты стоят плоской стороной вверх: так столбцы строго вертикальные и падение идёт без зигзага.
 * Без React и зависимостей — подключение в studio-game.tsx.
 */

export type HexTheme = "candy" | "vanilla" | "super" | "modern";

export type HexPopOptions = {
  /** Только один статичный кадр — для prefers-reduced-motion. */
  still?: boolean;
  theme?: HexTheme;
};

export type HexPop = {
  /** Нажатие в точке холста (CSS-пиксели); без координат — лопнуть самую большую группу (клавиатура). */
  tap: (x?: number, y?: number) => void;
  setActive: (active: boolean) => void;
  destroy: () => void;
};

type Palette = readonly (readonly [base: string, light: string])[];

type Style = {
  palette: Palette;
  /** Цвет текста и контуров. */
  ink: string;
  font: string;
  /** Мордашки на сотах. */
  faces: boolean;
  /** Толщина мультяшного контура в долях радиуса; 0 — без контура. */
  outline: number;
  /** Рука-курсор на автопилоте. */
  hand: boolean;
  hint: { text: string; bg: string; fg: string };
  praise: readonly string[];
  /** Тряска поля на большой группе. */
  shake: boolean;
  /** «Сочное» поведение: соты покачиваются, пружинят, радуются ходу, лопаются конфетти из звёздочек. */
  juicy: boolean;
  /** Фон с вращающимися лучами. */
  rays: boolean;
};

const GILROY = "StudioGilroy, Arial, sans-serif";
const MONO = "ui-monospace, Menlo, monospace";

const STYLES: Record<HexTheme, Style> = {
  candy: {
    palette: [["#ff6fa5", "#ffd0e2"], ["#ffc93c", "#fff0b8"], ["#2fd4a0", "#c6f7e6"], ["#4cb8ff", "#cdeaff"], ["#a98bff", "#e6dcff"]],
    ink: "#3a1e2c",
    font: GILROY,
    faces: true,
    outline: 0,
    hand: true,
    hint: { text: "👆 Нажмите на соты", bg: "#3a1e2c", fg: "#fff" },
    praise: ["Супер!", "Вау!", "Отлично!", "Комбо!"],
    shake: false,
    juicy: true,
    rays: true,
  },
  vanilla: {
    palette: [["#e5484d", "#e5484d"], ["#f5b70a", "#f5b70a"], ["#30a46c", "#30a46c"], ["#0b74de", "#0b74de"], ["#8e4ec6", "#8e4ec6"]],
    ink: "#1c1c1c",
    font: "Arial, Helvetica, sans-serif",
    faces: false,
    outline: 0.06,
    hand: false,
    hint: { text: "Нажмите на группу одного цвета", bg: "#1c1c1c", fg: "#fff" },
    praise: ["Хорошо", "Отлично"],
    shake: false,
    juicy: false,
    rays: false,
  },
  super: {
    palette: [["#ff4f8b", "#ffb3cd"], ["#ffbe0b", "#ffe9a3"], ["#06d6a0", "#b4f5e3"], ["#3a86ff", "#bcd5ff"], ["#9d4edd", "#e0c4f7"]],
    ink: "#2b1036",
    font: GILROY,
    faces: true,
    outline: 0.11,
    hand: true,
    hint: { text: "👆 ЖМИ НА СОТЫ!", bg: "#2b1036", fg: "#fff" },
    praise: ["СУПЕР!", "ВАУ!", "КОМБО!", "МЕГА!", "ОГОНЬ!"],
    shake: true,
    juicy: true,
    rays: true,
  },
  modern: {
    palette: [["#c4ee18", "#eaff9a"], ["#5b8cff", "#b7ccff"], ["#a77bff", "#dccbff"], ["#3de0ff", "#b5f4ff"], ["#ff5ea8", "#ffc2de"]],
    ink: "#f4f1ec",
    font: MONO,
    faces: false,
    outline: 0,
    hand: false,
    hint: { text: "▶ нажмите на соты", bg: "rgba(255,255,255,0.1)", fg: "#f4f1ec" },
    praise: ["combo", "nice", "chain"],
    shake: false,
    juicy: false,
    rays: false,
  },
};

const ROWS = 5;
/** Верхняя полоса под подсказку и счёт в долях высоты сцены: соты под неё не заходят. */
const TOP = 0.17;
const S3 = Math.sqrt(3);
/** Через сколько секунд без нажатий игра снова играет сама. */
const AUTOPLAY_AFTER = 4;
/** Минимальный кегль любого текста в игре, px: на телефоне сцена низкая, и доли высоты дают мелочь. */
const MIN_TEXT = 16;

/** `squash` — сплющивание после приземления, плавно гаснет до нуля. */
type Cell = { color: number; off: number; vy: number; blink: number; wob: number; squash: number };
type Debris = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; color: number; s: number };
type Drop = { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number; spin: number };
type Float = { x: number; y: number; text: string; life: number; big: boolean };
type Hand = { c: number; r: number; x0: number; y0: number; x: number; y: number; t: number; done: boolean };
type Ring = { x: number; y: number; life: number; color: string };

export function startHexPop(canvas: HTMLCanvasElement, options: HexPopOptions = {}): HexPop {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { tap() {}, setActive() {}, destroy() {} };
  const g = ctx;
  const theme = options.theme ?? "candy";
  const style = STYLES[theme];
  const { palette, ink, font } = style;

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
  let rings: Ring[] = [];
  let score = 0;
  let idle = AUTOPLAY_AFTER;
  let autoIn = 0.8;
  let hand: Hand | null = null;
  let shake = 0;
  /** Время последнего лопания — у «сочных» сот на нём довольные глаза-щёлочки. */
  let cheer = 0;


  const gravity = () => R * 60;
  const cellX = (c: number) => ox + c * 1.5 * R;
  const cellY = (c: number, r: number) => oy + r * S3 * R + (c % 2) * ((S3 * R) / 2);
  const fresh = (): Cell => ({ color: Math.floor(rand() * palette.length), off: 0, vy: 0, blink: rand() * 6, wob: 0, squash: 0 });
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

  function cellAt(x: number, y: number): [number, number] | null {
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
    return target && nearest < R ? target : null;
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
    cheer = 0.9;
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
      const count = style.juicy ? 9 : theme === "vanilla" ? 0 : 5;
      for (let i = 0; i < count; i++) {
        drops.push({ x, y, vx: (rand() - 0.5) * R * 10, vy: -rand() * R * 9, life: 1, color: palette[color][0], r: R * (0.1 + rand() * 0.12), spin: rand() * 6 });
      }
      if (theme === "modern") rings.push({ x, y, life: 1, color: palette[color][0] });
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
    if (big && style.shake) shake = 0.35;
    const word = style.praise[Math.floor(rand() * style.praise.length)];
    floats.push({ x: sx / group.length, y: sy / group.length, text: big ? `${word} +${points}` : `+${points}`, life: 1, big });
  }

  function step(dt: number) {
    idle += dt;
    shake = Math.max(0, shake - dt);
    cheer = Math.max(0, cheer - dt);
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
            // Без отскока: сота встаёт на место и мягко сплющивается от удара.
            if (theme !== "modern" && theme !== "vanilla") cell.squash = Math.min(0.16, cell.vy / (R * 60));
            cell.off = 0;
            cell.vy = 0;
          }
        }
        cell.squash = Math.max(0, cell.squash - dt * 0.6);
      }
    }
    for (const d of debris) {
      d.vy += fall * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt * 0.6;
      d.s = Math.max(0.4, d.s - dt * (theme === "vanilla" ? 1.2 : 0.4));
    }
    debris = debris.filter((d) => d.y < H + R * 2);
    for (const p of drops) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += R * 22 * dt;
      p.spin += dt * 8;
      p.life -= dt * 1.6;
    }
    drops = drops.filter((p) => p.life > 0);
    for (const ring of rings) ring.life -= dt * 2.2;
    rings = rings.filter((ring) => ring.life > 0);
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

  /* ───── Рисование ───── */

  function hexAt(x: number, y: number, r: number) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    g.closePath();
  }

  function starAt(x: number, y: number, r: number, rot: number) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i + rot;
      const rad = i % 2 ? r * 0.45 : r;
      g.lineTo(x + rad * Math.cos(a), y + rad * Math.sin(a));
    }
    g.closePath();
  }

  function background(time: number) {
    if (theme === "modern") {
      g.fillStyle = "#0b0d12";
      g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(255,255,255,0.05)";
      g.lineWidth = 1;
      const step = R;
      for (let x = (ox % step) - step; x < W; x += step) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let y = 0; y < H; y += step) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      const glow = g.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
      glow.addColorStop(0, "rgba(91,140,255,0.12)");
      glow.addColorStop(1, "rgba(91,140,255,0)");
      g.fillStyle = glow;
      g.fillRect(0, 0, W, H);
      return;
    }
    if (theme === "vanilla") {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      return;
    }
    if (style.rays) {
      g.fillStyle = "#ffe066";
      g.fillRect(0, 0, W, H);
      // Вращающиеся лучи от центра — фон игрового «шоу».
      g.save();
      g.translate(W / 2, H * 0.55);
      g.rotate(time * 0.12);
      g.fillStyle = "#ffd23f";
      const len = Math.hypot(W, H);
      for (let i = 0; i < 12; i++) {
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, len, (Math.PI / 6) * i, (Math.PI / 6) * i + Math.PI / 12);
        g.closePath();
        g.fill();
      }
      g.restore();
      return;
    }
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#fff6e9");
    sky.addColorStop(1, "#ffe3ef");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
  }

  function gem(x: number, y: number, r: number, color: number, cell: Cell | null) {
    const [base, light] = palette[color];
    if (theme === "modern") {
      const fill = g.createLinearGradient(x - r, y - r, x + r, y + r);
      fill.addColorStop(0, light);
      fill.addColorStop(1, base);
      g.globalAlpha = 0.22;
      g.fillStyle = fill;
      hexAt(x, y, r);
      g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = base;
      g.lineWidth = Math.max(1, r * 0.08);
      g.shadowColor = base;
      g.shadowBlur = r * 0.5;
      hexAt(x, y, r * 0.94);
      g.stroke();
      g.shadowBlur = 0;
      g.fillStyle = base;
      hexAt(x, y, r * 0.22);
      g.fill();
      return;
    }
    if (theme === "vanilla") {
      g.fillStyle = base;
      hexAt(x, y, r);
      g.fill();
      g.strokeStyle = "#ffffff";
      g.lineWidth = r * style.outline;
      g.stroke();
      return;
    }
    g.fillStyle = theme === "super" ? "rgba(43,16,54,0.25)" : "rgba(120, 60, 90, 0.16)";
    hexAt(x, y + R * 0.1, r);
    g.fill();
    g.fillStyle = base;
    hexAt(x, y, r);
    g.fill();
    if (style.outline) {
      g.strokeStyle = ink;
      g.lineWidth = r * style.outline;
      g.lineJoin = "round";
      g.stroke();
    }
    g.fillStyle = light;
    g.globalAlpha = 0.55;
    hexAt(x - r * 0.2, y - r * 0.24, r * 0.4);
    g.fill();
    g.globalAlpha = 1;
    if (!cell || !style.faces) return;
    g.fillStyle = ink;
    g.strokeStyle = ink;
    if (style.juicy && cheer > 0) {
      // Довольные глаза-щёлочки, пока поле радуется удачному ходу.
      g.lineWidth = Math.max(1.5, r * 0.08);
      g.lineCap = "round";
      for (const side of [-1, 1]) {
        g.beginPath();
        g.arc(x + side * r * 0.24, y + r * 0.1, r * 0.1, Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
      }
    } else {
      const eye = cell.blink < 0 ? r * 0.03 : r * (theme === "super" ? 0.16 : 0.13);
      g.beginPath();
      g.ellipse(x - r * 0.24, y + r * 0.06, r * (theme === "super" ? 0.11 : 0.09), eye, 0, 0, Math.PI * 2);
      g.ellipse(x + r * 0.24, y + r * 0.06, r * (theme === "super" ? 0.11 : 0.09), eye, 0, 0, Math.PI * 2);
      g.fill();
      if (theme === "super" && cell.blink >= 0) {
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(x - r * 0.21, y + r * 0.0, r * 0.04, 0, Math.PI * 2);
        g.arc(x + r * 0.27, y + r * 0.0, r * 0.04, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  function smile(r: number) {
    g.strokeStyle = ink;
    g.lineWidth = Math.max(1, r * (theme === "super" ? 0.08 : 0.06));
    g.lineCap = "round";
    g.beginPath();
    g.arc(0, r * 0.3, r * (theme === "super" ? 0.18 : 0.14), 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  }

  /** Подсказка в верхней полосе: крупная контрастная плашка, мягко пульсирует, стрелка показывает на поле. */
  function pill(time: number) {
    const size = Math.max(MIN_TEXT, H * 0.062);
    const { text, bg, fg } = style.hint;
    g.font = `600 ${Math.round(size)}px ${font}`;
    const width = g.measureText(text).width + size * 1.6;
    const h = size * 2;
    const x = H * 0.05;
    const y = (H * TOP - h) / 2 + H * 0.01;
    const pulse = theme === "vanilla" ? 1 : 1 + 0.035 * Math.sin(time * 3.2);
    g.save();
    g.translate(x + width / 2, y + h / 2);
    g.scale(pulse, pulse);
    g.shadowColor = "rgba(0, 0, 0, 0.18)";
    g.shadowBlur = size * 0.6;
    g.shadowOffsetY = size * 0.15;
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(-width / 2, -h / 2, width, h, theme === "vanilla" ? 3 : h / 2);
    g.fill();
    g.shadowColor = "transparent";
    // Стрелка вниз, на поле; покачивается в такт пульсу.
    const bob = Math.sin(time * 3.2) * size * 0.12;
    g.beginPath();
    g.moveTo(-width / 2 + size * 1.1, h / 2 - 1);
    g.lineTo(-width / 2 + size * 1.6, h / 2 + size * 0.45 + bob);
    g.lineTo(-width / 2 + size * 2.1, h / 2 - 1);
    g.closePath();
    g.fill();
    g.fillStyle = fg;
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillText(text, 0, 1);
    g.restore();
    g.textBaseline = "alphabetic";
    g.textAlign = "left";
  }

  function draw(time: number) {
    g.save();
    if (shake) g.translate((rand() - 0.5) * R * 0.3 * (shake / 0.35), (rand() - 0.5) * R * 0.3 * (shake / 0.35));
    background(time);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        const idleBob = style.juicy ? Math.sin(time * 1.6 + c * 0.5 + r * 0.8) * R * 0.02 : 0;
        const x = cellX(c) + (cell.wob ? Math.sin(cell.wob * 40) * R * 0.08 : 0);
        const y = cellY(c, r) + cell.off + idleBob;
        // Сплющивание после приземления — сота читается как мягкая конфета; гаснет плавно (ease-out).
        const squash = 1 + cell.squash * cell.squash * 6;
        g.save();
        g.translate(x, y);
        g.scale(squash, 1 / squash);
        gem(0, 0, R * (theme === "vanilla" ? 0.96 : 0.92), cell.color, cell);
        if (style.faces && cell.blink >= 0 && (style.juicy || (c + r) % 3 === 0)) smile(R * 0.92);
        g.restore();
      }
    }

    for (const ring of rings) {
      g.globalAlpha = ring.life;
      g.strokeStyle = ring.color;
      g.lineWidth = Math.max(1, R * 0.06 * ring.life);
      hexAt(ring.x, ring.y, R * (0.9 + (1 - ring.life) * 1.4));
      g.stroke();
    }
    g.globalAlpha = 1;
    for (const d of debris) {
      g.save();
      g.translate(d.x, d.y);
      g.rotate(d.rot);
      if (theme === "vanilla") g.globalAlpha = Math.max(0, d.s);
      gem(0, 0, R * 0.92 * d.s, d.color, null);
      g.restore();
    }
    for (const p of drops) {
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = p.color;
      if (style.juicy) {
        starAt(p.x, p.y, p.r * 1.6, p.spin);
        g.fill();
      } else if (theme === "modern") {
        g.strokeStyle = p.color;
        g.lineWidth = Math.max(1, R * 0.04);
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
        g.stroke();
      } else {
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;

    g.textAlign = "center";
    for (const f of floats) {
      g.globalAlpha = Math.min(1, f.life * 1.5);
      const size = Math.max(MIN_TEXT, R * (f.big ? (theme === "super" ? 1.05 : 0.8) : 0.6));
      g.font = `${theme === "modern" ? 500 : 800} ${Math.round(size)}px ${font}`;
      g.lineJoin = "round";
      if (theme === "modern") {
        g.shadowColor = palette[0][0];
        g.shadowBlur = R * 0.6;
        g.fillStyle = f.big ? palette[0][0] : ink;
        g.fillText(f.text, f.x, f.y);
        g.shadowBlur = 0;
        continue;
      }
      if (theme === "super") {
        // Мультяшная надпись: розовая тень со сдвигом, толстый тёмный контур, белые буквы.
        g.lineWidth = R * 0.26;
        g.strokeStyle = palette[0][0];
        g.strokeText(f.text, f.x + R * 0.07, f.y + R * 0.09);
        g.strokeStyle = ink;
        g.strokeText(f.text, f.x, f.y);
        g.fillStyle = f.big ? "#fff" : palette[1][1];
        g.fillText(f.text, f.x, f.y);
        continue;
      }
      g.lineWidth = R * 0.14;
      g.strokeStyle = "#fff";
      g.strokeText(f.text, f.x, f.y);
      g.fillStyle = f.big && theme === "candy" ? palette[0][0] : ink;
      g.fillText(f.text, f.x, f.y);
    }
    g.globalAlpha = 1;
    g.textAlign = "left";

    if (hand && style.hand) {
      const k = Math.min(1, hand.t / 0.45);
      const ease = 1 - Math.pow(1 - k, 3);
      const press = hand.t > 0.45 && hand.t < 0.7 ? 0.85 : 1;
      g.save();
      g.translate(hand.x0 + (hand.x - hand.x0) * ease, hand.y0 + (hand.y - hand.y0) * ease);
      g.scale(press, press);
      g.rotate(-0.4);
      g.fillStyle = "#fff";
      g.strokeStyle = ink;
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
    } else if (hand) {
      // Без руки автопилот показывает цель мягким пульсирующим контуром.
      const k = Math.min(1, hand.t / 0.5);
      g.globalAlpha = 0.6 * k;
      g.strokeStyle = ink;
      g.lineWidth = Math.max(1, R * 0.06);
      hexAt(hand.x, hand.y, R * (1.05 + 0.1 * Math.sin(hand.t * 20)));
      g.stroke();
      g.globalAlpha = 1;
    }
    g.restore();

    g.font = `${theme === "modern" ? 500 : 700} ${Math.round(Math.max(MIN_TEXT, H * 0.075))}px ${font}`;
    g.textAlign = "right";
    g.fillStyle = ink;
    g.fillText(theme === "modern" ? String(score).padStart(5, "0") : String(score), W - H * 0.06, H * TOP * 0.66);
    g.textAlign = "left";
    if (idle >= AUTOPLAY_AFTER) pill(time);
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = (H * (1 - TOP - 0.05)) / ((ROWS + 0.5) * S3);
    const nextCols = Math.max(5, Math.floor((W * 0.94 - 2 * R) / (1.5 * R)) + 1);
    const gridW = (nextCols - 1) * 1.5 * R + 2 * R;
    const gridH = (ROWS + 0.5) * S3 * R;
    ox = (W - gridW) / 2 + R;
    oy = H * TOP + (H * (1 - TOP) - gridH) / 2 + (S3 * R) / 2;
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
      const target = cellAt(x, y);
      if (target) pop(target[0], target[1]);
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
