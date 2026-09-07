# 🏁 План релізу та наступних кроків — v3.5.0 (Fractal OLMUI & Terminal Separation)

> **Статус:** В процесі планування та декомпозиції  
> **Концепція:** One Logic — Multiple User Interfaces (OLMUI)  
> **Директорії реалізації:** `packages/ui` (`@nan0web/ui`), `packages/ui-cli` (`@nan0web/ui-cli`), `packages/ui-tui` (`@nan0web/ui-tui`)

---

## 🏛 Архітектурна Декомпозиція по Сесіях (Zero-Hallucination Context Strategy)

Щоб уникнути переповнення контексту (Zero-Hallucination Context Strategy згідно з `AGENTS.md`) та не змішувати абстракції, реалізація ділиться на **3 окремі ізольовані сесії (чати)**:

---

### 🔹 Сесія 1: Ядро Моделі та Фрактальний $content (Workspace: `packages/ui`)
**Мета:** Підтримка довільного порядку блоків `$content` у `Document` та розгортання посилань на навігацію.
- **Вхідні workflows:** `docs/uk/workflows/model-schema.md`, `docs/uk/workflows/data-architecture.md`, `docs/uk/workflows/fix.md`.
- **Задачі:**
  - [ ] **DOC-1**: Додати в `Document` та `Content` резолвер посилань для `nav: headerNav` та `nav: { $ref: '#headerNav' }`.
  - [ ] **DOC-2**: Переконатися, що якщо блок у `$content` має значення `true`, він автоматично бере дані однойменного поля з документа (наприклад, `Header: true` бере `this.header`).
  - [ ] **DOC-3**: Додати сценарний контрактний тест `src/domain/DocumentContent.test.js` на рекурсивне розгортання `$content` зверху-вниз.
  - [ ] **DOC-4**: Валідація через `pnpm test` (100% Green).

---

### 🔹 Сесія 2: Мультимодальні Контракти та Мобільна Адаптація (Workspace: `packages/ui`)
**Мета:** Фіксація контракту `ShellContract` / `DocumentContract` та правила трансформації Header Navigation ➔ Mobile Bottom Bar.
- **Вхідні workflows:** `docs/uk/workflows/olm-ui-architecture-adapters.md`, `docs/uk/workflows/release.md`.
- **Задачі:**
  - [ ] **MOB-1**: Зафіксувати в `Structure.js` контракт `DocumentContract` / `ShellContract` як контейнер `$content` замість фіксованих слотів `PageContract`.
  - [ ] **MOB-2**: Описати правила адаптерної проекції: десктопний `Header` на мобільному стає `Bottom Navigation Bar` під великий палець руки, спираючись на єдину модель `Navigation`.
  - [ ] **MOB-3**: Оновити документацію в `packages/ui/docs/uk/contracts/README.md`.
  - [ ] **MOB-4**: Валідація через `pnpm run test:docs` та `pnpm run test`.

---

### 🔹 Сесія 3: Розділення Термінальних Інтерфейсів CLI vs TUI (Workspace: `packages/ui-cli` & `packages/ui-tui`)
**Мета:** Чітке технологічне та пакетне розмежування потокового CLI та повноекранного псевдографічного TUI.
- **Вхідні workflows:** `docs/uk/workflows/ui-cli-standards.md`, `docs/uk/workflows/model-as-app-cli.md`.
- **Задачі:**
  - [ ] **TERM-1**: Зафіксувати специфікацію `@nan0web/ui-cli` як виключно потокового генераторного діалогу (stream-based: `stdout`/`stderr`, `ask`, `show`, `progress`) для CLI-утиліт та CI/CD.
  - [ ] **TERM-2**: Ініціалізувати або виділити концепт `@nan0web/ui-tui` (Terminal User Interface) для повноекранного режиму (Alternate screen buffer, вікна, скрол, статус-бар як Midnight Commander / VIBE CLI та **підтримка подій миші**).
  - [ ] **TERM-3**: Написати контрактні тести взаємодії моделей з TUI-адаптером.

---

## 📊 Поточний статус завдань (Task Pool)

- [x] Очищено зайвий синтаксис JSON Pointer (`#/nav`). Залишено `nav: headerNav` та `nav: { $ref: '#headerNav' }`.
- [x] Оновлено та верифіковано офіційний архітектурний план у `implementation_plan.md`.
- [ ] Виконати Сесію 1: Резолвінг `$content` у `packages/ui`.
- [ ] Виконати Сесію 2: Мультимодальна проекція Mobile Bottom Bar у `packages/ui`.
- [ ] Виконати Сесію 3: Специфікація та відокремлення TUI у `packages/ui-tui`.
