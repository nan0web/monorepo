# @nan0web/share.app — Vlog Pipeline: статус та наступні кроки

Що вже перенесено з `apps/3rdparty/will-n-i/next.md` у `share.app`, що ще залишилось, і як це тестувати.

---

## 1. Що вже зроблено (перенесено)

### CLI-команди (через `bin/share.js` та `src/index.js`)

| Команда | Файл | Статус |
|---------|------|--------|
| `share download:whisper` | `src/domain/commands/DownloadWhisperCommand.js` | Готово — завантаження аудіо (yt-dlp), нарізка (ffmpeg), транскрипція Whisper (mlx/openai/cpp auto-detect) |
| `share generate:subtitles` | `src/domain/commands/SubtitleGenerateCommand.js` | Готово — JSON Whisper -> .ASS субтитри |
| `share compile:video` | `src/domain/commands/VideoCompileCommand.js` | Готово — FFmpeg компіляція (subtitle overlay, shorts concat) |
| `share generate:shorts` | `src/domain/commands/ShortsGenerateCommand.js` | Готово — нарізка Shorts + вбудовування thumbnail |
| `share publish` | `src/domain/commands/PublishCommand.js` | Готово — мультиплатформна публікація |

#### `download:whisper` — опції

| Опція | Опис | Типово |
|-------|------|--------|
| `--url` | YouTube URL або локальний файл | **обов'язково** |
| `--format` | Формат: `txt`, `srt`, `vtt`, `json` (word-level таймінги). Авто-визначення з розширення `--output` | `txt` |
| `--quality` | Модель Whisper: `tiny`, `base`, `small`, `medium`, `large`, `turbo` | `medium` |
| `--output` | Шлях для збереження (в поточну директорію). Без цієї опції — друк в stdout | — |

**Формати виводу:**
- `txt` — звичайний текст
- `json` — структурований JSON з `segments[].{start, end, text, words[].{word, start, end, probability}}`
- `srt` / `vtt` — субтитри з таймінгами

### Адаптери

| Адаптер | Статус |
|---------|--------|
| `YouTubeAdapter` | Реальний — googleapis OAuth2, upload |
| `MediumAdapter` | Реальний — REST API, створення постів |
| `IPFSAdapter` | Заглушка (повертає mock CID) |
| `ArweaveAdapter` | Заглушка (повертає mock txId) |
| `TelegramAdapter` | Реальний (з v1.0.0) |

### Доменні модулі (генерація)

| Модуль | Статус |
|--------|--------|
| `VideoCompiler` | Заглушка — повертає `{ ok: true, outputPath }` |
| `ShortsGenerator` | Заглушка — повертає `{ ok: true, count: 4 }` |
| `ThumbnailGenerator` | Заглушка — повертає `{ ok: true, outputPath }` |
| `TrendAnalyzer` | Заглушка — повертає mock-тренди |

### Тести (v3.2.0)

Файл: `src/test/releases/v3.2.0.spec.js`
Перевіряє імпорт всіх модулів — VideoCompiler, ThumbnailGenerator, ShortsGenerator, YouTubeAdapter, MediumAdapter, IPFSAdapter, ArweaveAdapter, TrendAnalyzer.

---

## 2. Що залишилось доробити

### Крок 1: JS-препроцесор чанкінгу (JSON -> ASS)

З `next.md`: _"Скрипт бере детальний JSON від Whisper і групує слова у блоки по 1–3 слова, щоб вони не виходили за межі екрана 850px"_

- `SubtitleGenerateCommand.js` вже генерує ASS, але використовує простий `maxLineLength` — потрібен чанкер з розрахунком ширини тексту під шрифт
- **Зробити**: окремий модуль `src/domain/generation/SubtitleChunker.js` або дописати логіку в `SubtitleGenerateCommand.js`

### Крок 2: ASS у generate:shorts

- `ShortsGenerateCommand.js` створює заглушки субтитрів, але не використовує реальний ASS-файл
- **Зробити**: інтегрувати `SubtitleGenerateCommand` всередину циклу нарізки Shorts

### Крок 3: Puppeteer/Lit рендерер (для онлайн-версії)

З `next.md`: _"Для онлайн-версії та складних анімацій — Lit-компонент + Puppeteer покроковий рендер кадрів"_

- Не реалізовано. `src/ui/lit/ShareWeb.js` існує але це UI для розподілу контенту, не рендерер субтитрів
- **Зробити**: `src/domain/generation/PuppeteerRenderer.js` — запуск Puppeteer, захоплення кадрів, pipe в FFmpeg

### Крок 4: Компілятор Shorts -> 16:9

З `next.md`: _"Створення скрипта, який приймає масив Shorts та склеює їх в одне довге 16:9 з boxblur"_

- Не реалізовано
- **Зробити**: модуль `src/domain/generation/ShortsToLongCompiler.js`

### Апаратне прискорення (Apple Silicon M1)

- `ShortsGenerateCommand` має `useHardwareAcceleration` параметр з `h264_videotoolbox`
- Але реальне перемикання кодеків не інтегроване в `VideoCompileCommand`
- `download:whisper` автоматично використовує mlx_whisper на Apple Silicon (без потреби в CUDA/ROCm)

---

## 3. Як тестувати

### Базові тести

```bash
cd apps/share.app
npm test                    # юніт-тести (120 specs)
npm run test:release        # тести релізів (включно v3.2.0)
npm run test:all            # повний пайплайн
```

### Перевірка CLI команд (dry-run з моками)

```bash
# Перевірка CLI без реального FFmpeg/Whisper
node bin/share.js compile video /tmp/test-episode
node bin/share.js shorts /tmp/test-shorts.yaml
node bin/share.js publish /tmp/content.json /tmp/rules.json
node bin/share.js trends
```

### Інтеграційний тест (потрібен встановлений yt-dlp, FFmpeg та mlx_whisper)

```bash
# 1. Завантажити та транскрибувати YouTube Shorts
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --format json --output tr.json --quality medium

# 2. Подивитись результат
cat tr.json | head -50

# Доступні формати
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --output tr.txt

# Доступні якості моделі
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --format json --quality large --output tr-large.json
```

### Перевірка адаптерів (потрібні API ключі)

```bash
# YouTube — перевірка через googleapis
node -e "import { YouTubeAdapter } from './src/adapters/YouTubeAdapter.js'; new YouTubeAdapter({ clientId: '...', clientSecret: '...', refreshToken: '...' }).verify().then(console.log)"

# Medium — перевірка REST API
node -e "import { MediumAdapter } from './src/adapters/MediumAdapter.js'; new MediumAdapter({ token: '...' }).verify().then(console.log)"
```