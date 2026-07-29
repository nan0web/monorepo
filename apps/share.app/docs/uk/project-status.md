# Status проєкту share.app (Vlog Pipeline + SMM)

> Оновлено: 2026-07-08

---

## 1. Що реалізовано

### Vlog Pipeline (media processing)

| Команда | Опис | Статус |
|---------|------|--------|
| `download:whisper` | yt-dlp + ffmpeg chunks + WhisperEngine (mlx/openai/cpp auto-detect). Формати: txt, srt, vtt, json. Якості: tiny…turbo | **Робоча** |
| `generate:subtitles` | Whisper JSON -> .ASS субтитри (karaoke, BorderStyle=4) | **Робоча** |
| `compile:video` | FFmpeg компіляція (subtitle overlay, audio->video, shorts concat) | **Робоча** |
| `generate:shorts` | Нарізка відео на сегменти за YAML-конфігом + ASS субтитри + thumbnail overlay | **Робоча** |

**Перевірено:** `generate:shorts` успішно нарізав 36s YouTube Shorts на 3 сегменти (12s кожен) з h264_videotoolbox.

### Rules Engine (дистрибуція контенту)

| Компонент | Опис | Статус |
|-----------|------|--------|
| `evaluateRules()` | Матчинг контенту до правил за tags/type/lang/media | **Робочий** |
| `parseDelay()` | Парсинг '30m', '2h', '1d 09:00', 'Mon 10:00' | **Робочий** |
| `executeTasks()` | Виконання immediate + delayed задач, verify() gate | **Робочий** |
| `SocialAdapter` | Base protocol: publish, update, delete, reply, syncFeedback | **Робочий** |
| `PublishCommand` | CLI `share publish` | **Mock** — тільки заглушка |

### Адаптери

| Адаптер | Платформа | Статус |
|---------|-----------|--------|
| `TelegramAdapter` | Telegram Bot API | **Реальний** — publish, update, delete, reply, syncFeedback |
| `YouTubeAdapter` | YouTube Data API v3 | **Реальний** — OAuth2, upload |
| `MediumAdapter` | Medium REST API | **Реальний** — створення постів |
| `DummyAdapter` | In-memory (тестовий) | **Тестовий** |
| `IPFSAdapter` | IPFS (permanent storage) | **Заглушка** |
| `ArweaveAdapter` | Arweave (permanent storage) | **Заглушка** |

### Зворотний зв'язок (Feedback Loop)

| Компонент | Опис | Статус |
|-----------|------|--------|
| `FeedbackReader` | Async generator, polling через adapter.syncFeedback() | **Робочий** |
| `reply()` | Нативні відповіді на коментарі | **Робочий** (Telegram, Dummy) |
| `SocialAdapterFeedback` | Модель: author, text, type, network, createdAt | **Робочий** |

### E-commerce

| Компонент | Опис | Статус |
|-----------|------|--------|
| `ShopAdapter` | Base: getProducts, getSalesStats, updateProductState | **Абстрактний** |
| `ActivateDraftsOperation` | Bulk-операція активації чернеток | **Робочий** (як приклад) |

### Research

| Компонент | Опис | Статус |
|-----------|------|--------|
| `TrendAnalyzer` | Google Trends + YouTube Trends + RSS digest | **Заглушка** — повертає mock |

---

## 2. Плани (не реалізовано)

### SEO / Metadata

- [ ] Open Graph (og:title, og:image, og:description)
- [ ] Twitter Cards
- [ ] Schema.org structured data (Article, VideoObject, Product)
- [ ] Keyword research та рекомендації
- [ ] Description/title optimization під платформу
- [ ] HTML meta tags

### GEO (Generative Engine Optimization)

- [ ] Структуровані дані для AI-асистентів (ChatGPT, Perplexity, Gemini, Claude)
- [ ] FAQ-схеми для генеративних відповідей
- [ ] Контекстні підказки (embeddings, RAG-ready контент)
- [ ] Оптимізація під AI-пошук замість традиційного SEO

### SMM Advanced

- [ ] Content calendar / scheduling UI
- [ ] Аналітика (перегляди, залученість, демографія)
- [ ] A/B тестування контенту
- [ ] Hashtag recommendation engine
- [ ] Авто-відповіді / модерація коментарів
- [ ] Крос-платформенний календар публікацій

### Адаптери

- [ ] X/Twitter API
- [ ] LinkedIn API
- [ ] Facebook / Instagram Graph API
- [ ] TikTok API
- [ ] Pinterest API

### Pipeline (не завершено)

- [ ] `ShortsToLongCompiler` — склеювання Shorts у 16:9 з boxblur (заглушка)
- [ ] `SubtitleChunker` — розрахунок ширини тексту під шрифт (зараз maxLineLength)
- [ ] Puppeteer/Lit renderer — складні анімації, CSS-переходи
- [ ] `PublishCommand` — реальна інтеграція з адаптерами (зараз mock)
- [ ] HW acceleration — `h264_videotoolbox` флаг є, але не скрізь інтегрований

### Інше

- [ ] Контейнеризація (Dockerfile для Whisper + FFmpeg)
- [ ] Web UI для керування pipeline
- [ ] API endpoint для віддаленого запуску
- [ ] Моніторинг / логи виконання

---

## 3. Відомі технічні деталі

- **WhisperEngine** — три бекенди (mlx_whisper на Apple Silicon, openai-whisper CPU/GPU, whisper-cli whisper.cpp). Авто-детект через `which`.
- **db.saveFile** — використовує префікс `@app/` щоб писати в cwd, а не в `data/`
- **5-хвилинні чанки** — AudioSplitter ріже на 300s. Для коротких відео (Short < 1хв) це зайве — один чанк.
- **Mounts** — bootstrapApp монтує `'' → data/`, `@app → cwd`, `~ → ~/.share.app`, `@system → ~/.nan0web`