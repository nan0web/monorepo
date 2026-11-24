# share.app (visnyk) — Roadmap & Next Steps

> **Вісник (visnyk / share.app) — Sovereign Media Hub & Communications (v3.4.0+)**
> 
> Автономний медіа-хаб та режисерський конвеєр: автоматизація створення контенту, OBS Director's Cut (`Camera <Scene> | Start`, `Camera Stop`), авто-монтаж, Whisper/субтитри, публікація в соцмережі та зворотний зв'язок (коментарі).
> 
> Частина системної тріади:
> - **`dilo`** (`release.app`): Project Management as Code
> - **`mova`** (`mova.app`): Text & Audio Transformation Core (Namir, Truth, Whisper, TTS)
> - **`visnyk`** (`share.app`): Media Hub & Communications (Director's Cut, Editing, Multi-Publishing, Feedback Loop)
> 
> Оновлено: 2026-10-31

---

## 🎯 Цільова аудиторія (Target Audience)

Додаток створюється як універсальний **Production-Ready** інструмент для професіоналів, які працюють з великими обсягами медіа-контенту:

1.- **Блогери, YouTubers та Тіктокери (Content Creators):**

   * **Потреба:** Щоденна робота з сотнями гігабайтів 4K/RAW футажів, автоматична нарізка Shorts/Reels, швидке звільнення місця на робочих SSD та авто-бекап на архівні HDD.

1.- **Відеооператори, фотографи та медіа-студії:**

   * **Потреба:** Менеджмент 10+ зовнішніх накопичувачів, каталогізація матеріалів, пошук та перегляд вмісту від'єднаних дисків (офлайн-індекс), безпечна дубльована синхронізація зйомок.

1.- **Подкастери та звукорежисери:**

   * **Потреба:** Автоматична транскрипція аудіо (Whisper), зведення, архівування проектів та синхронізація бекапів на зовнішні сховища.

1.- **Технічні ентузіасти та колекціонери медіа-архівів:**

   * **Потреба:** Видалення дедуплікованих файлів, дзеркалювання дисків, автономне суверенне зберігання без залежності від хмарних підписок.

---

## 📊 Поточний стан (Current Features)

### 1. Media Processing & Content Pipeline
| Команда / Опис | Статус |
|----------------|--------|
| `pipeline:video` — повний цикл: Whisper MLX + аналіз пауз + нарізка епізодів 16:9 + субтитри (.srt/.vtt) + статті + Master Longread + пакети для YouTube/Telegram/Threads + Інспектор цілісності | **Робоча (v3.2.0)** |
| `drive:batch-transcribe` — пакетна обробка дисків: `ffprobe` перевірка стрімів субтитрів + транскрипція + Soft Subtitles Stream Copy muxing + Safe Atomic Swap + ієрархічний кеш | **Робоча (v3.3.0)** |
| `download:whisper` — yt-dlp + ffmpeg chunks + WhisperEngine (mlx/openai/cpp auto-detect). Формати: txt, srt, vtt, json | **Робоча** |
| `generate:subtitles` — Whisper JSON -> .ASS субтитри (karaoke, BorderStyle=4) | **Робоча** |
| `compile:video` — FFmpeg компіляція (subtitle overlay, audio->video, shorts concat) | **Робоча** |
| `generate:shorts` — авто-сегментація з транскрипту або за YAML-конфігом + ASS субтитри + HW accel | **Робоча** |
| `generate:script` — AI-генерація сценаріїв зі стилями (storytelling, educational, hook...) | **Робоча** |

### 2. Social Publishing & Rules Engine
| Команда / Опис | Статус |
|----------------|--------|
| `publish` — публікація на реальні платформи (YouTube, Telegram, Medium) | **Робоча** |
| `evaluateRules()` / `parseDelay()` / `executeTasks()` — правила та затримки публікацій | **Робочий** |

### 3. Drive, Offline Catalog & Caching
| Компонент / Опис | Статус |
|------------------|--------|
| `TranscriptCacheService` — ієрархічне дзеркалювання шляхів у `~/.nan0web/share.app/transcripts/` (Zero-VFS degradation) | **Робоча (v3.3.0)** |
| `MediaInspectorService` — `ffprobe` інспекція вбудованих soft-субтитрів та стрімів | **Робоча (v3.3.0)** |
| `SubtitleMuxerPort` — Stream Copy муксинг субтитрів у MOV/MP4/MKV та Safe Atomic Swap без подвоєння місця | **Робоча (v3.3.0)** |
| `HFEmbeddingService` — векторизація тексту через Hugging Face Spaces для `pgvector` / Payload CMS | **Робоча (v3.3.0)** |
| `drive:index` / `drive:dedup` — базове індексування дисків та пошук дублікатів файлів | **Робоча** |
| **Глобальний індекс дисків (Офлайн)** — каталог вмісту від'єднаних дисків | ❌ **Відсутній** (наступний крок) |
| **GUI / CLI конструктор правил накопичувачів** — налаштування авто-копіювання та бекапів | ❌ **Відсутній** |
| **Background Daemon & Status Bar App** — трей-індикатор, фоновий авто-бекап при підключенні | ❌ **Відсутній** |

---

## 🚀 Дорожня карта до Production-Ready v1.0 (Roadmap)

Щоб зробити додаток повноцінним **Production-Ready v1.0** продуктом для інших користувачів, необхідно реалізувати такі ключеві блоки:

### 1. 💽 Drive & Backup Manager (Каталог та індексація накопичувачів)
- [ ] **Офлайн-індексування дисків:**




  - Збереження метаданих та індексу файлів (структура, розміри, хеші) у внутрішній БД (`Data Verse` / SQLite / JSONDB).
  - Можливість переглядати структуру та шукати файли на **від'єднаних жорстких дисках**.

- [ ] **Розширене виявлення дублікатів (Deduplication Engine):**




  - Видалення повторів однакових відео/аудіо матеріалів з можливістю підтвердження.
  - Порівняння файлів між різними дисками (наприклад, перевірка чи всі файли з робочого SSD є в бекапі на HDD).

- [ ] **Аналіз вільного місця & Smart Cleanup:**




  - Візуалізація зайнятого/вільного місця на всіх підключених накопичувачах.
  - Автоматичні пропозиції щодо очищення тимчасових файлів, кешу та дублікатів.

---

### 2. ⚙️ Visual & CLI Rules Manager (Конструктор правил)
- [ ] **Інтерфейс налаштування правил (Rule Configuration UI):**




  - Можливість задавати сценарії типу: *"При підключенні диска `HDD_Archive` ➔ автоматично збекапити нові 4K відео з теки `/Movies/2026`"*.
  - Правила ротації та дзеркалювання бекапів (*Keep last 3 versions*, *Sync on plug-in*).
  - Конфігурація розкладу та умов очищення застарілих даних.

---

### 3. 🔔 Background Daemon & Tray / Status Bar App (Фоновий режим)
- [ ] **Системний агент у фоні (Background Service / Daemon):**




  - Автоматичне виявлення підключення/відключення зовнішніх дисків (**Hot-Plug Auto-Mount Detector**).
  - Автоматичний фоновий запуск відповідних правил (синхронізація, індексація, бекап).

- [ ] **Статус-бар / Трей додаток (macOS Menu Bar / Windows System Tray / Linux):**




  - Іконка в панелі задач із відображенням поточного стану (Idle, Syncing, Errors).
  - Спливаючі сповіщення: *"Диск HDD_Archive підключено ➔ Бекап виконано успішно (додано 15 ГБ, 0 помилок)"*.
  - Швидке вікно дашборду з інформацією:
    - 🕒 **Час останнього оновлення та бекапу**.
    - 📋 **Активні правила синхронізації**.
    - 📊 **Прогрес фонового копіювання в реальному часі**.

---

### 4. 🌐 Web Dashboard & User Experience (UX 1.0)
- [ ] **Оновлений дашборд у Web UI (`play/server.js`):**




  - Вкладка **"Storage & Drives"**: список усіх дисків (активних та від'єднаних), індикатор вільного місця, кнопка "Scan Duplicates".
  - Вкладка **"Backup Rules"**: візуальний конструктор правил синхронізації.
  - Вкладка **"Media Pipeline"**: запуск транскрибування, Shorts та публікації.

- [ ] **Інсталятор та пакування (Standalone Distribution):**




  - Створення портативних білдів (Electron / NeutralinoJS / Tauri / Docker) для швидкої інсталяції звичайними користувачами.
  - Автозапуск разом із системою (Auto-start on boot).

---

## 🧪 Тестове покриття

```bash
node --test "src/**/*.spec.js" "play/server.spec.js"
# ~156 тестів, 0 fail (~6.5s)
```

| Файл | Тестів | Що покриває |
|------|--------|-------------|
| `Commands.spec.js` | 31 | ScriptGenerate, Publish, ShortsGenerate, SubtitleGenerate, VideoCompile |
| `DownloadWhisperCommand.spec.js` | 6 | alias, fields, _detectFormat, constructor, run |
| `YouTubeDownloader.spec.js` | 3 | _parseProgress |
| `AudioSplitter.spec.js` | 3 | split + progress |
| `ToolChecker.spec.js` | 5 | check/require |
| `MediaDownloadModel.spec.js` | 5 | constructor, run (ffmpeg залежний) |
| `Models.spec.js` | ~50 | Model, SocialAdapterContent, ResultIntent |
| `RulesEngine.spec.js` | ~30 | rules, delay, tasks |
| `SocialAdapter.spec.js` | ~15 | YouTube/Telegram/Medium/Dummy/IPFS/Arweave/TrendAnalyzer |
| `TelegramAdapter.spec.js` | ~10 | publish, update, delete, reply, feedback |
| **`server.spec.js`** | **15** | HTTP API, browse, SSE, ANSI stripping, CORS |

---

## 🛠️ Основні CLI команди «Вісника» (`visnyk`)

Всі команди викликаються через глобальний або локальний бінарник `visnyk` (або `share`):

```bash
# 1. Режисерський монтаж (Director's Cut) з OBS за голосовими маркерами (Camera <Scene> | Start, Camera Stop)
visnyk pipeline:video --url ~/Movies/obs_recording.mov --directorCut

# 2. Напрямкові сцени (Camera Left / Right / Center) та збереження візуальних пауз без мовлення (cutSilence: false):
visnyk pipeline:video --url ~/Movies/obs_recording.mov --directorCut --shorts

# 3. Кастомні координати кропу (WxH+X+Y, %, або вирівнювання ліво/право/центр):
visnyk pipeline:video --url ~/Movies/obs_recording.mov --directorCut --scenes "code=left,chat=right" --shorts

# 4. Обрізання пауз до меж голосу за бажанням:
visnyk pipeline:video --url ~/Movies/obs_recording.mov --directorCut --cutSilence true --paddingBefore 0.5 --paddingAfter 1.0

---

## 🎯 Стан розробки релізів (Recent Releases & Next Scope):

### ✅ Виконано в релізі v3.5.0:
1. **Зшивання смуги сцен в одне фінальне відео (Stitch / Concat Pipeline):**
   - Метод `VideoSlicerPort.buildStitchCommand` та `VideoSlicerPort.stitch(clips, options)` для об'єднання `scene_code_1` + `scene_chat_2` ... у спільне фінальне відео.
   - Плавний перехід між відеопотоками через FFmpeg фільтр `xfade` (`fade`, `wipeleft`, `slideleft`, `dissolve` з тривалістю 0.3–0.5 с).
   - Аудіокросфейд через `acrossfade` для плавного переходу звукових доріжок.
   - CLI опція `visnyk pipeline:video --stitch --transition fade --transitionDuration 0.5`.
   - Забезпечено сумісність піксельного формату з QuickTime Player (`-pix_fmt yuv420p`).
2. **Точне налаштування відступів кадрування (Crop Offset / Padding Bounding Box):**
   - Підтримка зсуву кадрування `align+offset` або `align-offset` (наприклад, `--scenes "code=left+100,chat=right-50,present=center+20"`).
   - Автоматичний розрахунок координат `cropX` у `VideoSlicerPort.buildCropFilter` та `ShortsGenerateCommand` з захистом від виходу за межі кадру (`clamp`).
   - Серіалізація поля `offsetX` у YAML `cut-map.yaml`.
3. **Швидкий тест кадрування (1-Frame Preview):**
   - Додано прапор `--previewFrame <seconds>` для миттєвого збереження одного кадру 9:16 без повного тривалого рендеру всього відео.

---

## 🎯 Наступна сесія (Next Session Scope — v3.6.0):
1. **Архітектурна гігієна домену та Zero-FS (Rule 8 & model-as-app.md):**
   - Усунення прямих імпортів `node:fs` та `node:path` у `WhisperTranscriptionService.js`, `PipelineAuditService.js`, `ArticlePipelineService.js` та інших доменних файлах.
   - Переведення читання/запису транскриптів, згенерованих публікацій та аудіту на інжектований `this.$db` / `@nan0web/db`.
2. **Автоматична інспекція за залежностями (Dependency-Driven Inspector Discovery):**
   - Налаштування автоматичного вибору та запуску інспекторів (i18n, domain, DB) на основі `package.json` залежностей.
   - Додавання суворої детекції імпорту `node:fs` у `JsDomainAuditor` (`@nan0web/inspect`).
3. **i18n & Model-as-Schema UI Parity:**
   - Перенесення всіх повідомлень конвеєра у `static UI` моделей.
   - 100% покриття словників `data/uk/_/t.nan0` та `data/index.nan0`.
4. **Контрактні тести та валідація:**
   - Проходження контрактних тестів `releases/3/6/v3.6.0/task.spec.js`.


# 2. Пакетна транскрипція та Soft Subtitle Muxing на зовнішніх накопичувачах
visnyk drive:batch-transcribe --dir /Volumes/SSD_Archive/Lectures --language uk

# 3. Транскрибувати аудіо/відео через Whisper
visnyk download:whisper --url "https://youtube.com/watch?v=..." --format json

# 4. Нарізати вертикальні Shorts автоматично
visnyk generate:shorts --auto --transcriptPath transcript.json --videoPath source.mp4

# 5. Опублікувати на YouTube/Telegram
visnyk publish --videoPath out-shorts/video.mp4 --platforms youtube,telegram
```

---

## Релізний пайплайн (команди)

```bash
# 1. Згенерувати сценарій
node bin/share.js generate:script \
  --topic "Як стойцизм допомагає в повсякденному житті" \
  --style storytelling \
  --language uk \
  --duration 60 \
  --output script.txt

# 2. Транскрибувати аудіо/відео
node bin/share.js download:whisper \
  --url "https://youtube.com/shorts/OSO041u-gFk?feature=share" \
  --format json --output tr.json --quality medium

# 3. Нарізати Shorts автоматично з транскрипту
node bin/share.js generate:shorts \
  --auto --transcriptPath tr.json \
  --videoPath tmp/source-video.mp4 \
  --autoDuration 15 \
  --useHardwareAcceleration true \
  --outputDir out-shorts

# 4. Або нарізати Shorts за YAML-конфігом
node bin/share.js generate:shorts \
  --shortsYaml @app/tmp/shorts-config.yaml \
  --videoPath tmp/source-video.mp4 \
  --transcriptPath tr.json \
  --useHardwareAcceleration true \
  --outputDir out-shorts

# 5. Згенерувати субтитри
node bin/share.js generate:subtitles \
  --transcriptPath tr.json \
  --videoDuration 36 \
  --outputPath subtitles.ass

# 6. Скомпілювати відео
node bin/share.js compile:video \
  --episodeDir . \
  --sourceVideoPath tmp/source-video.mp4 \
  --useHardwareAcceleration true

# 7. Опублікувати на YouTube
node bin/share.js publish \
  --videoPath out-shorts/source_intro.mp4 \
  --title "Стойцизм: Урок від кота" \
  --description "Коротке відео про стойцизм. #філософія #стойцизм" \
  --platforms youtube \
  --tags "стойцизм,філософія,мотивація" \
  --language uk

---

## 🎬 Universal Video Processing & Multi-Platform Distribution Pipeline (Roadmap v3.2+)

Побудова універсального автономного конвеєра в `@nan0web/share.app` для обробки довгих відео (1+ година), транскрипції Whisper з точними таймкодами та детекцією пауз, автоматичного розбиття на тематичні епізоди, нарізки Shorts/Reels (9:16) та автоматичної дистрибуції/публікації (YouTube, Facebook, Telegram тощо).

### 📐 Архітектурний дизайн конвеєра

```
[ Long Video File / YouTube URL ]
              │
              ▼
    1. Media Ingestion (YouTubeDownloaderPort / Local File)
              │
              ├──────────────────────────────────┐
              ▼                                  ▼
    2. Audio Extraction                High-Res Video (1080p/4k)
              │                                  │
              ▼                                  │
    3. Whisper Transcription                     │
       - Word-level timestamps (ms)              │
       - JSON structured export                  │
              │                                  │
              ▼                                  │
    4. Pause & Semantic Analyzer                 │
       - Silence/pause detector                  │
       - Topic/Chapter segmenter (LLM/Heuristic) │
              │                                  │
              ▼                                  │
    5. Video Cutter & Shorts Generator ◄─────────┘
       - Long Episodes (16:9 / chapters)
       - Viral Shorts/Reels (9:16 + animated dynamic subtitles)
              │
              ▼
    6. Multi-Platform Publisher Engine
       - YouTube (Longs as Unlisted/Public + Shorts)
       - Telegram (Direct video + preview)
       - Facebook / Other Socials (SocialAdapter)

```

### 📋 Задачі розробки (Tasks & Modules)

#### 1. Модуль транскрипції та детекції пауз (Transcription & Pause Detection) — [Сесія 1: ГОТОВО]
- [x] `PipelineNode.js` — абстрактний базовий клас для composable-конвеєрів (`pipe`, `compose`, `execute`).
- [x] `SilencePauseAnalyzer.js` — аналіз масиву слів Whisper, детекція та 3-рівнева класифікація пауз (`silence`, `breath`, `topic_boundary`).
- [x] `CutMapGenerator.js` — генерація YAML `cut-map.yaml` з підтримкою `aspectRatio` (16:9, 9:16) та легковажною серіалізацією `toYaml()`.
- [x] `ChapterSegmenter.js` — розбиття транскрипту на логічні розділи/глави з прив'язкою меж до пауз.
- [x] `src/test/releases/v3.2.0_pipeline.spec.js` — 16 контрактних тестів (Green).





#### 2. Нарізка відео та створення Shorts (Video Slicer & Shorts Styler) — [Сесія 2: ГОТОВО]
- [x] `VideoSlicerPort.js` — FFmpeg нарізка за YAML cut-map: швидкий stream-copy для 16:9 (`-c copy`) та вертикальний рендер для 9:16 з кадруванням та ASS субтитрами.





#### 3. Автоматична публікація (Multi-Platform Distribution Layer) — [Сесія 2: ГОТОВО]
- [x] `YouTubePublisherPort.js` — YouTube Data API v3 (`googleapis`): підтримка завантаження вихідного відео як `unlisted`, окремих розділів та Shorts (авто-хештег `#Shorts`).
- [x] `PublishCommand.js` — уніфікована мульти-платформна публікація (YouTube, Telegram, Facebook) пакетом та за розкладом.





#### 4. Єдиний конвеєр (Master Pipeline Command) — [Сесія 2: ГОТОВО]
- [x] `VideoPipelineCommand.js` — майстер-команда повного циклу (`PipelineNode.compose(...)`): Ingestion ➡️ Transcribe ➡️ Pause & Cut-Map ➡️ [Author Review] ➡️ Slicing ➡️ Multi-Platform Publish.
- [x] CLI скрипт: `pnpm run pipeline:video --url <URL> --publish youtube,telegram`.





#### 5. Каталог накопичувачів та дедуплікація (Storage, Offline Index & Deduplication) — [Сесія 3: ГОТОВО]
- [x] `DriveModel.js` & `FileEntryModel.js` — моделі офлайн-каталогу та метаданих файлів дисків.
- [x] `DriveIndexerService.js` — сканування та генерація офлайн-індексу для підключених/зовнішніх HDD/SSD.
- [x] `DeduplicationEngine.js` — виявлення дублікатів файлів за хешами та порівняння дисків для бекапу.
- [x] `DriveIndexCommand.js` (`share drive:index`) — CLI команда для індексації накопичувача.
- [x] `DeduplicateCommand.js` (`share drive:dedup`) — CLI команда для виявлення та оцінки дублікатів.





#### 6. Пакетна обробка медіа, Soft Subtitle Muxing & Ієрархічний Кеш (Release v3.3.0) — [ГОТОВО]
- [x] `TranscriptCacheService.js` — ієрархічне дзеркалювання структури дисків у `~/.nan0web/share.app/transcripts/` (Варіант В, нуль деградації VFS).
- [x] `MediaInspectorService.js` — `ffprobe` інспекція наявності soft-субтитрів та стрімів без перекодування.
- [x] `SubtitleMuxerPort.js` — вбудовування субтитрів через Stream Copy (`-c copy -c:s mov_text`) та Safe Atomic Swap з валідацією.
- [x] `HFEmbeddingService.js` — багатомовні ембеддінги Hugging Face Spaces для PostgreSQL `pgvector` / Payload CMS.
- [x] `DriveBatchTranscribeCommand.js` (`share drive:batch-transcribe`) — пакетна обробка дисків із перевіркою субтитрів, кешуванням та муксингом.
- [x] `releases/3/3/v3.3.0/` — канонічна трійка релізу (`task.md`, `task.spec.js`, `pipeline.md`) з 100% проходженням тестів.
- [x] `data/uk/_/t.nan0` / `data/index.nan0` — повні словники та маніфести за стандартом Model-as-Schema.





- [x] `play/server.js` (`GET /api/drives`) — інтеграція з веб-дашбордом для списку накопичувачів.





### 🧪 План тестування (TDD First)
- [x] `src/test/releases/v3.2.0_pipeline.spec.js` (Сесія 1: 16/16 Pass ✔)
- [x] `src/test/releases/v3.2.0_session2.spec.js` (Сесія 2: 10/10 Pass ✔)
- [x] `src/test/releases/v3.2.0_session3.spec.js` (Сесія 3: 11/11 Pass ✔)



---

### PhaseAuditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`



**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

---

### JsHygieneAuditor
- [ ] [hygiene] tsconfig.compilerOptions.outDir: `tsconfig.json compilerOptions.outDir should be "./types" (profile: node)`



  - **Suggested Fix**: `"outDir": "./types"`

- [ ] [hygiene] tsconfig.compilerOptions.moduleResolution: `tsconfig.json compilerOptions.moduleResolution should be "nodenext" for node profile`



**Boundary**: [@[tsconfig.json]](./tsconfig.json)
**Context**: [@[tsconfig.json]](./tsconfig.json)

---

### JsExportAuditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [ ] [exports] exports["."].types: `Missing "types" declaration in package.json exports["."]`
- [ ] [exports] exports["./ui/lit"].types: `Missing "types" declaration in package.json exports["./ui/lit"]`




---

### JsDomainAuditor
- [ ] [domain] src/domain/commands/DeduplicateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'dir' in src/domain/commands/DeduplicateCommand.js (DeduplicateCommand)`
- [ ] [domain] src/domain/commands/DeduplicateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'driveId' in src/domain/commands/DeduplicateCommand.js (DeduplicateCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'url' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'output' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'quality' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'format' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'llmModel' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DownloadWhisperCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'cookies' in src/domain/commands/DownloadWhisperCommand.js (DownloadWhisperCommand)`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'dir' in src/domain/commands/DriveBatchTranscribeCommand.js (DriveBatchTranscribeCommand)`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/DriveBatchTranscribeCommand.js (DriveBatchTranscribeCommand)`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'quality' in src/domain/commands/DriveBatchTranscribeCommand.js (DriveBatchTranscribeCommand)`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'mux' in src/domain/commands/DriveBatchTranscribeCommand.js (DriveBatchTranscribeCommand)`
- [ ] [domain] src/domain/commands/DriveIndexCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'mountPoint' in src/domain/commands/DriveIndexCommand.js (DriveIndexCommand)`
- [ ] [domain] src/domain/commands/DriveIndexCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'name' in src/domain/commands/DriveIndexCommand.js (DriveIndexCommand)`
- [ ] [domain] src/domain/commands/DriveIndexCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'driveId' in src/domain/commands/DriveIndexCommand.js (DriveIndexCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'videoPath' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'title' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'description' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'platforms' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'tags' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'credentials' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/PublishCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/PublishCommand.js (PublishCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'topic' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'style' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'output' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'duration' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ScriptGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'platform' in src/domain/commands/ScriptGenerateCommand.js (ScriptGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'shortsYaml' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'videoPath' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'imgPath' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'outputDir' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'transcriptPath' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'useHardwareAcceleration' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'auto' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/ShortsGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'autoDuration' in src/domain/commands/ShortsGenerateCommand.js (ShortsGenerateCommand)`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'transcriptPath' in src/domain/commands/SubtitleGenerateCommand.js (SubtitleGenerateCommand)`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'videoDuration' in src/domain/commands/SubtitleGenerateCommand.js (SubtitleGenerateCommand)`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'outputPath' in src/domain/commands/SubtitleGenerateCommand.js (SubtitleGenerateCommand)`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'maxBlockWidth' in src/domain/commands/SubtitleGenerateCommand.js (SubtitleGenerateCommand)`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'maxWordsPerBlock' in src/domain/commands/SubtitleGenerateCommand.js (SubtitleGenerateCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'episodeDir' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'sourceVideoPath' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'sourceAudioPath' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'sourceTextPath' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'subtitlePath' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'shortsDir' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'outputPath' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'useHardwareAcceleration' in src/domain/commands/VideoCompileCommand.js (VideoCompileCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'url' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'cutMap' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'outputDir' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'publish' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'minChapterDuration' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'directorCut' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'cutSilence' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'minSilenceDuration' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'paddingBefore' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'paddingAfter' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'scenes' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'stitch' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'transition' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'transitionDuration' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'previewFrame' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'shorts' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'shortsDuration' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'subtitles' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'article' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'template' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'model' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'sources' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'overview' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'dryRun' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'id' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'name' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'mountPoint' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'totalSpace' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'freeSpace' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'status' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'lastIndexedAt' in src/domain/models/DriveModel.js (DriveModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'driveId' in src/domain/models/DriveModel.js (FileEntryModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'relativePath' in src/domain/models/DriveModel.js (FileEntryModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'size' in src/domain/models/DriveModel.js (FileEntryModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'hash' in src/domain/models/DriveModel.js (FileEntryModel)`
- [ ] [domain] src/domain/models/DriveModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'mtime' in src/domain/models/DriveModel.js (FileEntryModel)`
- [ ] [domain] src/domain/pipeline/PipelineNode.js: `Class field outside constructor in src/domain/pipeline/PipelineNode.js (line 12)`
- [ ] [domain] src/domain/FeedbackReader.js: `Class field outside constructor in src/domain/FeedbackReader.js (line 17)`
- [ ] [domain] src/domain/FeedbackReader.js: `Class field outside constructor in src/domain/FeedbackReader.js (line 19)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'url' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'status' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'transcript' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'title' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'chunks' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'quality' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'format' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/MediaDownloadModel.js (MediaDownloadModel)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'id' in src/domain/Models.js (SocialAdapterConfig)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'account' in src/domain/Models.js (SocialAdapterConfig)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'credentials' in src/domain/Models.js (SocialAdapterConfig)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'maxLength' in src/domain/Models.js (SocialAdapterLimits)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'text' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'title' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'photo' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'video' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'document' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'audio' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'tags' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'type' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'lang' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'options' in src/domain/Models.js (SocialAdapterContent)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'id' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'author' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'authorId' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'authorAvatar' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'text' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'type' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'createdAt' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'network' in src/domain/Models.js (SocialAdapterFeedback)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'id' in src/domain/Models.js (SocialAdapterTarget)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'network' in src/domain/Models.js (SocialAdapterTarget)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'account' in src/domain/Models.js (SocialAdapterTarget)`
- [ ] [domain] src/domain/Models.js: `Missing constructor declaration or JSDoc @type for static schema field 'postId' in src/domain/Models.js (SocialAdapterTarget)`
- [ ] [domain] src/index.js: `Missing constructor declaration or JSDoc @type for static schema field 'command' in src/index.js (ShareAppCLI)`




---

### Circular Dependency Auditor
- [ ] [circular] circular: `Found 3 circular dependency chains: src/domain/AudioSplitter.js -> src/ports/AudioSplitterPort.js



src/domain/YouTubeDownloader.js -> src/ports/YouTubeDownloaderPort.js
src/ports/ToolCheckerPort.js -> src/domain/ToolChecker.js`

## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect domain --fix`
- `nan0inspect circular --fix`
- `nan0inspect snapshots --fix`- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'scenes' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'cutSilence' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'minSilenceDuration' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'paddingBefore' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'paddingAfter' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/DirectorCutAnalyzer.js: `Missing constructor declaration or JSDoc @type for static schema field 'totalDuration' in src/domain/analysis/DirectorCutAnalyzer.js (DirectorCutAnalyzer)`
- [ ] [domain] src/domain/analysis/MediaInspectorService.js: `Direct fs import detected in domain file src/domain/analysis/MediaInspectorService.js (line 2). Use injected db instead.`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Direct fs import detected in domain file src/domain/commands/DriveBatchTranscribeCommand.js (line 6). Use injected db instead.`
- [ ] [domain] src/domain/commands/DriveBatchTranscribeCommand.js: `Direct path import detected in domain file src/domain/commands/DriveBatchTranscribeCommand.js (line 7). Use db methods instead.`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Direct fs import detected in domain file src/domain/commands/SubtitleGenerateCommand.js (line 3). Use injected db instead.`
- [ ] [domain] src/domain/commands/SubtitleGenerateCommand.js: `Direct path import detected in domain file src/domain/commands/SubtitleGenerateCommand.js (line 4). Use db methods instead.`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'input' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'format' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'language' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'quality' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'force' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/TranscribeCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'quiet' in src/domain/commands/TranscribeCommand.js (TranscribeCommand)`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Direct path import detected in domain file src/domain/commands/VideoCompileCommand.js (line 4). Use db methods instead.`
- [ ] [domain] src/domain/commands/VideoCompileCommand.js: `Direct fs import detected in domain file src/domain/commands/VideoCompileCommand.js (line 5). Use injected db instead.`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'acrossfade' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/commands/VideoPipelineCommand.js: `Missing constructor declaration or JSDoc @type for static schema field 'audioTransitionDuration' in src/domain/commands/VideoPipelineCommand.js (VideoPipelineCommand)`
- [ ] [domain] src/domain/generation/ShortsToLongCompiler.js: `Direct path import detected in domain file src/domain/generation/ShortsToLongCompiler.js (line 2). Use db methods instead.`
- [ ] [domain] src/domain/generation/ShortsToLongCompiler.js: `Direct fs import detected in domain file src/domain/generation/ShortsToLongCompiler.js (line 3). Use injected db instead.`
- [ ] [domain] src/domain/pipeline/SubtitleMuxerPort.js: `Direct fs import detected in domain file src/domain/pipeline/SubtitleMuxerPort.js (line 2). Use injected db instead.`
- [ ] [domain] src/domain/pipeline/SubtitleMuxerPort.js: `Direct path import detected in domain file src/domain/pipeline/SubtitleMuxerPort.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/storage/DriveIndexerService.js: `Direct fs import detected in domain file src/domain/storage/DriveIndexerService.js (line 2). Use injected db instead.`
- [ ] [domain] src/domain/storage/DriveIndexerService.js: `Direct path import detected in domain file src/domain/storage/DriveIndexerService.js (line 3). Use db methods instead.`
- [ ] [domain] src/domain/storage/TranscriptCacheService.js: `Direct fs import detected in domain file src/domain/storage/TranscriptCacheService.js (line 1). Use injected db instead.`
- [ ] [domain] src/domain/storage/TranscriptCacheService.js: `Direct path import detected in domain file src/domain/storage/TranscriptCacheService.js (line 2). Use db methods instead.`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Direct fs import detected in domain file src/domain/MediaDownloadModel.js (line 5). Use injected db instead.`
- [ ] [domain] src/domain/MediaDownloadModel.js: `Direct path import detected in domain file src/domain/MediaDownloadModel.js (line 6). Use db methods instead.`
- `nan0inspect i18n --fix`



---

### Next Release Task: `AudioSplitterPort` & `MediaDownloadModel` DB Refactor
- [ ] Replace direct `node:fs` / `node:path` usage in `AudioSplitterPort.js` with `DB` (`TMP` mount).
- [ ] Skip `ffmpeg` chunking in `MediaDownloadModel.js` when audio duration fits within a single chunk.
- [ ] Add tests covering `TMP` DB usage and single-chunk bypass.
- [ ] Document patch release notes.
- [ ] **Improve `WhisperTranscriptionService` & `TranscribeCommand` progress/summary**:


  - Remove hardcoded `Step 1/4` label when called outside the 4-step video pipeline.
  - Show processed audio duration vs total duration (e.g. `01:45 / 04:00`) and real-time speed factor (e.g. `3.8x`) in progress output.
  - Include total audio duration, elapsed wall time, and average speed factor (e.g. `4.2x`) in the completion summary.

- [ ] **Fix `TranscribeCommand` output root**:


  - Write output files relative to `CWD` (next to the input file) rather than inside `data/`, and log the actual resolved path.

- [ ] **Decouple `WhisperTranscriptionService` from fixed 4-step pipeline**:


  - Make step numbering/labels contextual so standalone `transcribe` does not report `Step 1/4`.

---

### Phase Auditor

---

### Hygiene Auditor

---

### Export Auditor

---

### Domain Auditor- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`
**Boundary**: [@[LICENSE]](./LICENSE)
- [ ] [phase] phase.lifecycle: `Detected Phase: Unknown (No seed.md or project.md)`
**Boundary**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)
**Context**: [@[package.json]](./package.json)
- [ ] [phase] package.json: `package.json not found or invalid`
**Boundary**: [@[package.json]](./package.json)
**Context**: [@[.]](./.)
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
- [ ] [hygiene] scripts.test: `Missing required script: test`
  - **Suggested Fix**: `"test": "node --test"`
- [ ] [hygiene] scripts.test:all: `Missing required script: test:all`
  - **Suggested Fix**: `"test:all": "npm run build && npm run test && npm run knip"`
- [ ] [hygiene] scripts.build: `Missing required script: build`
  - **Suggested Fix**: `"build": "tsc"`
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`
  - **Suggested Fix**: `npm install -D typescript`
- [ ] [hygiene] scripts.knip: `Missing required script: knip`
  - **Suggested Fix**: `"knip": "knip"`
- [ ] [hygiene] devDependencies.knip: `Missing devDependency: knip (required for npm run knip)`
  - **Suggested Fix**: `npm install -D knip`
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.test:docs: `Missing required script: test:docs`
  - **Suggested Fix**: `"test:docs": "node --test --test-timeout=3333 'src/docs/**/*.md.js' 'src/README.md.js'"`
- [ ] [hygiene] scripts.test:release: `Missing required script: test:release`
- [ ] [hygiene] scripts.release:spec: `Missing required script: release:spec`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
- [ ] [hygiene] scripts.prebuild: `Missing prebuild cleanup (rm -rf dist types)`
  - **Suggested Fix**: `"prebuild": "rm -rf dist types"`
- [ ] [hygiene] tsconfig.json: `Missing config file: tsconfig.json`
- [ ] [hygiene] knip.json: `Missing config file: knip.json`
**Boundary**: [@[knip.json]](./knip.json)

---

### Verification Auditor
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`
- `nan0inspect verification --fix`
