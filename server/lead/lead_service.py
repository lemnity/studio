#!/usr/bin/env python3
"""
Приёмник заявок с формы «Обсудим проект» (lemnity.digital) — пересылает их в группу Telegram.

Сайт статический, поэтому токен бота нельзя держать в браузере: форма отправляет заявку сюда,
сервис проверяет её и шлёт сообщение через Bot API. Только стандартная библиотека Python.

Слушает 127.0.0.1:8787, наружу выходит через nginx: location /api/lead (см. nginx-lead.conf).
Настройки — переменные окружения из /etc/lemnity-lead.env (см. lemnity-lead.service):
  TELEGRAM_BOT_TOKEN  токен бота от @BotFather
  TELEGRAM_CHAT_ID    id группы (отрицательное число, у супергрупп начинается с -100)
  ALLOWED_ORIGINS     через запятую; по умолчанию lemnity.digital, www и GitHub Pages
Без токена и id группы сервис отвечает 503, а форма предлагает написать в Telegram или на почту.
"""

import html
import json
import os
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = int(os.environ.get("LEAD_PORT", "8787"))
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
ALLOWED_ORIGINS = {
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://lemnity.digital,https://www.lemnity.digital,https://lemnity.github.io",
    ).split(",")
    if o.strip()
}

MAX_BODY = 16 * 1024
LIMITS = {"name": 120, "contact": 160, "topic": 80, "message": 4000, "lang": 8, "page": 300}
# Не больше 5 заявок с одного адреса за 10 минут.
RATE_WINDOW = 600
RATE_MAX = 5
_hits: dict[str, deque] = defaultdict(deque)

LANG_FLAG = {"ru": "🇷🇺 RU", "en": "🇬🇧 EN", "tj": "🇹🇯 TJ"}


def rate_limited(ip: str) -> bool:
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_MAX:
        return True
    q.append(now)
    return False


def format_lead(lead: dict) -> str:
    e = lambda key: html.escape(lead.get(key, ""))
    lang = LANG_FLAG.get(lead.get("lang", ""), e("lang") or "—")
    lines = [
        "<b>🔔 Новая заявка с сайта</b>",
        "",
        f"<b>Имя:</b> {e('name')}",
        f"<b>Контакт:</b> {e('contact')}",
        f"<b>Что нужно:</b> {e('topic')}",
        f"<b>Язык:</b> {lang}",
        "",
        e("message"),
    ]
    if lead.get("page"):
        lines += ["", f"<i>{e('page')}</i>"]
    return "\n".join(lines)


def send_to_telegram(text: str) -> bool:
    body = json.dumps(
        {"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
    ).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.load(resp).get("ok") is True
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        print(f"telegram error: {exc}", flush=True)
        return False


class Handler(BaseHTTPRequestHandler):
    server_version = "lemnity-lead"

    def log_message(self, fmt, *args):  # без IP и тела заявки в журнале
        print(f"{self.command} {self.path} -> {args[1] if len(args) > 1 else ''}", flush=True)

    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "86400")

    def _reply(self, status: int, payload: dict):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path.rstrip("/") != "/api/lead":
            return self._reply(404, {"ok": False, "error": "not_found"})
        origin = self.headers.get("Origin", "")
        if origin and origin not in ALLOWED_ORIGINS:
            return self._reply(403, {"ok": False, "error": "origin"})
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            return self._reply(413, {"ok": False, "error": "size"})
        try:
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError
        except ValueError:
            return self._reply(400, {"ok": False, "error": "json"})

        # Ловушка для ботов: скрытое поле, человек его не видит и не заполняет. Боту отвечаем «ок».
        if str(data.get("website", "")).strip():
            return self._reply(200, {"ok": True})

        lead = {k: str(data.get(k, "")).strip()[:n] for k, n in LIMITS.items()}
        if not lead["name"] or not lead["contact"] or len(lead["message"]) < 10:
            return self._reply(422, {"ok": False, "error": "invalid"})

        ip = self.headers.get("X-Real-IP") or self.client_address[0]
        if rate_limited(ip):
            return self._reply(429, {"ok": False, "error": "rate"})
        if not TOKEN or not CHAT_ID:
            return self._reply(503, {"ok": False, "error": "not_configured"})
        if not send_to_telegram(format_lead(lead)):
            return self._reply(502, {"ok": False, "error": "telegram"})
        return self._reply(200, {"ok": True})

    def do_GET(self):
        if self.path.rstrip("/") == "/api/lead/health":
            return self._reply(200, {"ok": True, "configured": bool(TOKEN and CHAT_ID)})
        return self._reply(404, {"ok": False, "error": "not_found"})


if __name__ == "__main__":
    print(f"lead service on {HOST}:{PORT}, configured={bool(TOKEN and CHAT_ID)}", flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
