---
version: 3.3.0
type: feature
status: active
locale: uk
models:
  - MediaInspectorService
  - SubtitleMuxerPort
  - TranscriptCacheService
  - HFEmbeddingService
  - DriveBatchTranscribeCommand
---

# 🚀 Mission: Комплексна індексація медіа, Soft Subtitle Muxing & Hugging Face Vector Search (v3.3.0)

## 🏁 Overview (Огляд)

Реліз v3.3.0 впроваджує високопродуктивний конвеєр пакетної обробки відеоархівів на зовнішніх накопичувачах:
1. Виявлення існуючих вбудованих субтитрів через `ffprobe` (`MediaInspectorService`).
2. Вбудовування субтитрів безпосередньо у відеоконтейнер (Soft Subtitle Stream Muxing) через FFmpeg Stream Copy (`SubtitleMuxerPort`).
3. Безпечна атомарна заміна файлів (Safe Atomic Swap) для запобігання подвоєнню зайнятого місця на диску.
4. Ієрархічне дзеркальне кешування транскриптів (`~/.nan0web/share.app/transcripts/`) без деградації файлової системи (`TranscriptCacheService`).
5. Генерація векторних ембеддінгів через Hugging Face Spaces API (`HFEmbeddingService`) для семантичного пошуку в Payload CMS (PostgreSQL `pgvector`).
6. Пакетна CLI команда `pnpm start drive:batch-transcribe` (`DriveBatchTranscribeCommand`).

## 👥 User Stories (Сценарії)

- Як медіа-мейкер, я хочу підключити зовнішній HDD і запустити `drive:batch-transcribe`, щоб усі відео отримали вбудовані субтитри без перекодування відео і без подвоєння місця на диску.
- Як дослідник/автор книги, я хочу мати ієрархічний офлайн-кеш усіх транскриптів у `~/.nan0web/share.app/transcripts/`, щоб швидко шукати та генерувати розділи книги навіть без підключеного диску.
- Як розробник платформи, я хочу відправляти векторизовані транскрипти у Payload CMS з `pgvector` через Hugging Face Spaces для миттєвого семантичного пошуку.

## 🏗 Data-Driven Architecture (Моделювання)

- **`MediaInspectorService`**: Інспекція стрімів через `ffprobe` (`hasSubtitles`, `extractSubtitles`, `getVideoMeta`).
- **`SubtitleMuxerPort`**: Вбудовування soft-субтитрів (`muxSoftSubtitles`, `safeAtomicReplace`).
- **`TranscriptCacheService`**: Ієрархічний кеш шляхів (`getCachePath`, `has`, `save`, `load`).
- **`HFEmbeddingService`**: Клієнт векторних ембеддінгів Hugging Face Spaces.
- **`DriveBatchTranscribeCommand`**: `ModelAsApp` з аліасом `drive:batch-transcribe`.

## 🎯 Scope (Задачі)

1. Створити контрактні тести `task.spec.js` для перевірки `MediaInspectorService`, `SubtitleMuxerPort`, `TranscriptCacheService`, `HFEmbeddingService` та `DriveBatchTranscribeCommand`.
2. Реалізувати `TranscriptCacheService` з ієрархічним дзеркалюванням шляхів у `~/.nan0web/share.app/transcripts/`.
3. Реалізувати `MediaInspectorService` для аналізу стрімів через `ffprobe`.
4. Реалізувати `SubtitleMuxerPort` для stream copy muxing та безпечної атомарної заміни.
5. Реалізувати `HFEmbeddingService` для векторизації через Hugging Face Spaces.
6. Реалізувати `DriveBatchTranscribeCommand` з повною Model-as-Schema локалізацією.
7. Додати переклади у `data/uk/_/t.nan0` та дескриптори в `data/index.nan0`.

## ✅ Acceptance Criteria (Критерії прийомки)

- [ ] Контрактні тести `task.spec.js` проходять успішно (100% Green).
- [ ] Повний тестовий суїт пакету `release:spec` не має регресій.
- [ ] Субтитри вбудовуються без перекодування відео (stream copy) за <2 сек.
- [ ] Safe Atomic Swap гарантує збереження оригіналу у разі збою та відсутність подвоєння місця.
