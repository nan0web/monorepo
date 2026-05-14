# Системна інструкція system.md / NaN•Web UI Lit

_Minimal · Modular · Literal · Universal · Zero-Build_

> 🔧 Pure **JavaScript (no TS in runtime)**, **Vite-powered**, **ESM-first**, **Lit-based**, **fully tree-shakeable UI components** for the modern web.

---

## 🧩 Філософія

> **"Менше — це більше."**  
> Кожен компонент — самодостатній, читабельний, зрозумілий, tree-shakeable, без залежностей, без компіляції.

- ✅ Пиши на **JavaScript**
- ✅ Підключай **окремі компоненти**
- ✅ Використовуй **типи через `.d.ts`**
- ✅ Немає збірок в бібліотеці — **все ESM, "as-is"**
- ✅ Працює з **Vite, Webpack, Rollup, CDN, Deno, Bun**
- ✅ Працює з **React, Vue, Svelte, Alpine, чистим HTML**

---

## 🏛 Архітектура: Data-Driven UI (AST & Компоненти)

> **Будь-яка UI-бібліотека (`ui-lit`, `ui-react`, `ui-cli`) є лише інтерпретатором (рендер-рушієм) структури даних (JSON/YAML).**

Ми будуємо **Model-Driven (Data-Driven)** систему. Це означає, що логіка і структура лежать у даних (MD з Frontmatter або YAML/JSON), а інтерфейс їх лише мапить у візуальне або текстове середовище.

### Базові Принципи Рендерингу `$content`:

1. **Базовий контент — це стандартні HTML-теги**:
   - Ми **не вигадуємо** абстрактні типи на кшталт `heading` або `paragraph`.
   - Замість цього ми використовуємо семантичні імена як типи вузлів: `h1`, `p`, `ul`, `ol`, `li`, `blockquote`.
   - Це дозволяє зберегти семантику браузера та легкість коду, а `ui-react` чи `ui-lit` зможуть мапити їх безпосередньо в `<h1 class="...">`.

2. **Реєстр Компонентів та Аліаси (Component Registry)**:
   - Всі вузли (як стандартні теги, так і специфічні `App.Auth.SignUp`, `ui-page`) лежать в єдиному масиві AST.
   - Рекурсивний рендер-луп (`_renderItem`) перебирає масив і шукає компонент у **Локальному Реєстрі (Alias Registry)**.
   - **Вирішення колізій (Scoped Configuration)**: Щоб уникнути конфліктів просторів імен між розробниками (наприклад, два різних `chat.app`), застосунок сам розподіляє мікро-додатки під час ініціалізації:

     ```javascript
     import { uiLitApp } from '@nan0web/ui-lit'
     import yaroChatManifest from 'yaro-chat.app'

     // AST ключ "App.Chat.*" буде рендерити компоненти з yaroChat
     uiLitApp.registerApps({
       Chat: yaroChatManifest,
     })
     ```

     Завдяки цьому ми тримаємо AST декларативним і коротким, а браузерні Web Components (напр. `<yaro-chat-window>`) реєструються динамічно без ризику колізій у глобальному `customElements`.

3. **Плоскі пропси (без `options`) та Data Binding**:
   - Всі налаштування компонента передаються як ключі самого об'єкта (напр. `showSidebar: false`), щоб уникнути зайвого вкладення `options`.
   - Ключ `data` містить дочірні вузли. Замість величезних вкладених дерев, рутові компоненти типу `ui-page`, можуть автоматично підтягувати дітей зі змінної документа.
   - **Два рівні рендеру**:
     - `$content` — верхній рівень абстракції (layout/middleware), задає "оболонку" (напр. `ui-header`, `ui-page`). Зазвичай це спільний масив для застосунку і він використовується лише головним рендером.
     - `content` — власне контент самої сторінки (те, що парситься з Markdown або лежить у полі `content` конкретної сторінки).

### Приклад YAML-Схеми (AST):

