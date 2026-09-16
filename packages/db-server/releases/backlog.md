---
name: db-server-backlog
version: 3.4.0
type: architecture
status: active
locale: uk
---

# 📚 Backlog: @nan0web/db-server

> **Опис:** Центральний беклог задач, ідей та намірів щодо розвитку REST-сервера бази даних `@nan0web/db-server`.

---

## 📥 1. Вхідний Пул Ідей (Inbox / Feature Requests)

- [ ] **[FR-201]** Підтримка Server-Sent Events (SSE) або WebSocket для реалтайм оновлень змін у файлах (`watchStream`).
- [ ] **[FR-202]** Двопанельний Midnight Commander режим у Web Explorer (одночасний перегляд двох директорій та копіювання F5 / переміщення F6).
- [ ] **[FR-203]** Вбудований редактор з підсвіткою синтаксису Monaco / CodeMirror замість звичайного textarea.
- [ ] **[FR-204]** Аутентифікація та авторизація за токенами (`Bearer token`) через `@nan0web/auth`.

---

## 🎯 2. Пріоритезовано до Наступних Релізів (Planned Releases)

### 📌 Реліз v3.5.0 (Watch & Real-Time Sync)
- [ ] Задача: Інтеграція `@nan0web/catalog-watch` для автоматичного пушу змін у браузер через SSE (`/api/events`).
- [ ] Задача: Автоматичне оновлення списку файлів в Explorer при зміні на диску.

### 📌 Реліз v3.6.0 (Advanced Dual-Pane Explorer)
- [ ] Задача: Повноцінний спліт-екран (ліва/права панель) для міграції файлів між доменами.

---

## 📦 3. Відкладені / Дослідження (Icebox & Research)
- [ ] Дослідження: WebAssembly-based SQLite/DuckDB адаптер для швидкого виконання аналітичних SQL запитів над JSON/YAML даними.
- [ ] Дослідження: Генерація схем TypeScript та Zod безпосередньо з REST endpoints.
