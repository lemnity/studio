"use client";

/**
 * 3D-логотип Lemnity для первого экрана «Лемнити Студии»: словесный знак, выдавленный в объём со
 * скруглённой фаской, тёмный хром с синим окружением и радужным ободком по Френелю. Без three.js.
 *
 * Как устроено:
 *  1. Буквы берутся из LemnityWordmark (те же пути, что в public/logo-w.svg) и один раз растрируются
 *     в 2D-холст.
 *  2. По маске считается знаковое поле расстояний (точный EDT Фельценшвальба, на CPU, один раз) и
 *     заливается в текстуру.
 *  3. Фрагментный шейдер «шагает» лучом по выдавленному полю: 2D-расстояние из текстуры + глубина
 *     по Z = объёмная буква с фаской. Свет и материал — в том же шейдере.
 *
 * Бережём ресурсы: кадры идут, только пока холст на экране и вкладка видна; плотность пикселей
 * не выше 1.5; при prefers-reduced-motion рисуется один кадр. Нет WebGL — холст скрывается.
 */

import { useEffect, useRef } from "react";

import { LETTERS } from "@/components/lemnity-wordmark";

/** Размер знака в единицах SVG (viewBox 169×38) и поля вокруг него в текстуре. */
const LOGO_W = 169;
const LOGO_H = 38;
const PAD = 10;
/** Поле расстояний хранится в 8 битах в диапазоне ±RANGE единиц SVG. */
const RANGE = 6;
const TEX_W = 2048;
const TEX_H = Math.round((TEX_W * (LOGO_H + PAD * 2)) / (LOGO_W + PAD * 2));

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uSdf;

const float LW = ${LOGO_W.toFixed(1)};
const float LH = ${LOGO_H.toFixed(1)};
const float PAD = ${PAD.toFixed(1)};
const float RANGE = ${RANGE.toFixed(1)};
// Мир: ширина знака 3.4 единицы.
const float S = LW / 3.4;
const float DEPTH = 0.16;   // половина толщины
const float BEVEL = 0.035;  // радиус скругления кромки

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// 2D-расстояние до знака в мировых единицах (минус — внутри буквы).
float sdLogo2D(vec2 p) {
  vec2 l = vec2(p.x * S + LW * 0.5, -p.y * S + LH * 0.5);
  vec2 q = abs(l - vec2(LW, LH) * 0.5) - (vec2(LW, LH) * 0.5 + PAD - 0.5);
  float outside = length(max(q, 0.0));
  if (outside > 0.0) return (outside + RANGE) / S;
  vec2 uv = (l + PAD) / (vec2(LW, LH) + 2.0 * PAD);
  float v = texture2D(uSdf, uv).r * 2.0 - 1.0;
  return v * RANGE / S;
}

vec3 xform(vec3 p) {
  p.y -= sin(uTime * 0.8) * 0.05;
  p.xz *= rot(sin(uTime * 0.45) * 0.38 + uMouse.x * 0.45);
  p.yz *= rot(-0.12 + sin(uTime * 0.33) * 0.08 + uMouse.y * 0.35);
  return p;
}

