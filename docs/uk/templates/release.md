---
name: release-template
version: 1.0.0
type: feature                  # feature | architecture | bugfix | refactor
status: active                 # planning | active | done | paused
locale: uk
models:
  - MyDomainModel
knowledge_base:
  - /packages/release/docs/uk/README.md
  - /packages/db/docs/uk/DB-FIRST-PATTERN.md
  - /docs/uk/workflows/model-as-app.md
  - /docs/uk/workflows/release.md
---

# 🚀 Release: [Назва Релізу / Версії] (v1.0.0)

> **Мета Релізу:** Короткий, ясний опис суті та кінцевої цінності втілення.

---

## 👥 1. User Stories & Ролі

### 🔹 Роль: Адміністратор / Системний інженер (CLI & System)
- **Story:** Як адміністратор, я хочу запускати `nan0web config`, щоб декларативно монтувати підсистеми без ручного редагування коду.
  - *Критерій успіху:* Створюється або оновлюється валідний конфіг-файл.

### 🔹 Роль: Клієнт / Кінцевий користувач (Web & UI)
- **Story:** Як користувач, я хочу переглядати актуальні дані у Web UI рідною мовою, щоб приймати рішення без затримок.
  - *Критерій успіху:* SSG рендерить сторінку з нульовим хардкодом.

---

## 📋 2. Завдання Релізу та Контракти (Tasks & Contracts)

### Етап 1: [Назва етапу]

#### 🔹 Задача 1.1: [Назва задачі]
- **User Story:** *Як розробник, я хочу описати модель конфігурації, щоб валідувати вхідні дані.*
- **Контракт (Test):** [config.spec.js](/releases/1/0/v1.0.0/config.spec.js)
- **Цільові файли (Target Files):**
  - `[NEW]` [ConfigModel.js](/packages/release/src/domain/ConfigModel.js)
  - `[MODIFY]` [AppModel.js](/packages/release/src/domain/AppModel.js)
- **Критерії (DoD):**
  - [ ] Контракт проходить (`pnpm test`)
  - [ ] `git diff` стосується виключно задекларованих файлів
- **Статус:** 🟡 В роботі

---

## 🧪 3. Критерії Прийомки та Релізний Gate (Definition of Done)
- [ ] **Контрактні тести (TDD):** Всі `*.spec.js` зелені (100% Pass).
- [ ] **Регресія:** Контракти закриваються командою `@nan0web/release close` (`spec.js` -> `test.js`).
- [ ] **Data-First:** Немає `fs`, використовується `@nan0web/db`.
- [ ] **Git Cleanliness:** Відсутність незв'язаних змін у `git status`.
- [ ] **RRS Score:** Release Readiness Score ≥ 324 бали.

---

## 📝 4. Журнал Зворотного Зв'язку та Ретроспектива (Feedback & Decisions)
> *Append-only: фіксуємо зауваження Архітектора, знайдені дефекти та рішення.*
* **[2026-09-01 12:45]**: Додано обов'язкові User Stories під кожну задачу за ролями.
* **[2026-09-01 13:40]**: Стандартизовано відносні шляхи від кореня воркспейсу (`/path/to/file`) та чисті імена файлів у назвах лінків.
