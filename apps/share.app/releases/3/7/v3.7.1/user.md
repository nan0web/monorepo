# 📊 Метрики та Зворотний Зв'язок — v3.7.1

## Метрики Виконання
- **Версія:** `v3.7.1`
- **Ітерацій:** 4
- **Контрактних тестів у `task.spec.js`:** 10
- **Статус `pnpm run test:all`:** 247/247 pass

## Append-Only Фідбек Архітектора

### 1. Стрибки прогрес-бару при чанкуванні (`100% -> 55% -> 100%`)
- **Суть:** Події `transcribing` та `partial` передавали `update.chunk`, а `partial_progress` передавав `update.chunk - 1 + update.percent / 100`.
- **Рішення:** Виправлено на `update.chunk - 1` для `transcribing`, додано `Math.max(maxProgress, ...)` та стабільний `id` у `TranscribeCommand`.
- **Тест:** `should emit monotonically non-decreasing progress across chunks in WhisperTranscriptionService`.

### 2. Перенесення прогресу з підготовчих фаз та зайвий `transcript.json`
- **Суть:** При `--format text` зберігався `transcript.json`, а прогрес `segmenting`/`downloading` переносився у фазу транскрибації (`34%` на старті).
- **Рішення:** Додано `saveCache: formats.includes('json')` та скидання `maxProgress` при переході в транскрибацію.
- **Тести:** `should not carry over segmenting/downloading progress into transcription phase`, `should not save transcript.json when format is only text`.

### 3. Розділення фаз прогрес-бару та `--offline` режим
- **Суть:** Підготовчі події (`downloading`, `segmenting`) мають мати окремий `id` (`whisper-prep`), а для роботи без інтернету потрібен прапорець `--offline`.
- **Рішення:** Додано `static offline` у `TranscribeCommand`, `HF_HUB_OFFLINE=1` / `TRANSFORMERS_OFFLINE=1` у `WhisperTranscriptionService`, розділено `id` на `'whisper-prep'` та `'transcribe'`.
- **Тест:** `should pass offline: true to whisperService when --offline is set`.
