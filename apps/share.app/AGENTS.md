---
fractal: "share.app"
layer: "L4"
locale: "uk"
parent: "../AGENTS.md"
intent: "Специфіка додатку @nan0web/share.app (visnyk): bin/share.js CWD root: '.', порти, test:all, release:validate"
---

# 📡 Додаток `share.app` (`visnyk` / `share`, $L_4$)

> [!CRITICAL]
> **ОБОВ'ЯЗКОВИЙ СТАРТ СЕСІЇ (BEFORE ANY OTHER ACTION):**
> 1. **Мова:** Усі думки та відповіді користувачу — **ВИКЛЮЧНО українською мовою** (`locale: uk`).
> 2. **Перша дія:** Першим же викликом прочитай `read_file('../AGENTS.md')` (ланцюжок `apps` $L_3$ → `nan.web` $L_2$ → `src` $L_1$ → `7iOS` $L_0$).
> 3. **Без цього старту продовжувати роботу заборонено.**

## ⚡ Інваріанти `share.app` ($L_4$)

1. **CWD Mounting у `bin/share.js`:** Точка входу `bin/share.js` монтує корінь бази даних на поточну робочу директорію (`root: '.'` / `process.cwd()`), а **не** на `data/`. Усі вхідні медіафайли та результати транскрибації/експорту за відносними шляхами резолвляться відносно `process.cwd()`.
2. **Інжекція Портів та Зовнішніх Інструментів:** Взаємодія з `ffmpeg`, `ffprobe`, `mlx_whisper`, `yt-dlp` відбувається виключно через інжектовані порти/сервіси (`this.$whisperService`, `ToolCheckerPort`, `SubtitleMuxerPort`, `MediaInspectorService`).
3. **UX Прогрес-барів та Офлайн-режим:** Підготовчі фази (`downloading`, `segmenting`) використовують `id: 'whisper-prep'`, фаза транскрибації — `id: 'transcribe'` з монотонно неспадним прогресом (`Math.max`). Прапорець `--offline` виставляє `HF_HUB_OFFLINE=1` та `TRANSFORMERS_OFFLINE=1`.

## 🧪 Протокол Жорсткого TDD у `share.app` ($L_4$)

1. **Активний реліз (`releases/{major}/{minor}/vX.Y.Z/`):** На кожному кроці та після кожного зауваження Архітектора спочатку оновлюється `user.md` (Append-Only фідбек + метрики) і додається падаючий тест у `task.spec.js`, і лише після цього змінюється код у `src/`.
2. **Швидка перевірка контракту:** `pnpm --filter @nan0web/share.app run release:spec` та `pnpm --filter @nan0web/share.app run test`.
3. **Повний гейт прийомки (обов'язковий перед звітом):**
   - `pnpm --filter @nan0web/share.app run test:all` (`build` → `test` → `test:docs` → `test:integration` → `inspect:domain` → `knip` → `release:validate`)
   - `pnpm --filter @nan0web/share.app run release:validate`

## 🚫 ЗАБОРОНЕНО ($L_4$)

- Монтувати корінь користувацьких файлів у `data/` замість `process.cwd()` (`root: '.'` у `bin/share.js`).
- Викликати `child_process.spawn` / `exec` або `ffmpeg` / `mlx_whisper` напряму в доменних командах `src/domain/commands/*` (лише через інжектовані порти в `src/ports/` та сервіси).
- Зберігати проміжний `transcript.json`, якщо користувач замовив лише `--format text`.
- Змішувати прогрес підготовчих фаз (`whisper-prep`) із прогресом транскрибації (`transcribe`).

## 🗂 Лінивий Індекс `share.app`

- **CLI Оркестратор та Точка входу:** [`bin/share.js`](./bin/share.js), [`src/index.js`](./src/index.js) (`ShareAppCLI`).
- **Команди (`src/domain/commands/`):** `TranscribeCommand.js`, `DownloadWhisperCommand.js`, `VideoPipelineCommand.js`, `VideoCompileCommand.js`, `ShortsGenerateCommand.js`, `SubtitleGenerateCommand.js`, `ScriptGenerateCommand.js`, `DriveIndexCommand.js`, `DeduplicateCommand.js`, `DriveBatchTranscribeCommand.js`, `PublishCommand.js`.
- **Дистрибуція та Правила (`src/domain/`):** `RulesEngine.js`, `SocialAdapter.js`, `DummyAdapter.js`, `Models.js`, `models/DriveModel.js`.
- **Порти (`src/ports/`):** `ToolCheckerPort.js`, `SubtitleMuxerPort.js`, `index.js`.
- **Релізи та Дорожня карта:** [`releases/`](./releases) (завершений `v3.7.1`, запланований `v3.8.0`), [`README.md`](./README.md).