```yaml
# Це конфігурація відображення (верхній рівень), вона вирішує ЯК рендерити.
$content:
  - ui-header: true
  - ui-page:
      showSidebar: false
      # Неявний (автоматичний) data binding: ui-page візьме масив із `doc.content` нижче.

# А це дані (нижній рівень), вони вирішують ЩО рендерити.
title: 'Головна сторінка'
content:
  - h1.gradient-text: 'Воля — це не дар. Це навичка.'
  - p: 'Ласкаво просимо до willni.'
  - App.Auth.SignUp: true
```

---

## 📦 Структура пакетів (npm)

```
@nan0web/ui-lit/
├── core    — базові компоненти: alert, card, button, spinner
├── form    — поля, форми, автогенерація, валідація
├── auth    — вхід, реєстрація, 2FA, відновлення
├── edit    — WYSIWYG, динамічні форми, на основі моделей
├── theme   — CSS Custom Properties (без префіксу `ui-`)
├── i18n    — локалізація, `t()`, `ui-lang`, `setLocale()`
```

> ✅ Кожен пакет — **4 символи**, крім `theme` (6) — дуже рідкісне ім’я, без конфліктів.

---

## 🔌 Імпорт — простий, модульний

```js
import '@nan0web/ui-lit/core/alert.js'
import '@nan0web/ui-lit/form/input.js'
import '@nan0web/ui-lit/form/form.js'
```

> ✅ Ніяких збірок.  
> Кожен файл — чистий ES-модуль.  
> Це **не потрібно збирати** — він вже є ESM.

---

## 🧱 Компоненти — окремо, без залежностей

Кожен компонент — `.js` файл, який:

- Розширює `LitElement`
- Має `customElements.define(...)`, лише якщо такого тега ще немає
- Використовує тільки те, що явно імпортовано
- Має `.d.ts` для підказок IDE

### Приклад: `form/input.js`

```js
import { LitElement, html } from 'lit'
import '@nan0web/ui-lit/theme' // ← гарантує, що стилі є
import { t } from '@nan0web/ui-lit/i18n'

class UIInput extends LitElement {
  static properties = {
    name: { type: String },
    type: { type: String, reflect: true },
    label: { type: String },
    value: { type: String },
    required: { type: Boolean },
    placeholder: { type: String },
    options: { type: Array },
  }

  constructor() {
    super()
    this.type = 'text'
    this.required = false
  }

  render() {
    // Логіка для різних типів — switch, але без додаткових імпортів
    if (this.type === 'checkbox') {
      return html`
        <label class="flex items-center gap pa-sm">
          <input type="checkbox" .checked=${this.value} @change=${this._onChange} />
          <span><slot>${this.label}</slot></span>
        </label>
      `
    }

    return html`
      <label>
        ${this.label ? html`<div class="label">${this.label}${this.required ? '*' : ''}</div>` : ''}
        <input
          .type=${this.type}
          .value=${this.value || ''}
          placeholder=${this.placeholder || ''}
          ?required=${this.required}
          @input=${this._onInput}
        />
      </label>
    `
  }

  _onInput(e) {
    this.value = e.target.value
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
  }

  _onChange(e) {
    this.value = e.target.checked
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
  }
}

if (!customElements.get('ui-input')) {
  customElements.define('ui-input', UIInput)
}

export default UIInput
```

> ✅ Якщо ти імпортуєш `input.js` — у бандл потрапляє **тільки цей клас**, без решти.

---

## 📝 Форми: лаконічні, автогенеровані

### Клас описує форму

```js
// my-forms.js
import { UIForm } from '@nan0web/ui-lit/form'

class ContactForm extends UIForm {
  name = ''
  email = ''
  agree = false

  get emailLabel() {
    return 'Електронна пошта'
  }
  get emailType() {
    return 'email'
  }
  get emailRequired() {
    return true
  }

  get agreeLabel() {
    return 'Я погоджуюся з умовами'
  }
  get agreeType() {
    return 'checkbox'
  }
  get agreeRequired() {
    return true
  }

  get emailValidate() {
    return (value) => (value?.includes('@') ? null : t('input.invalid.email'))
  }
}
```

