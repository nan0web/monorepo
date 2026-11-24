---
version: 3.7.0
type: feature
status: completed
locale: uk
models:
  - TranscribeCommand
  - WhisperTranscriptionService
  - ShareAppCLI
---

# 🎙️ Mission: TranscribeCommand (CLI STT & Subtitles Pipeline v3.7.0)

## 🏁 Overview (Огляд)

Реліз v3.7.0 додає команду транскрибації аудіо `visnyk transcribe` (та `share transcribe`) до CLI застосунку `share.app`.
Команда орієнтована на обробку щоденників, диктофонних надиктувань та медійних конвеєрів безпосередньо через локальну модель `mlx_whisper` на Apple Silicon.

### 🔑 Ключові Вимоги Релізу:
1. **Multiselect форматів виводу (`--format`):**
   - Дозволяє множинний вибір: наприклад `--format text,json` або `--format text,sbv`.
   - Зберігає поруч із вхідним файлом відповідні похідні: `.txt`, `.json` (з таймкодами слів у ms), `.sbv` (YouTube субтитри), `.srt`, `.vtt`.
2. **TTY & Low-Frequency Progress Bar:**
   - Режими виводу прогресу:
     - Інтерактивний TTY прогрес-бар (для локальної консолі).
     - Повільний TTY логер без сміття у терміналі (оновлення кожні N секунд або відсотків: `processed 60s of 320s`), що критично для non-TTY/агентських сесій.
     - Тихо (`--quiet` / `-q`).
3. **Ідемпотентність та кешування:**
   - Якщо файл цільового формату вже існує поруч — він пропускається зі статусом `skipped`.
   - Ключ `--force` (`-f`) для примусового перезапису.
4. **Zero-FS у домені:**
   - Перевірка наявності та збереження результатів виключно через інжектовану базу `this.$db`.
   - Шар виклику `mlx_whisper` ізольований через порт.

## 👥 User Stories (Сценарії)

- Як автор щоденника, я хочу запустити `visnyk transcribe "*/*/*/in/*.{mp3|m4a|aac|mp4}" --format text,json`, щоб отримати чистий текст для читання та структурований JSON з таймкодами для таймлайну.
- Як агент, я хочу бачити лаконічний прогрес без засмічення контекстного вікна десятками однакових рядків прогресу.

## 🎯 Scope (Задачі)

1. `releases/3/7/v3.7.0/task.spec.js`: контрактні тести на парсинг multiselect `--format`, розкриття дужок глобів, ідемпотентність та збереження через `$db`.
2. `src/domain/commands/TranscribeCommand.js`: реалізація `ModelAsApp` команди з підтримкою `static format = { type: 'array', multiselect: true }` та керуванням троттлінгом прогресу.
3. Реєстрація у `ShareAppCLI` (`src/index.js`).
