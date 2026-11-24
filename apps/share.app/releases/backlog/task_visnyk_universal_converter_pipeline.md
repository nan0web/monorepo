---
type: feature
status: backlog
title: "visnyk: Універсальний інструмент конвертації, транскрипції, синтезу мовлення та дистрибуції контенту"
locale: uk
models:
  - ConvertCommand
  - TranscribeCommand
  - SpeechSynthesisCommand
  - WebExtractorAdapter
  - DocumentConverterAdapter
  - McpServerAdapter
---

# 🚀 Завдання: Створення універсального інструменту `visnyk` (CLI & MCP)

## 📌 Мета проєкту
Позбутися необхідності постійно писати одноразові скрипти для конвертації документів, парсингу веб-сторінок, розпізнавання аудіо/відео та озвучування. 

Створити єдиний автономний інструмент **`visnyk`** (у складі пакету `@nan0web/share.app`), який:
1. Легко встановлюється через open-source менеджери пакетів (**Homebrew**, **APT/Debian**, **NPM/NPX**).
2. Надає нативний інтерфейс для AI-агентів через **MCP (Model Context Protocol)** та стандартний CLI.
3. Економить токени, час розробки та усуває людську та машинну рутину.

---

## 🧭 Розмежування потоків: Текст/Web vs Аудіо/Відео

> **Принцип обробки контенту:**
> * Якщо джерело текстове (файл, стаття за URL-посиланням, розмітка, скан) ➔ `visnyk convert`.
> * Якщо джерело звукове або медійне (локальний відео/аудіо файл, або лінк на YouTube/Telegram/TikTok) ➔ `visnyk transcribe`.
> * `visnyk convert` у разі передачі медіафайлу під капотом прозоро делегує виконання пайплайну транскрипції (Smart Dispatch).

---

## 🛠️ Архітектурні компоненти та команди

### 1. `visnyk convert` — Універсальний конвертер у Markdown
Витягує чистий семантичний текст і структуру у `.md`.

* **Вхідні типи даних:**
  * **Офісні документи:** `.docx`, `.doc`, `.pdf`, `.odt`, `.rtf`.
  * **Електронні книги та верстка:** `.epub`, `.html`.
  * **Зображення та скани:** `.png`, `.jpg`, `.webp` (через вбудований OCR-шар: macOS Vision CLI / Tesseract).
  * **🌐 Веб-сторінки за URL (`visnyk convert https://...`):**
    * Автоматичне завантаження сторінки.
    * Очищення від реклами, скриптів, меню та навігації (Readability / Defluffing).
    * Збереження структурованого Markdown із метаданими (автор, дата, заголовок, URL-джерело).
* **Smart Dispatch для відео/аудіо:**
  * Якщо користувач викликає `visnyk convert video.mp4` або `visnyk convert "https://youtu.be/..."`, конвертер автоматично викликає пайплайн `transcribe`.

### 2. `visnyk transcribe` — Розпізнавання мовлення (Speech-to-Text)
Обробка звукових доріжок та відеоматеріалів.

* **Підтримувані джерела:**
  * Локальні файли: `.mp4`, `.mov`, `.m4a`, `.mp3`, `.wav`, `.ogg`, `.webm`.
  * Дистанційні джерела за URL (YouTube, Telegram Cloud, прямі посилання на стріми/відео).
* **Двигуни розпізнавання (з автовибором за доступністю):**
  * **Локальний MLX Whisper:** Максимальна швидкість та приватність на Apple Silicon.
  * **Whisper.cpp / Faster-Whisper:** Для Linux/x86 середовищ без Apple GPU.
  * **Хмарні API (збереження токенів):** Groq Cloud Whisper API (транскрипція за секунди за низьку вартість) та OpenAI Whisper API як фолбек.
* **Результат:** `.md` (із розбивкою за спікерами або таймкодами), субтитри `.sbv`, `.srt`, `.vtt`.

### 3. `visnyk tts` (voice) — Синтез мовлення (Text-to-Speech)
Зворотна дія: озвучування статей, судових позицій, тез та новин спільноти.

* **Безкоштовні та локальні рушії:** `Edge-TTS` (відмінна українська вимова без API-ключів), `Piper TTS`.
* **API-рушії:** ElevenLabs, OpenAI Voice.

### 4. `visnyk audit` / `visnyk summarize` — Інтеграція з AI-моделями (`@nan0web/ai`)
* Пряме підключення до Gemini, OpenAI, Claude, Groq.
* Автоматичне виявлення псевдоправа, перевірка за протоколом самоаудиту, складання тез для судового засідання чи релізу.

---

## 📦 Дистрибуція та готовність для агентів

1. **Homebrew Tap:**
   * Формула `brew install nan0web/tap/visnyk` із залежностями `ffmpeg` та `pandoc`.
2. **APT / Debian Package:**
   * Готовий `.deb` пакет для встановлення в один рядок: `apt install visnyk`.
3. **NPM / Global Binary:**
   * `npm install -g @nan0web/share.app` або використання на льоту: `npx visnyk convert input.docx output.md`.
4. **Режим MCP Server (`visnyk mcp`):**
   * Реєстрація у конфігурації Claude Desktop, Antigravity, Cursor:
     * Інструмент `convert_document(source, target_format)`
     * Інструмент `transcribe_media(media_path_or_url)`
     * Інструмент `extract_web_page(url)`
     * Інструмент `synthesize_speech(text, voice)`
   * Агенти викликають інструмент нативно замість генерації одноразових скриптів.
