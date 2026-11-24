# 📊 Журнал Релізу v3.7.3 (Live Tail, Detected Language & Whisper Models Catalog)

## 💬 Зауваження та Рішення Архітектора (Append-Only)

- **[2026-11-24]** Затверджено план патч-релізу `v3.7.3` для `apps/share.app` та `@nan0web/ai`:
  1. Виправити хардкод `quality: 'medium'` у `WhisperTranscriptionService.js` (передавати `options.quality || 'medium'`) та виводити активну модель і її розмір на старті файлу.
  2. Розширити `MlxWhisperBackend.run()` у `WhisperEngine.js` для парсингу `Detected language:` і тексту сегмента `[...] <text>`.
  3. Прокидати `language` та `text` у `MediaDownloadModel.js` у `partial_progress` без втрати між тіками 200ms-поллінгу.
  4. Одноразово виводити `🌐 Detected language: <Lang>` у постійний лог (повторно лише при зміні мови).
  5. Додати `--tail <n>` (`default: 1`, `0` — вимкнено) з кільцевим буфером і обрізанням по ширині терміналу.
  6. Додати `WhisperModelCatalog` з кешуванням каталогу `mlx-community` із Hugging Face API (TTL 7 днів, `--offline`, `--refresh`) та команду `visnyk whisper:models` (і прапор `--models` у `transcribe`).

- **[2026-11-24]** Зауваження Архітектора:
  1. Додати підтримку `--initial-prompt` (словник термінів або файл зі словником) та `--condition-on-previous-text False` (за замовчуванням) для усунення галюцинаційних петель і перекручення термінів.
  2. На довгих аудіо/відео (розбитих на чанки) автоматично фіксувати визначену на 1-му чанку мову для наступних чанків `2..N`, а також додавати хвіст тексту попереднього чанку до `initialPrompt` наступного чанку.
  3. Оформити контракти змін у `@nan0web/ai` як патч-реліз `packages/ai/releases/3/7/v3.7.1/`.

| Показник | Значення |
| :--- | :--- |
| Ітерації | 1 |
| Статус | TDD Green (`@nan0web/ai` test + build, `v3.7.3/task.spec.js`, `share.app` `release:spec` + `test:all` passed) |
