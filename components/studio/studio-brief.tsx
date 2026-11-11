"use client";

/**
 * Окно «Заказать проект»: чат с ИИ-ассистентом Леммусом. Ассистент собирает бриф вопросами или изучает
 * готовый (файлом или текстом), затем сервер изучает средние цены в стране клиента и готовит КП —
 * страницу /kp/<id>, которую клиент открывает и сохраняет в PDF; копия брифа и КП уходит в группу Telegram.
 *
 * Модель на сервере (server/lead/brief.py) — сайт статический, ключей в браузере нет. Окно открывается
 * событием openBrief() с любой кнопки «Заказать проект»; переписка живёт в sessionStorage до закрытия вкладки.
 * Если ассистент недоступен, окно предлагает Telegram и обычную форму.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, FileText, Paperclip, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { LemmusMark } from "@/components/lemmus-logo";
import { cn } from "@/lib/utils";

import { AD_SOURCE_KEY, STUDIO_CONTACT_TG, STUDIO_METRIKA_ID, STUDIO_PRIVACY_URL } from "./studio-content";
import type { Locale } from "./studio-i18n";
import { useStudioLocale } from "./studio-locale";

export const STUDIO_BRIEF_URL = (process.env.NEXT_PUBLIC_BRIEF_URL || "https://lemmus.studio/api/brief").replace(/\/+$/, "");

const OPEN_EVENT = "lmm:brief";
const STORE_KEY = "lmm-brief-v1";
const MAX_FILE = 4 * 1024 * 1024;

/** Открыть окно ассистента (кнопки «Заказать проект»). */
export const openBrief = () => window.dispatchEvent(new Event(OPEN_EVENT));

type Kp = { url: string; title: string; total: string; duration: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  /** Что показать вместо content (у файла — имя файла). */
  display?: string;
  kind?: "text" | "file" | "kp" | "error";
  kp?: Kp;
};
type Brief = Record<string, unknown>;

type BriefUi = {
  greeting: string;
  title: string;
  status: string;
  placeholder: string;
  attach: string;
  send: string;
  close: string;
  restart: string;
  typing: string;
  kpSteps: readonly string[];
  kpReady: string;
  kpOpen: string;
  kpTotal: string;
  kpTerm: string;
  fileTooBig: string;
  fileFail: string;
  fileIntro: (name: string) => string;
  failText: string;
  failTg: string;
  failForm: string;
  rate: string;
  footer: [string, string];
};

