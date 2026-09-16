# 🏁 План релізу та наступних кроків — v3.5.0 (Fractal OLMUI & Terminal Separation)

> **Статус:** В процесі розробки (Сесія 1)  
> **Концепція:** One Logic — Multiple User Interfaces (OLMUI)  
> **Директорії реалізації:** `packages/ui` (`@nan0web/ui`), `packages/ui-react` (`@nan0web/ui-react`), `packages/ui-cli` (`@nan0web/ui-cli`), `packages/ui-tui` (`@nan0web/ui-tui`)

---

## 🏛 Архітектурна Декомпозиція по Сесіях (Zero-Hallucination Context Strategy)

Щоб уникнути переповнення контексту (Zero-Hallucination Context Strategy згідно з `AGENTS.md`) та не змішувати абстракції, реалізація ділиться на **3 окремі ізольовані сесії (чати)**:

---

### 🔹 Сесія 1: Ядро Моделі, Фрактальний $content та Метадані Колекцій (Workspace: `packages/ui`)
**Мета:** Підтримка довільного порядку блоків `$content` у `Document`, розгортання посилань на навігацію та стандартизація метаданих колекцій (`$collection`, `$slug`, `$title`).
- **Вхідні workflows:** `docs/uk/workflows/model-schema.md`, `docs/uk/workflows/data-architecture.md`, `docs/uk/workflows/release.md`.
- **Задачі:**
  - [x] **DOC-1**: Додати в `Document` та `Content` резолвер посилань для `nav: headerNav` та прямих Navigation об'єктів/масивів.
  - [x] **DOC-2**: Булеве розгортання блоків `$content` (`{ Banner: true }` бере `this.banner`), розбиття множинних булевих ключів у плоский масив.
  - [x] **META-1**: Стандартизація геттерів/метаполів `$collection`, `$alias`, `$slug`, `$title` у моделях.
  - [x] **DOC-3**: Сценарні контрактні тести у `releases/3/5/v3.5.0/task.spec.js` та `src/domain/DocumentContent.test.js`.
  - [x] **DOC-4**: Валідація через `pnpm test` (100% Green).

---

### 🔹 Сесія 2: Асинхронні Віджети-Раннери для Вебу (React AppRunner & Scoped UI)
**Мета:** Реалізація концепції "Додаток як Віджет у Документі": асинхронний неблокуючий генератор для React, ізольований Scoped Feedback (Alert/Toast/Spinner).
- **Вхідні workflows:** `docs/uk/workflows/olm-ui-architecture-adapters.md`, `docs/uk/workflows/release.md`.
- **Задачі:**
  - [ ] **RUN-1**: Контракт `AppRunnerContract` та хук/компонент `AppRunner` для `@nan0web/ui-react` з підтримкою життєвого циклу генератора (`idle`, `waiting_input`, `processing`, `completed`, `error`).
  - [ ] **RUN-2**: Неблокуючий `yield ask`: відображення форми всередині віджета без блокування іншого контенту сторінки.
  - [ ] **RUN-3**: Scoped Feedback: вивід повідомлень (`show`, `progress`) локально в контейнері відповідного блоку сторінки.
  - [ ] **RUN-4**: Паралельна робота декількох інтерактивних віджетів-моделей на одній сторінці.

---

### 🔹 Сесія 3: Мультимодальні Проекції та Розділення Термінальних Інтерфейсів (CLI vs TUI)
**Мета:** Трансформація Header ➔ Mobile Bottom Bar та відокремлення потокового CLI від повноекранного TUI.
- **Вхідні workflows:** `docs/uk/workflows/ui-cli-standards.md`, `docs/uk/workflows/model-as-app-cli.md`.
- **Задачі:**
  - [ ] **MOB-1**: Правило адаптерної проекції: десктопний `Header` на мобільному стає `Bottom Navigation Bar` під великий палець руки, спираючись на єдину модель `Navigation`.
  - [ ] **TERM-1**: Зафіксувати специфікацію `@nan0web/ui-cli` як виключно потокового генераторного діалогу (stream-based: `stdout`/`stderr`, `ask`, `show`, `progress`) для CLI-утиліт та CI/CD.
  - [ ] **TERM-2**: Специфікація `@nan0web/ui-tui` для повноекранного режиму (Alternate screen buffer, вікна, статус-бар як Midnight Commander / VIBE CLI та миша).
  - [ ] **TERM-3**: Контрактні тести та фінальний `pnpm run test:all`.

---

## 📊 Поточний статус завдань (Task Pool)

- [x] Ініціалізовано паспорт релізу `releases/3/5/v3.5.0/task.md`.
- [x] Ініціалізовано журнал архітектора `releases/3/5/v3.5.0/user.md`.
- [x] Створено контрактний тест `releases/3/5/v3.5.0/task.spec.js` (4/4 tests passed).
- [x] Оновлено `releases/README.md` із занесенням версії v3.5.0.
- [ ] Перейти до виконання задач Сесії 2 (React AppRunner & Scoped UI).
