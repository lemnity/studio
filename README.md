# Лемнити Студия

Сайт студии разработки Lemnity: услуги, проекты, галерея работ, клиенты, FAQ и форма заявки.
Одностраничный лендинг на Next.js 15 (App Router), React 19, Tailwind CSS и framer-motion.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3100
npm run build && npm start
```

Адрес сайта для canonical, sitemap и Open Graph задаётся переменной `NEXT_PUBLIC_SITE_URL`
(по умолчанию `https://studio.lemnity.ru`, см. `.env.example`).

## Где что лежит

| Путь | Что там |
|---|---|
| `app/page.tsx` | метаданные, JSON-LD (ProfessionalService + FAQPage), загрузочный скрипт заставки |
| `components/studio/studio-page.tsx` | вся страница: шапка, первый экран, проекты, галерея, клиенты, услуги, о студии, FAQ, контакты, подвал |
| `components/studio/studio-content.ts` | тексты, проекты, работы, клиенты, контакты, адреса |
| `components/studio/studio-effects.tsx` | курсор, магнитные кнопки, «набухающие» буквы, появление при прокрутке |
| `components/studio/studio-wow.tsx` | заставка, плавная прокрутка, заголовки по строкам, бегущая строка, ячейки логотипов, обводка от руки, знак в подвале |
| `components/studio/studio-hero-3d.tsx` | 3D-логотип на WebGL в первом экране |
| `components/lemnity-wordmark.tsx` | векторный знак Lemnity (пути букв) |
| `public/studio/` | картинки проектов и работ, логотипы клиентов, шрифт Gilroy |

## Заметки

- Заставка показывается раз в сутки (метка в `localStorage`, ключ `lmnt-studio-intro`).
  Посмотреть её ещё раз — открыть адрес с `?intro`.
- Форма заявки открывает почтовый клиент (`mailto:` на адрес из `studio-content.ts`), своего бэкенда нет.
- Ссылки «Платформа» и «Конфиденциальность» ведут на lemnity.ru.
- Все анимации гаснут при `prefers-reduced-motion`.