const UI: Record<Locale, BriefUi> = {
  ru: {
    greeting:
      "Привет, я Леммус! Помогу вам собрать бриф. Или можете скинуть готовый в этот чат — я его изучу и дам просчёт стоимости.\n\nКак вас зовут?",
    title: "Леммус",
    status: "ИИ-ассистент студии",
    placeholder: "Напишите сообщение…",
    attach: "Прикрепить бриф (PDF, DOCX, TXT)",
    send: "Отправить",
    close: "Закрыть",
    restart: "Начать заново",
    typing: "Леммус печатает",
    kpSteps: ["Изучаю средние цены на рынке…", "Считаю этапы и стоимость…", "Оформляю коммерческое предложение…"],
    kpReady: "Коммерческое предложение готово",
    kpOpen: "Открыть КП",
    kpTotal: "Стоимость",
    kpTerm: "Срок",
    fileTooBig: "Файл больше 4 МБ. Пришлите файл поменьше или вставьте текст брифа в сообщение.",
    fileFail: "Не получилось прочитать файл. Пришлите PDF, DOCX или TXT — или вставьте текст брифа в сообщение.",
    fileIntro: (name) => `Вот мой готовый бриф из файла «${name}»:`,
    failText: "Ассистент сейчас недоступен. Напишите нам в Telegram или оставьте заявку в форме — ответим в течение дня.",
    failTg: "Написать в Telegram",
    failForm: "Заполнить форму",
    rate: "Слишком много сообщений подряд. Подождите пару минут и попробуйте снова.",
    footer: ["Отвечает ИИ, он может ошибаться ·", "конфиденциальность"],
  },
  en: {
    greeting:
      "Hi, I'm Lemmus! I'll help you put together a project brief. Or drop a ready-made brief into this chat — I'll study it and give you a cost estimate.\n\nWhat's your name?",
    title: "Lemmus",
    status: "Studio AI assistant",
    placeholder: "Type a message…",
    attach: "Attach a brief (PDF, DOCX, TXT)",
    send: "Send",
    close: "Close",
    restart: "Start over",
    typing: "Lemmus is typing",
    kpSteps: ["Researching average market prices…", "Estimating stages and cost…", "Putting the proposal together…"],
    kpReady: "Your commercial proposal is ready",
    kpOpen: "Open proposal",
    kpTotal: "Cost",
    kpTerm: "Timeline",
    fileTooBig: "The file is over 4 MB. Send a smaller file or paste the brief text into a message.",
    fileFail: "Couldn't read the file. Send a PDF, DOCX or TXT — or paste the brief text into a message.",
    fileIntro: (name) => `Here's my ready-made brief from "${name}":`,
    failText: "The assistant is unavailable right now. Message us on Telegram or use the form — we reply within a day.",
    failTg: "Message on Telegram",
    failForm: "Use the form",
    rate: "Too many messages in a row. Please wait a couple of minutes and try again.",
    footer: ["Answers are AI-generated and may contain mistakes ·", "privacy"],
  },
  tj: {
    greeting:
      "Салом, ман Леммус! Ба шумо дар тартиб додани бриф кӯмак мекунам. Ё брифи тайёрро ба ин чат фиристед — ман онро меомӯзам ва нархро ҳисоб мекунам.\n\nНоми шумо чист?",
    title: "Леммус",
    status: "Ёрдамчии ИИ-и студия",
    placeholder: "Паём нависед…",
    attach: "Брифро замима кунед (PDF, DOCX, TXT)",
    send: "Фиристодан",
    close: "Пӯшидан",
    restart: "Аз нав сар кардан",
    typing: "Леммус менависад",
    kpSteps: ["Нархҳои миёнаи бозорро меомӯзам…", "Марҳилаҳо ва нархро ҳисоб мекунам…", "Пешниҳоди тиҷоратиро омода мекунам…"],
    kpReady: "Пешниҳоди тиҷоратӣ тайёр аст",
    kpOpen: "Кушодани пешниҳод",
    kpTotal: "Нарх",
    kpTerm: "Мӯҳлат",
    fileTooBig: "Файл аз 4 МБ калон аст. Файли хурдтар фиристед ё матни брифро ба паём гузоред.",
    fileFail: "Файлро хондан нашуд. PDF, DOCX ё TXT фиристед — ё матни брифро ба паём гузоред.",
    fileIntro: (name) => `Ин брифи тайёри ман аз файли «${name}»:`,
    failText: "Ёрдамчӣ ҳоло дастрас нест. Ба мо дар Telegram нависед ё формаро пур кунед — дар давоми як рӯз ҷавоб медиҳем.",
    failTg: "Навиштан дар Telegram",
    failForm: "Пур кардани форма",
    rate: "Паёмҳо аз ҳад зиёданд. Якчанд дақиқа сабр кунед ва боз кӯшиш кунед.",
    footer: ["Ҷавобҳоро ИИ медиҳад, хато шуданаш мумкин ·", "махфият"],
  },
};

/** Цель в Яндекс Метрике; ошибка счётчика не должна ломать чат. */
const goal = (name: string) => {
  try {
    const ym = (window as { ym?: unknown }).ym;
    if (STUDIO_METRIKA_ID && typeof ym === "function") ym(STUDIO_METRIKA_ID, "reachGoal", name);
  } catch {
    /* счётчик недоступен */
  }
};

const readAdSource = () => {
  try {
    const src = JSON.parse(sessionStorage.getItem(AD_SOURCE_KEY) || "null") as Record<string, string> | null;
    if (!src) return "";
    return Object.entries(src)
      .map(([k, v]) => `${k.replace("utm_", "")}=${v}`)
      .join(" · ");
  } catch {
    return "";
  }
};

