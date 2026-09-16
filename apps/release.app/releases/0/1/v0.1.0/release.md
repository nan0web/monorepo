---
name: release-app
version: 0.1.0
type: feature
status: active
locale: uk
models:
  - RegistryModel
  - DashboardModel
  - ReleaseApp
  - StatusCommand
knowledge_base:
  - /packages/release/docs/uk/README.md
  - /docs/uk/workflows/model-as-app.md
  - /docs/uk/workflows/release.md
  - /docs/uk/workflows/ui-cli-standards.md
---

# 🚀 Release: Global Release Hub & Live Monitor (v0.1.0)

> **Мета Релізу:** Створення централізованого хабу моніторингу та агрегації релізів для монорепозиторію на основі Anti-Gravity Release Protocol (AGRP): структурована CLI-таблиця зі статусами гілок, детальний перегляд проєктів за `#ID`, сортування та візуальний OLMUI Web Dashboard.

---

## 👥 1. User Stories & Ролі

### 🔹 Роль: Архітектор / Розробник (CLI & Terminal)
- **Story 1 (Таблиця зі статусом гілок):** Як архітектор, я хочу бачити структуровану таблицю всіх проєктів монорепозиторію з номером рядка `#`, поточною Git-гілкою, станом незакомічених змін (`clean`/`dirty`), версією, годинами, ітераціями та балами RRS.
- **Story 2 (Детальний інспектор за `#`):** Як архітектор, я хочу виконувати `pnpm release:status 1` або `pnpm release:status @industrialbank/bank`, щоб отримати детальний паспорт обраного проєкту (список завдань, історію сесій, блокери та відгуки з `user.md`).
- **Story 3 (Сортування та пріоритети):** Як архітектор, я хочу сортувати проєкти за готовністю (`--sort=rrs`), статусом (`--sort=state`) або часом (`--sort=hours`), щоб швидко визначати пріоритети робіт.

### 🔹 Роль: Керівник / Користувач (Web Dashboard)
- **Story 4 (Web Dashboard):** Як користувач, я хочу переглядати гарний Web UI дашборд у браузері (`apps/release.app/play/index.html`), щоб наочно оцінювати загальний прогрес спринтів монорепозиторію.

---

## 📋 2. Завдання Релізу та Контракти (Tasks & Contracts)

### Етап 1: Доменні Моделі та Збір Даних (`@nan0web/release`)
- **🔹 Задача 1.1: Реєстр Проєктів та Автоскан (`RegistryModel`)**
  - Підтримка `releases.txt` + автовиявлення всіх воркспейсів монорепозиторію.
  - Контракт: [Registry.story.js](/packages/release/src/domain/Registry/Registry.story.js)
  - Статус: 🟢 Виконано

- **🔹 Задача 1.2: Агрегатор Дашборду та Git-Телеметрія (`DashboardModel`)**
  - Глибоке сканування релізів `releases/**/v*.*.*`, парсинг `user.md`, `release.md`, `task.md`.
  - Зчитування поточної Git-гілки та стану робочого дерева (`clean`/`dirty`).
  - Контракт: [Dashboard.story.js](/packages/release/src/domain/Dashboard/Dashboard.story.js)
  - Статус: 🟢 Виконано

---

### Етап 2: CLI-Інтерфейс та Детальний Інспектор (`apps/release.app`)
- **🔹 Задача 2.1: Форматована Таблиця CLI (`StatusCommand`)**
  - Рендеринг таблиці з колонками: `#`, `Project`, `Version`, `Branch`, `Git`, `State`, `Hours`, `Iters`, `RRS`, `Tasks`.
  - Підтримка сортування `--sort=state|rrs|hours|name`.
  - Контракт: [task.spec.js](/apps/release.app/releases/0/1/v0.1.0/task.spec.js)
  - Статус: 🟢 Виконано

- **🔹 Задача 2.2: Детальний Перегляд Проєкту за `#` або назвою**
  - Підкоманда / режим перегляду повного паспорта проєкту (задачі, чекбокси, журнал сесій).
  - Контракт: [task.spec.js](/apps/release.app/releases/0/1/v0.1.0/task.spec.js)
  - Статус: 🟢 Виконано

---

### Етап 3: OLMUI Web Dashboard
- **🔹 Задача 3.1: Веб-Рендерер (`ReleaseDashboard.js`)**
  - Генерація естетичного адаптивного HTML/CSS дашборду.
  - Контракт: [ReleaseDashboard.test.js](/apps/release.app/src/ui/web/ReleaseDashboard.test.js)
  - Статус: 🟢 Виконано

---

## 🧪 3. Критерії Прийомки (Definition of Done)
- [x] **Контрактні тести (TDD):** 100% тестів у `task.spec.js` та сценарних тестах пройдено.
- [x] **Data-First:** Відсутність сирого `fs`, стан управляється через `DBFS` / `@nan0web/db`.
- [x] **CLI Таблиця:** Виводиться чітка таблиця з нумерацією рядків `#` та статусом Git-гілок.
- [x] **Inspect Mode:** Працює інспекція окремого проєкту за номером або назвою.
- [x] **RRS Gate:** Реліз готовий до запечатування (RRS ≥ 324).

---

## 📝 4. Журнал Зворотного Зв'язку та Рішень (Append-Only Feedback)
* **[2026-09-01 18:49]**: Сесія 1 — Реалізовано базові `RegistryModel`, `DashboardModel` у `@nan0web/release`.
* **[2026-09-01 20:56]**: Сесія 2 — Створено `ReleaseApp`, `StatusCommand`, `ReleaseDashboard.js`, додано скрипти `pnpm run release:status` та `release:web`.
* **[2026-09-02 00:05]**: Сесія 2.1 — Виправлено знаходження активних релізів `v3.3.0` у підкаталогах, парсинг телеметрії `user.md` (`6.5h`, `14 iters`, `RRS 324`).
* **[2026-09-02 00:15]**: Сесія 2.2 — Затверджено вимоги Архітектора: розширення CLI форматованою таблицею з `#`, Git-гілкою/статусом, детальним інспектором проєкту та сортуванням.
* **[2026-09-02 00:40]**: Сесія 2.3 — Успішно реалізовано контракт `task.spec.js`: табличний вивід з нумерацією `#`, Git-телеметрія (`branch`, `dirty`/`clean`), режим інспектора `status <#|name>` та сортування `--sort=hours|rrs|state|name`. 100% тестів пройдено.
