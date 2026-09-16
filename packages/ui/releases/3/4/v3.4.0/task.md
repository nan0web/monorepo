---
version: 3.4.0
type: feature
status: completed
locale: uk
models: ["PageContract", "NavContract", "SidebarContract", "FooterContract", "MarkdownContract", "AlertContract", "BadgeContract", "TableContract", "ActionContract", "InputContract", "ChoiceContract", "FormContract", "DialogContract", "ProgressContract"]
---

# 🏛 Mission: Універсальні Мультимодальні Контракти UI-Компонентів у @nan0web/ui (v3.4.0)

## 🏁 Overview (Огляд)
Створення єдиного джерела правди (Single Source of Truth) для специфікацій базових UI-компонентів платформи на рівні `@nan0web/ui/components`. Справжні OLMUI контракти визначають семантичну схему наміру, вхідних параметрів (props), регіонів (regions) та подій (events) для всіх можливих середовищ взаємодії:
- 💻 **Terminal / CLI**: текстовий інтерфейс, ASCII таблиці, меню.
- 🌐 **Web**: HTML / Lit / React / SSG розмітка.
- 📱 **Mobile**: тач-інтерфейс, bottom bar, жести.
- ⌚ **Watch**: мікро-екран, коронка/скрол, вібро-відгук (haptic).
- 🎙️ **Voice**: синтез та розпізнавання мови, звукові повідомлення.
- 💬 **AI Chat / LLM**: діалогове опитування, текстовий генератор повідомлень.

## 👥 User Stories (Сценарії)
- Як розробник платформи, я хочу мати чіткий машинно- та людиночитаний контракт для кожного UI-компонента, щоб гарантувати сумісність між різними UI-адаптерами без прив'язки до DOM-специфіки.
- Як розробник сторінок та агентів, я хочу описувати інтерфейси декларативно через `$content` або генератори `Intent` у повній відповідності до контрактів.
- Як тестувальник, я хочу автоматично перевіряти відповідність реалізацій у `@nan0web/ui-lit`, `@nan0web/ui-cli` та інших адаптерах через єдині контрактні тести.

## 🏗 Component Contracts (Специфікація Мультимодальних Контрактів)

### 1. Лейаут та Структура (Structure)
- **`PageContract`**:
  - `props`: `{ title?: string, description?: string, lang?: string, theme?: string }`
  - `regions`: `['header', 'navigation', 'main', 'aside', 'footer']`
- **`NavContract`**:
  - `props`: `{ brand?: { title: string, icon?: string, url?: string }, items?: Array<{ id: string, label: string, url?: string, active?: boolean, icon?: string, shortcut?: string, children?: Array }> }`
  - `events`: `['navigate', 'toggle']`
- **`SidebarContract`**:
  - `props`: `{ title?: string, items?: Array<{ id: string, label: string, url?: string, active?: boolean, icon?: string, children?: Array }> }`
  - `events`: `['select', 'toggle']`
- **`FooterContract`**:
  - `props`: `{ copyright?: string, status?: string, links?: Array<{ label: string, url: string }> }`

### 2. Контент та Повідомлення (Content & Feedback)
- **`MarkdownContract`**:
  - `props`: `{ content: string, toc?: boolean, baseUrl?: string }`
- **`AlertContract` (Notice)**:
  - `props`: `{ variant?: 'info' | 'warn' | 'error' | 'success', title?: string, content: string, icon?: string, dismissible?: boolean }`
  - `events`: `['dismiss']`
- **`BadgeContract`**:
  - `props`: `{ label: string, variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | string, icon?: string }`
- **`TableContract`**:
  - `props`: `{ columns?: Array<{ key: string, label: string, align?: 'left' | 'center' | 'right', width?: number, type?: string }>, rows?: Array<Record<string, any>>, keyField?: string }`
  - `events`: `['sort', 'select-row']`

### 3. Дії та Ввід (Action & Input)
- **`ActionContract` (Button)**:
  - `props`: `{ label: string, action?: string, variant?: 'primary' | 'secondary' | 'danger' | 'ghost', role?: 'action' | 'submit' | 'cancel', disabled?: boolean, icon?: string, shortcut?: string }`
  - `events`: `['trigger']`
- **`InputContract`**:
  - `props`: `{ name: string, label?: string, type?: 'text' | 'number' | 'secret' | 'search' | 'multiline', value?: any, placeholder?: string, required?: boolean, disabled?: boolean, error?: string }`
  - `events`: `['change', 'input', 'submit']`
- **`ChoiceContract` (Select)**:
  - `props`: `{ name: string, label?: string, options: FieldOptions, value?: any, multiple?: boolean, required?: boolean, disabled?: boolean }`
  - `events`: `['change']`

### 4. Динамічні Модельні Форми (Form)
- **`FormContract`**:
  - `props`: `{ title?: string, fields: FormFieldContract[], initialState?: Record<string, any>, submitLabel?: string, cancelLabel?: string, disabled?: boolean, loading?: boolean }`
  - `events`: `['submit', 'change', 'cancel']`

### 5. Діалог та Прогрес (Dialog & Progress)
- **`DialogContract` (Modal)**:
  - `props`: `{ title: string, content: string, open?: boolean, actions?: Array<any> }`
  - `events`: `['confirm', 'cancel']`
- **`ProgressContract` (Spinner / ProgressBar)**:
  - `props`: `{ value?: number, total?: number, message?: string, status?: 'running' | 'paused' | 'success' | 'failed' }`

## 🎯 Scope (Задачі)
- [x] Оновити контракти в `src/Component/contracts/` відповідно до мультимодальної специфікації.
- [x] Додати нові контракти: `ActionContract` (з аліасом `ButtonContract`), `ChoiceContract` (з аліасом `SelectContract`), `FormContract`, `DialogContract`, `ProgressContract`.
- [x] Оновити експорти через `@nan0web/ui/components` та головний `index.js`.
- [x] Оновити контрактні тести у `releases/3/4/v3.4.0/task.spec.js` та переконатися у їх проходженні.
- [x] Додати гетер `$db` у базовий `ModelAsApp` з локалізованою помилкою через `this._.t(this.constructor.UI.errorNoDb)`.
- [x] Створити живий виконуваний рецепт `docs/uk/recipes/model-as-app.js` та оновити посилання в `docs/uk/workflows/model-as-app.md`.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести `task.spec.js` успішно проходять (`pnpm test`).
- [x] Кожен контракт має повний JSDoc-опис властивостей, ролей та подій.
- [x] Контракти підтримують мультимодальну адаптацію для 6 середовищ (CLI, Web, Mobile, Watch, Voice, Chat).
- [x] Документація `packages/ui/docs/uk/contracts/README.md` актуалізована та перевірена.
- [x] Перевірка типів `pnpm run test:types` успішна (код 0) без генерації `.d.ts` у релізах.
- [x] `pnpm run build` генерує `.d.ts` виключно для робочих модулів `src/**/*.js` без тестів.
- [x] Дані релізу зберігаються виключно у форматі `.nan0` та слугують єдиним джерелом для рендерингу будь-якого UI (Web, CLI тощо) без копіювання HTML або кастомного коду.
- [x] Контрактний тест перевіряє `model.$db` при наявності `this._.db` та викидання `errorNoDb` при відсутності.
- [x] Скрипт `docs/uk/recipes/model-as-app.js` запускається та повертає успішний `result({ ok: true })`.