### Використання: без `.schema`

```html
<ui-form .value="${this.form}" @formSubmit="${this.onSubmit}"></ui-form>
```

> ✅ `<ui-form>` робить:
>
> ```js
> this.schema = this.value?.constructor
> ```
>
> Подальша автогенерація полів — на основі властивостей класу та getter'ів.

---

## 🌍 Локалізація: `@nan0web/ui-lit/i18n`

```js
import { t } from '@nan0web/ui-lit/i18n'

t('form.submit') // → "Надіслати"
t('input.required', { field: 'Ім’я' }) // → "Поле «Ім’я» обов’язкове"
```

- Переклади у `src/i18n/messages/*.json` (`uk.json`, `en.json`, `pl.json`)
- Автоматична визначення мови
- `<ui-lang lang="en">` — змінює контекст нащадків

---

## 🎨 Стилі: `@nan0web/ui-lit/theme`

### Нульовий JS, тільки CSS

Короткі, лаконічні, не конфліктують:

```css
/* theme.css */
:root {
  --ra-sm: 4px;
  --ra-md: 8px;
  --ra-lg: 12px;
  --ra-xl: 16px;
  --ra-round: 50%;

  --co: #005fcc; /* primary */
  --co-on: white; /* on primary */
  --co-danger: #d32f2f;
  --co-success: #2e7d32;

  --ba: white; /* background */
  --ba-surface: #f8f9fa;
  --ba-overlay: rgba(0, 0, 0, 0.4);

  --pa-xs: 4px;
  --pa-sm: 8px;
  --pa-md: 16px;
  --pa-lg: 24px;

  --ma-sm: 8px;
  --ma-md: 16px;
}
```

```js
// theme.js — імпортує CSS
import './theme.css'

// нічого більше не робить
// просто гарант, що стилі завантажені
```

> Імпортуй **один раз** у додатку:
>
> ```js
> import '@nan0web/ui-lit/theme'
> ```

> ✔️ Все решта використовує `--co`, `--ra-md`, `--pa-sm` — **без JS-логіки**.

---

## 🌗 Темна тема: підтримка ОС

```css
@media (prefers-color-scheme: dark) {
  :root {
    --co: #4dabf7;
    --ba: #121212;
    --ba-surface: #1e1e1e;
    color: #e0e0e0;
  }
}
```

> Або:
>
> ```html
> <html class="theme-dark"></html>
> ```
>
> — з можливістю керування через `<ui-theme>`:
> `<ui-theme mode="dark|light|system">` для керування темою через JS.

---

## 📂 Без збірок в `ui-lit` — навіщо?

- Всі файли — **чистий, сумісний ES-модульний JavaScript**
- Немає TypeScript у рантаймі — тільки `.d.ts` для IDE
- Немає Babel, Webpack, Rollup — **все працює "як є"**
- Компілюється **фінальним додатком** (Vite, esbuild тощо)

> ✅ Ти робиш:
>
> ```bash
> git clone git@github.com:nan0web/ui-lit.git
> ```
>
> і використовуєш прямо:
>
> ```js
> import '@nan0web/ui-lit/form/input.js'
> ```

> Навіть **CDN**:
>
> ```html
> <script type="module">
>   import 'https://cdn.jsdelivr.net/npm/@nan0web/ui-lit@1/core/alert.js'
> </script>
> ```

---

## 🧩 Повний контроль

- Хочеш кастомну форму? Пиши `<ui-input>` вручну.
- Хочеш автогенерацію? Передай `.value` з класу.
- Хочеш свою тему? Перевизнач `--co`, `--ra-md`.
- Хочеш свою мову? Додай `el.json` + `setLocale('el')`.

**Без обов’язкових рішень. Без затиснень.**

---

## 🔐 Авторизація: `@nan0web/ui-lit/auth`

```html
<ui-auth form="signup"></ui-auth>
<ui-auth form="signin"></ui-auth>
<ui-auth form="reset-password"></ui-auth>
```