float map(vec3 p) {
  p = xform(p);
  float d2 = sdLogo2D(p.xy) + BEVEL;
  vec2 w = vec2(d2, abs(p.z) - DEPTH + BEVEL);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - BEVEL;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0025, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

// Окружение «студии»: тёмный пол, синий свод, два софтбокса.
vec3 env(vec3 d) {
  float y = d.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.01, 0.012, 0.02), vec3(0.09, 0.2, 0.6), smoothstep(0.3, 1.0, y));
  c += vec3(0.24, 0.48, 1.0) * pow(max(dot(d, normalize(vec3(-0.6, 0.55, 0.6))), 0.0), 18.0) * 2.4;
  c += vec3(0.95, 0.95, 1.0) * pow(max(dot(d, normalize(vec3(0.7, 0.35, 0.5))), 0.0), 50.0) * 2.8;
  c += vec3(0.12, 0.2, 0.55) * pow(max(dot(d, normalize(vec3(0.0, -0.8, 0.4))), 0.0), 6.0) * 0.6;
  // Фронтальный софтбокс: без него лицевые грани отражают тёмный горизонт и знак «гаснет».
  c += vec3(0.3, 0.52, 1.0) * pow(max(dot(d, normalize(vec3(0.25, 0.3, 1.0))), 0.0), 7.0) * 1.3;
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.x;
  vec3 ro = vec3(0.0, 0.0, 4.6);
  vec3 rd = normalize(vec3(uv * 2.25, -2.8));

  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 140; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0006) { hit = t; break; }
    t += d * 0.9;
    if (t > 8.0) break;
  }
  if (hit < 0.0) { gl_FragColor = vec4(0.0); return; }

  vec3 p = ro + rd * hit;
  vec3 n = calcNormal(p);
  vec3 r = reflect(rd, n);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);

  vec3 base = vec3(0.03, 0.035, 0.06);
  vec3 refl = env(r);
  vec3 iri = 0.5 + 0.5 * cos(6.2831 * (fres * 0.6 + vec3(0.58, 0.66, 0.78)) + uTime * 0.2);
  vec3 col = base + refl * mix(0.85, 1.25, fres) + iri * fres * 0.55;

  // Лицевая грань чуть светлее боковин: знак читается при любом наклоне.
  vec3 nl = normalize(xform(p + n) - xform(p));
  col += vec3(0.05, 0.09, 0.22) * smoothstep(0.7, 1.0, abs(nl.z));

  col = col / (1.0 + col);
  col = pow(col, vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Одномерное точное преобразование расстояний (Felzenszwalb & Huttenlocher). */
function edt1d(f: Float32Array, n: number, d: Float32Array, v: Int32Array, z: Float32Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** Квадрат расстояния до ближайшей «закрашенной» точки для каждой ячейки сетки. */
function edt2d(grid: Float32Array, w: number, h: number) {
  const n = Math.max(w, h);
  const f = new Float32Array(n);
  const d = new Float32Array(n);
  const v = new Int32Array(n);
  const z = new Float32Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
}

/** Знаковое поле расстояний знака, упакованное в RGBA8 (канал R). */
function buildLogoSdf(): Uint8Array | null {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const pxPerUnit = TEX_W / (LOGO_W + PAD * 2);
  ctx.setTransform(pxPerUnit, 0, 0, pxPerUnit, PAD * pxPerUnit, PAD * pxPerUnit);
  ctx.fillStyle = "#fff";
  for (const l of LETTERS) ctx.fill(new Path2D(l.d));
  const alpha = ctx.getImageData(0, 0, TEX_W, TEX_H).data;

  const N = TEX_W * TEX_H;
  const BIG = 1e12;
  const outside = new Float32Array(N);
  const inside = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const on = alpha[i * 4 + 3] > 127;
    outside[i] = on ? 0 : BIG;
    inside[i] = on ? BIG : 0;
  }
  edt2d(outside, TEX_W, TEX_H);
  edt2d(inside, TEX_W, TEX_H);

  const out = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const distPx = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);
    const units = distPx / pxPerUnit;
    const v = Math.max(-1, Math.min(1, units / RANGE));
    out[i * 4] = Math.round((v * 0.5 + 0.5) * 255);
    out[i * 4 + 3] = 255;
  }
  return out;
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[studio-hero-3d] shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function StudioHero3D({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    const sdf = gl ? buildLogoSdf() : null;
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl?.createProgram() ?? null;
    if (!gl || !sdf || !vs || !fs || !prog) {
      canvas.style.display = "none";
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Текстура NPOT: в WebGL1 только CLAMP_TO_EDGE и без мипмапов.
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX_W, TEX_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, sdf);
    gl.uniform1i(gl.getUniformLocation(prog, "uSdf"), 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    let frame = 0;
    let running = false;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      gl.uniform1f(uTime, reduce ? 0 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVis = () => (document.hidden ? pause() : play());
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    resize();
    draw(performance.now());
    play();

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