async function post<T>(path: string, body: unknown, timeoutMs: number): Promise<{ status: number; data: T | null }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${STUDIO_BRIEF_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    return { status: res.status, data: (await res.json().catch(() => null)) as T | null };
  } catch {
    return { status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function BriefChat() {
  const { locale } = useStudioLocale();
  const u = UI[locale];
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<false | "chat" | "file" | "kp">(false);
  const [kpStep, setKpStep] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const restored = useRef(false);

  // Переписка переживает переходы по страницам и перезагрузку, пока открыта вкладка.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null") as { messages?: Msg[] } | null;
      if (saved?.messages?.length) setMessages(saved.messages);
    } catch {
      /* без сохранения — начнём с приветствия */
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ messages }));
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [messages]);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      goal("brief_open");
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Пока окно открыто, страница под ним не прокручивается (плавная прокрутка тоже смотрит на overflow).
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, busy, kpStep, open, reduce]);

  useEffect(() => {
    if (busy !== "kp") return;
    setKpStep(0);
    const id = setInterval(() => setKpStep((s) => Math.min(s + 1, u.kpSteps.length - 1)), 14000);
    return () => clearInterval(id);
  }, [busy, u.kpSteps.length]);

  const failMessage = useCallback(
    (status: number): Msg => ({ role: "assistant", kind: "error", content: status === 429 ? u.rate : u.failText }),
    [u],
  );

  const makeKp = useCallback(
    async (brief: Brief) => {
      setBusy("kp");
      const { status, data } = await post<{ ok?: boolean } & Kp>(
        "/kp",
        { brief, lang: locale, page: window.location.href, source: readAdSource() },
        240000,
      );
      if (data?.ok && data.url) {
        const kp: Kp = { url: data.url, title: data.title, total: data.total, duration: data.duration };
        setMessages((m) => [...m, { role: "assistant", kind: "kp", content: u.kpReady, kp }]);
        goal("brief_kp");
      } else {
        setMessages((m) => [...m, failMessage(status)]);
      }
      setBusy(false);
    },
    [locale, u, failMessage],
  );

  const ask = useCallback(
    async (next: Msg[]) => {
      setMessages(next);
      setBusy("chat");
      const history = [{ role: "assistant" as const, content: u.greeting }, ...next]
        .filter((m) => !("kind" in m) || (m.kind !== "error" && m.kind !== "kp"))
        .map((m) => ({ role: m.role, content: m.content }));
      const { status, data } = await post<{ ok?: boolean; reply?: string; brief?: Brief | null }>(
        "",
        { messages: history, lang: locale, page: window.location.href },
        90000,
      );
      if (data?.ok && typeof data.reply === "string") {
        const reply = data.reply;
        if (reply) setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (data.brief) return makeKp(data.brief);
      } else {
        setMessages((m) => [...m, failMessage(status)]);
      }
      setBusy(false);
    },
    [locale, makeKp, u, failMessage],
  );

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    void ask([...messages, { role: "user", content: text }]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const onFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file || busy) return;
    if (file.size > MAX_FILE) {
      setMessages((m) => [...m, { role: "assistant", kind: "error", content: u.fileTooBig }]);
      return;
    }
    setBusy("file");
    let text = "";
    try {
      const { data } = await post<{ ok?: boolean; text?: string }>("/file", { name: file.name, data: await fileToBase64(file) }, 60000);
      text = data?.ok ? data.text || "" : "";
    } catch {
      text = "";
    }
    setBusy(false);
    if (!text) {
      setMessages((m) => [...m, { role: "assistant", kind: "error", content: u.fileFail }]);
      return;
    }
    void ask([...messages, { role: "user", kind: "file", content: `${u.fileIntro(file.name)}\n\n${text}`, display: file.name }]);
  };

  const restart = () => {
    if (busy) return;
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const toForm = () => {
    setOpen(false);
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const shown: Msg[] = [{ role: "assistant", content: u.greeting }, ...messages];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="brief"
          className="fixed inset-0 z-[90] flex items-end justify-end md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label={u.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${u.title} — ${u.status}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#121211] text-[var(--st-text)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] md:h-[min(760px,calc(100dvh-48px))] md:w-[460px] md:rounded-[22px] md:border md:border-[var(--st-line)]"
          >
            {/* Шапка */}
            <div className="flex items-center gap-3 border-b border-[var(--st-line)] px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] md:px-5 md:pt-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--st-accent)] text-[var(--st-bg)]">
                <LemmusMark className="h-[18px] w-auto" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-semibold leading-tight">{u.title}</div>
                <div className="flex items-center gap-1.5 text-[16px] leading-tight text-[var(--st-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--st-accent)]" aria-hidden />
                  {u.status}
                </div>
              </div>
              <button
                type="button"
                onClick={restart}
                disabled={!!busy || messages.length === 0}
                title={u.restart}
                aria-label={u.restart}
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--st-muted)] transition-colors hover:bg-white/5 hover:text-[var(--st-text)] disabled:opacity-30"
              >
                <RotateCcw className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={u.close}
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--st-muted)] transition-colors hover:bg-white/5 hover:text-[var(--st-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Переписка */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5 md:px-5" aria-live="polite">
              {shown.map((m, i) => (
                <Bubble key={i} m={m} u={u} onForm={toForm} />
              ))}
              {busy === "chat" || busy === "file" ? <Typing label={u.typing} /> : null}
              {busy === "kp" ? (
                <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-[var(--st-accent-35)] bg-[var(--st-accent-03)] px-4 py-3 text-[16px]">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--st-accent)] border-t-transparent" aria-hidden />
                  {u.kpSteps[kpStep]}
                </div>
              ) : null}
            </div>

            {/* Ввод */}
            <div className="border-t border-[var(--st-line)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-3 md:px-4">
              <div className="flex items-end gap-2 rounded-[18px] border border-[var(--st-line)] bg-[#1a1a18] p-1.5 focus-within:border-[var(--st-accent-35)]">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.rtf"
                  className="hidden"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={!!busy}
                  title={u.attach}
                  aria-label={u.attach}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--st-muted)] transition-colors hover:text-[var(--st-accent)] disabled:opacity-40"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={u.placeholder}
                  aria-label={u.placeholder}
                  className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-[16px] leading-6 text-[var(--st-text)] outline-none placeholder:text-[var(--st-muted)]"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!!busy || !input.trim()}
                  aria-label={u.send}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--st-accent)] text-[var(--st-bg)] transition-opacity disabled:opacity-35"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[16px] leading-snug text-[var(--st-muted)]">
                {u.footer[0]}{" "}
                <a href={STUDIO_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--st-text)]">
                  {u.footer[1]}
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Bubble({ m, u, onForm }: { m: Msg; u: BriefUi; onForm: () => void }) {
  if (m.kind === "kp" && m.kp) {
    return (
      <div className="rounded-2xl rounded-bl-md border border-[var(--st-accent-35)] bg-[var(--st-accent-03)] p-4">
        <div className="flex items-center gap-2 text-[16px] font-semibold text-[var(--st-accent)]">
          <FileText className="h-5 w-5" /> {u.kpReady}
        </div>
        {m.kp.title ? <div className="mt-2 text-[18px] font-semibold leading-snug">{m.kp.title}</div> : null}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[16px]">
          <dt className="text-[var(--st-muted)]">{u.kpTotal}</dt>
          <dd className="font-semibold">{m.kp.total}</dd>
          {m.kp.duration ? (
            <>
              <dt className="text-[var(--st-muted)]">{u.kpTerm}</dt>
              <dd>{m.kp.duration}</dd>
            </>
          ) : null}
        </dl>
        <a
          href={m.kp.url}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-[var(--st-accent)] px-5 text-[16px] font-semibold text-[var(--st-bg)] transition-transform hover:-translate-y-0.5"
        >
          {u.kpOpen}
        </a>
      </div>
    );
  }
  if (m.kind === "error") {
    return (
      <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[var(--st-line)] bg-[#1d1d1b] px-4 py-3 text-[16px] leading-relaxed">
        <p>{m.content}</p>
        {m.content === u.failText ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={STUDIO_CONTACT_TG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full bg-[var(--st-accent)] px-4 font-semibold text-[var(--st-bg)]"
            >
              {u.failTg}
            </a>
            <button type="button" onClick={onForm} className="inline-flex h-10 items-center rounded-full border border-[var(--st-line)] px-4 hover:border-[var(--st-accent)]">
              {u.failForm}
            </button>
          </div>
        ) : null}
      </div>
    );
  }
  const mine = m.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[16px] leading-relaxed",
          mine ? "rounded-br-md bg-[var(--st-accent)] text-[var(--st-bg)]" : "rounded-bl-md bg-[#1d1d1b]",
        )}
      >
        {m.kind === "file" ? (
          <span className="inline-flex items-center gap-2 font-medium">
            <FileText className="h-5 w-5 shrink-0" />
            {m.display}
          </span>
        ) : (
          m.display ?? m.content
        )}
      </div>
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex" role="status" aria-label={label}>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#1d1d1b] px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-[var(--st-muted)]"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
          />
        ))}
      </div>
    </div>
  );
}