- Використовує `@nan0web/auth-client` для сесій
- Підтримує 2FA, OAuth-провайдери
- Дані відправляються через `fetch`
- Перед відправкою — валідація на клієнті

---

## ✍️ Редактори: `@nan0web/ui-lit/edit`

- `<ui-edit>` — WYSIWYG редактор (на базі `Tiptap` або `Lexical`, або власного)
- `<ui-dynamic-form>` — формує форму з `Form` класу без `<ui-form>`
- `<ui-markdown-view>` — перегляд Markdown

> Усе — на тих самих принципах: ESM, без збірки, tree-shakeable.

---

## 🧾 Конфлікти: малоймовірні

| Проблема            | Рішення                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `--co`, `--ra`      | Ймовірність колізії — близька до нуля. Немає стандартних `--co` в CSS. |
| `ui-*` теги         | Унікальний префікс. Немає в стандартах HTML.                           |
| Подвійна реєстрація | `if (!customElements.get('ui-input')) { define }`                      |
| `i18n` пакет        | Використовує `@lit/localize`, але може бути легковажним фолбеком       |

---

## ✅ Наступні кроки (для NaN•Web)

1. [+] Створити репозиторій `nan0web/ui-lit`
2. [+] Додати `packages/core`, `form`, `auth`, `edit`, `theme`, `i18n`
3. [ ] Кожен — з `package.json`, `.js`, `.d.ts`, `README.md`
4. [ ] Розмістити на npm: `@nan0web/ui-lit/core@^1.0.0` і т.д.
5. [ ] Додати демо-сторінку на `ui-lit.nan0web.org`

---

> ✨ **NaN•Web UI Lit** — це **не фреймворк**.  
> Це **інструментарій**, який дозволяє тобі **побудувати інтерфейс без зайвого коду**.

---

🚀 **Модульно. Просто. Без збірок. Зрозуміло.**

`@nan0web/ui-lit — Build the web, as it should be.`

---

## 🧪 Стратегія тестування

### 3 рівні тестів

| Рівень         | Скрипт          | Що тестує                           | Середовище              |
| -------------- | --------------- | ----------------------------------- | ----------------------- |
| Unit           | `pnpm test`     | Клас, CSS, properties, методи       | Node.js (`node --test`) |
| E2E In-Browser | `pnpm test:e2e` | Рендеринг, Shadow DOM, events, a11y | Реальний браузер        |
| CI Headless    | `pnpm test:ci`  | Те ж саме, автоматизовано           | Playwright headless     |

### Архітектурне рішення: In-Browser як Primary E2E

> Web Component живе у браузері — тож і тестуй його в браузері.
> Тестувати Shadow DOM у Node.js — це ставити ремісника на чуже ремесло.

**In-browser тести** (`e2e/e2e-smoke.js`) запускаються прямо на сторінці пісочниці:

- **237 асертів**, 25 компонентів, ~800ms час виконання
- Прямий доступ до `shadowRoot`, подій, CSS Computed Styles
- Sticky результат-бар + розгортаюча detail panel
- Нуль залежностей — чистий JavaScript

**CI Headless** (`e2e/ci-runner.js`) — мінімальний скрипт (~50 рядків), що:

1. Відкриває `playground.html` в headless Chromium
2. Чекає на `#e2e-results`
3. Читає `data-passed` / `data-failed`
4. Виходить з кодом 0 або 1

```bash
# Щоденна робота — відкрити браузер і побачити результат
pnpm dev &
pnpm test:e2e

# CI/CD — автоматична перевірка
pnpm test:ci
```

### Чому не чистий Playwright?

- Playwright з Web Components + Shadow DOM потребує `page.evaluate()` для кожної перевірки
- Це **сериалізація/десериалізація** через CDP — втрата точності
- Bootstrap browsers = +300MB, +120s bootstrap time
- In-browser дає **пряме спостереження** без посередників

---

📝 system.md / v1.0-final — Ready for implementation.
