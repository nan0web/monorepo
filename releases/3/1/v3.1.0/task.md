---
version: 3.1.0
type: architecture
status: planning
locale: uk
models: []
---

# 🚀 Mission: Dynamic Format Registry & Self-Contained Markdown Frontmatter

[English version](task.en.md)

## 🏁 Overview
Мета цього релізу — розробити інстанційовану та конфігуровану систему реєстру форматів серіалізації (`FormatRegistry`) в `@nan0web/db` з автоматичними наборами за замовчуванням для `db-fs` та `db-browser`. Також ми переносимо логіку парсингу та збереження метаданих frontmatter (у форматах `yaml` та `nan0`) безпосередньо всередину класу `Markdown` з пакета `@nan0web/markdown`, зберігши при цьому повну архітектурну ізоляцію.

## 👥 User Stories
- **Як розробник додатку (User Space)**, я хочу підключати довільні формати документів (YAML, Markdown, CSV тощо) динамічно через конфіг бази даних `new DB({ formats })`, щоб бандлер фронтенду не затягував непотрібні залежності.
- **Як користувач бази даних**, завантажуючи `.md` файл через `db.loadDocument('docs/guide')`, я хочу відразу отримувати готовий індемніфікований об'єкт класу `Markdown` з автоматично розпарсеними полями frontmatter (у форматі YAML або NAN0).
- **Як розробник Markdown-документів**, я хочу, щоб об'єкт `Markdown` самостійно вмів читати й записувати свої метадані у frontmatter (за замовчуванням `nan0`), щоб зберегти цілісність форматування при виклику `md.toString()`.

## 🏗 Data-Driven Architecture
1. **`FormatRegistry`**: Легковаговий інстанційований реєстр форматів для драйверів БД.
2. **`DBFS` (db-fs)**: Автоматично підключає формати: `json`, `jsonl`, `txt`, `md`, `yaml`, `nan0`, `csv`, `csv0`.
3. **`DBBrowser` (db-browser)**: Автоматично підключає формати: `json`, `jsonl`, `txt`, `csv`.
4. **`Markdown`**: Набуває вбудованих можливостей розпізнавати frontmatter (`---` або інший маркер) у форматі `yaml` або `nan0`, зберігати ці метадані у властивостях екземпляра, та записувати їх назад при серіалізації.

## 🎯 Scope
- [x] Створити `FormatRegistry.js` у `@nan0web/db`.
- [x] Оновити `DBDriverProtocol` та `DB` для використання `FormatRegistry` за замовчуванням та підтримки параметра `formats` в конструкторі.
- [x] Реалізувати замовчувані набори форматів у драйверах `db-fs` та `db-browser`.
- [x] Оновити клас `Markdown` в `@nan0web/markdown` для автоматичного парсингу та генерації YAML/NAN0 frontmatter.
- [x] Виправити зламані тести в `packages/log/src/README.md.js`.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) написані та успішно проходять (Green).
- [x] `FormatRegistry` успішно ізолює логіку серіалізації; веб-збірка не тягне `yaml` та `csv` бібліотеки.
- [x] `Markdown` самостійно парсить frontmatter (за замовчуванням `nan0`, опціонально `yaml`) та серіалізує його назад.
- [x] Екосистема монорепозиторію повністю зелена (`pnpm test:all` проходить успішно).
