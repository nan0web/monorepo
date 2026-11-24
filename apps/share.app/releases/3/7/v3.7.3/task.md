---
version: 3.7.3
type: patch
status: in_progress
locale: uk
models:
  - WhisperEngine
  - WhisperModelCatalog
  - WhisperTranscriptionService
  - MediaDownloadModel
  - TranscribeCommand
  - DownloadWhisperCommand
  - WhisperModelsCommand
---

# 🎙️ Mission: Live Transcription Tail, Detected Language & Whisper Models Catalog (v3.7.3)

## 🏁 Overview (Огляд)

Патч-реліз `v3.7.3` покращує прозорість та UX процесу транскрибації у `visnyk` (`share.app`) та `@nan0web/ai`:
- Виправляє ігнорування `--quality` у `WhisperTranscriptionService` (прибирає хардкод `'medium'`).
- Виводить активну модель та її орієнтовний розмір на старті файлу.
- Парсить та одноразово виводить визначену мову (`🌐 Detected language: <Lang>`) у постійний лог.
- Додає `--tail <n>` (`default: 1`, `0` — вимкнено) для живого відображення останніх `N` декодованих рядків тексту в зоні прогресу з обрізанням по ширині терміналу.
- Додає команду `visnyk whisper:models` (та прапор `--models` у `transcribe`) для перегляду доступних Whisper-моделей з кешуванням каталогу `mlx-community` із Hugging Face API та offline-fallback.

---

## 🔑 Ключові вимоги (Definition of Done)

### 1. Виправлення `quality` та індикація моделі на старті
- `WhisperTranscriptionService.transcribe()` передає `quality: options.quality || 'medium'` у `MediaDownloadModel`.
- `TranscribeCommand` виводить назву та орієнтовний розмір моделі на старті файлу: `🎙️ [1/1] Transcribing: <file> (model: <quality> · ~<size>)...`.

### 2. Парсинг мови та тексту в `MlxWhisperBackend` (`@nan0web/ai`)
- `MlxWhisperBackend.run()` парсить `Detected language:\s*(.+)` і передає `language` у `onProgress`.
- `MlxWhisperBackend.run()` парсить текст сегмента після таймкоду `\[.*?-->\s+\d{2}:\d{2}\.\d{3}\]\s*(.+)` і передає `text` у `onProgress`.
- Експортовані метадані `MLX_MODEL_MAP` та `MLX_MODEL_META` (орієнтовні розміри моделей).

### 3. Прокидання `language` і `text` у `MediaDownloadModel` та постійний лог мови
- `MediaDownloadModel.run()` зберігає останні `language` та `text` із `chunkProgress` і передає їх у `partial_progress`, щоб 200ms-поллінг не втрачав текст між тіками.
- `WhisperTranscriptionService`, `TranscribeCommand` та `DownloadWhisperCommand` одноразово виводять `🌐 Detected language: <Lang>` у постійний лог (і повторно лише при зміні мови на наступних чанках).

### 4. Живий хвіст тексту `--tail <n>`
- `TranscribeCommand` та `DownloadWhisperCommand` мають статичне поле `tail` (`type: 'number'`, `default: 1`).
- Кільцевий буфер на `N` останніх непорожніх рядків рендериться в динамічній зоні прогресу (через `\n`) з обрізанням по `process.stdout.columns` (або вказаній ширині), а при `tail = 0` не відображається.

### 5. Каталог моделей `WhisperModelCatalog` та `visnyk whisper:models`
- `WhisperModelCatalog` завантажує список `mlx-community` Whisper-моделей з Hugging Face API, визначає розмір і локальний статус у `~/.cache/huggingface/hub`, кешує JSON локально з TTL 7 днів та підтримує `--offline` / `--refresh`.
- Команда `visnyk whisper:models` (і прапор `--models` у `visnyk transcribe`) виводить таблицю моделей із позначкою `(default)` на `medium`.

---

## 📂 Target Files

- `apps/share.app/releases/3/7/v3.7.3/task.md` `[NEW]`
- `apps/share.app/releases/3/7/v3.7.3/user.md` `[NEW]`
- `apps/share.app/releases/3/7/v3.7.3/task.spec.js` `[NEW]`
- `packages/ai/src/domain/WhisperEngine.js` `[MODIFY]`
- `packages/ai/src/index.js` `[MODIFY]`
- `packages/ai/src/domain/WhisperEngine.test.js` `[NEW]`
- `apps/share.app/src/domain/analysis/WhisperModelCatalog.js` `[NEW]`
- `apps/share.app/src/domain/analysis/WhisperTranscriptionService.js` `[MODIFY]`
- `apps/share.app/src/domain/MediaDownloadModel.js` `[MODIFY]`
- `apps/share.app/src/domain/commands/TranscribeCommand.js` `[MODIFY]`
- `apps/share.app/src/domain/commands/DownloadWhisperCommand.js` `[MODIFY]`
- `apps/share.app/src/domain/commands/WhisperModelsCommand.js` `[NEW]`
- `apps/share.app/src/index.js` `[MODIFY]`
