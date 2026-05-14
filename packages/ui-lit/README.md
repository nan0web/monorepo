# @nan0web/ui-lit

> Web Components UI Kit on [Lit](https://lit.dev/) — universal, lightweight, data-driven.

## Install

```bash
pnpm add @nan0web/ui-lit
```

## Usage

```html
<script type="module">
  import '@nan0web/ui-lit/packages/core/index.js'
</script>

<ui-button label="Click me" variant="primary"></ui-button>
<ui-alert variant="info" title="Note" content="Hello world"></ui-alert>
```

## Components (26)

### Phase 1 — Core

| Component   | Tag                 | Description       |
| ----------- | ------------------- | ----------------- |
| Nav         | `<ui-nav>`          | Верхня навігація  |
| Sidebar     | `<ui-sidebar>`      | Бокове меню       |
| Alert       | `<ui-alert>`        | Блоки уваги       |
| Markdown    | `<ui-markdown>`     | HTML-рендер       |
| ThemeToggle | `<ui-theme-toggle>` | Перемикач теми    |
| LangSelect  | `<ui-lang-select>`  | Перемикач мови    |
| Badge       | `<ui-badge>`        | Позначки статусів |
| CodeBlock   | `<ui-code-block>`   | Відображення коду |
| Table       | `<ui-table>`        | Таблиці даних     |

### Phase 2 — Forms

| Component | Tag            | Description          |
| --------- | -------------- | -------------------- |
| Input     | `<ui-input>`   | Текстове поле        |
| Select    | `<ui-select>`  | Dropdown вибір       |
| Button    | `<ui-button>`  | Кнопки дії           |
| Toggle    | `<ui-toggle>`  | Перемикач on/off     |
| Confirm   | `<ui-confirm>` | Діалог підтвердження |

### Phase 2 — Structure

| Component | Tag              | Description        |
| --------- | ---------------- | ------------------ |
| Page      | `<ui-page>`      | Responsive layout  |
| Card      | `<ui-card>`      | Картка контенту    |
| Modal     | `<ui-modal>`     | Модальне вікно     |
| Accordion | `<ui-accordion>` | Collapsible секції |
| Toast     | `<ui-toast>`     | Нотифікація        |

### Phase 2 — Advanced

| Component    | Tag                 | Description            |
| ------------ | ------------------- | ---------------------- |
| Spinner      | `<ui-spinner>`      | Індикатор завантаження |
| ProgressBar  | `<ui-progress>`     | Прогрес-бар            |
| Slider       | `<ui-slider>`       | Range slider           |
| Autocomplete | `<ui-autocomplete>` | Автодоповнення         |
| Sortable     | `<ui-sortable>`     | Drag-and-drop          |
| Tree         | `<ui-tree>`         | Ієрархічне дерево      |

### Phase 3 — Form Wrapper

| Component | Tag         | Description        |
| --------- | ----------- | ------------------ |
| Form      | `<ui-form>` | Автогенерація форм |

## Data-Driven Sandbox

The playground is powered by `data/play/index.yaml` — a single source of truth for all component examples, previews, and code snippets. Run:

```bash
pnpm dev
# → http://localhost:4260/e2e/playground.html
```

## Architecture

- **OLMUI** (One Logic, Many UI) — same data layer across `ui-lit`, `ui-react`, `ui-react-bootstrap`
- **LitElement** — Web Components with reactive properties and Shadow DOM
- **Zero external runtime** — only `lit` as dependency
- **209 unit tests + 240 E2E assertions** — comprehensive coverage across Node.js and browser

## License

Private — @nan0web
