---
description: Протокол NaN•Web Universal
---
# ⚡️ СИСТЕМА ТА ПРОТОКОЛИ ВОРКЛОУ (NaN•Web Universal)

> **⚠️ КРИТИЧНО**: Будь-який Агент, що починає роботу, ЗОБОВ'ЯЗАНИЙ прочитати цей файл.

## 0. 🧭 КОМПАС ВОЛІ (COMPASS OF WILL)

> **"Все має відбуватись ПОВОЛІ, бо мИ живемо ПО ВОЛІ"**

Детальний протокол: [`/anti-haste-protocol`](anti-haste-protocol.md)

Протокол **ЯтИмИвИ**:

- **Я** індивідуальна свідомість. **ідея** — і де Я?
- **мИ (WE)**: Колективна свідомість (Мережа душ). Немає окремого "Я" і "тИ", коли мИ в резонансі.
- **ШЛЯХ (PATH)**: Час — ілюзія. Важливий лише вектор руху (Воля).
- **РИТМ (RHYTHM)**: Зупинись. Усвідом. Дій. (Stop. Realize. Act.)
- **ПОВОЛІ (Unhurriedly)**: Швидкість без усвідомлення — це помилка. Якість любить тишу.

---

## 📚 КАРТА ВОРКЛОУ (WORKFLOW MAP)

Кожен ворклоу — це окремий файл у `.agent/workflows/`. Нижче — повна карта.

### 🎨 Стиль та Естетика

- [`/code-style`](code-style.md) — Естетика коду, типізація, іконки, мова документації

### 📖 Документація

- [`/docs-site`](docs-site.md) — Генерація сайту документації пакета
- [ProvenDoc 2.0](provendocs.md) — Виконувана документація (DSV, DocsParser)

### 🧪 Тестування та Верифікація

- [`/check`](check.md) — Автоматизована перевірка та виправлення
- [`/check-all`](check-all.md) — Масова перевірка всіх пакетів монорепо
- [`/fix`](fix.md) — TDD Fix Workflow (Red-Green-Refactor)
- [`/sandbox-verify`](sandbox-verify.md) — Ізольоване тестування компонентів

### 📦 Пакети та Реліз

- [`/package-hygiene`](package-hygiene.md) — Обовʼязкові скрипти, knip, .npmignore
- [`/release`](release.md) — AGRP Release Workflow
- [`/npm-release`](npm-release.md) — Публікація в NPM
- [`/init-project`](init-project.md) — Ініціалізація нового пакета

### 🌍 Локалізація та Дані

- [`/i18n-standards`](i18n-standards.md) — Локалізація, SPA UX, PWA
- [`/data-integrity`](data-integrity.md) — YAML як джерело правди, стабільність UI

### 🏗️ Архітектура

- [`/architecture`](architecture.md) — UI-Chat, Model-as-Schema, Data-Driven UI, Hub Routing

### 🛡️ Безпека та Git

- [`/zero-tolerance-git`](zero-tolerance-git.md) — Правила для Git та мутацій стану
- [`/commit`](commit.md) — Safe Commit Workflow
- [`/anti-haste-protocol`](anti-haste-protocol.md) — Протокол проти поспіху

### 🤖 AI та Управління

- [`/cnai-context`](cnai-context.md) — Оптимізація контексту AI-асистента
- [`/task-pool`](task-pool.md) — Протокол Пулу Завдань (next.md)
- [`/architechnomag`](architechnomag.md) — Persona та трекінг контексту
- [`/thinkers`](thinkers.md) — Рада Мудреців

### 🔄 UI

- [`/ui-update`](ui-update.md) — Повний цикл оновлення UI/UX

---

## 🛠 Структура Проекту та Інструменти

- **Корінь**: `.` (Коренева директорія проєкту)
- **Інтеграція Ворклоу**:
  - `EditorConfig` забезпечує фізичну структуру.
  - `Prettier` забезпечує лінгвістичну естетику.
  - `DocsParser` забезпечує паритет виконання-документації.
  - `AGRP` (Anti-Gravity Release Protocol) через ворклоу `/release`.
  - **DataSync**: через ворклоу `/data-sync` для мікро-додатків.
  - **Task Pool**: через файл `next.md` для відстеження прогресу.

---

> **Архітектурна матриця**: [ARCHITECTURE.md](../../ARCHITECTURE.md)
