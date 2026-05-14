[Read in English](docs/en/system.md)

# 🔍 Детальна Архітектура AppCore + Multi-Renderer System

## 🧩 Основні Принципи Interaction Design System

**1 = 0 + 0'** - це не просто формула, а філософія системи. Кожен компонент створюється як **найдрібніший довірений факт**, що існує самостійно, але у взаємодії з іншими формує **резонанс довіри**.

### Правило: Model as Schema and Model as App

У нашій екосистемі ми керуємося двома пов'язаними патернами:

1. **Model as Schema**: `Model` — це сутий контейнер для даних (типізований через статичні метадані). Її головна роль — нормалізація, валідація, дефолти. Це чиста схема без самостійного середовища виконання.
2. **Model as App**: `AppCore` поводить себе як модель (насичена метаданими), але додає цьому об'єкту **середовище виконання**. Вона здатна _жити_ в оточенні (мати підключену БД, набір перекладів `t`, виконувати тривалі алгоритми у `run()`).

**Важливий постулат**:

- **Не всі схеми/моделі мають бути додатками**. Більшість моделей (наприклад, `UserModel`, `ProjectModel`) залишаються просто структурами даних.
- Але **кожна модель може стати додатком (App)**, якщо з'являється архітектурна потреба наділити її власним контекстом виконання, API та ізольованою бізнес-логікою. У такому разі вона еволюціонує у повноцінний незалежний Use Case.

---

## 🔄 Загальна Архітектура Взаємодії

```mermaid
flowchart TD
    A["AppCore<br>(Ядро)"] -->|є| B["Тільки логіка<br>без UI"]
    A -->|створює| L[Довірений об'єкт<br>знання]

    M[Рендерери] --> N[React]
    M --> O[CLI]
    M --> P[Lit]
    M --> Q[Ionic]
    M --> R[Custom]

    B -->|надає| C[Структура<br>даних $content]
    B -->|визначає| D[API Actions]
    B -->|має| E[Динамічні<br>методи: run, compute]
    B -->|пов'язаний з| F[DB База]

    C -->|обробляється| M
    D -->|викликається| M
    E -->|працює з| F

    R -->|через| S[CustomRendererInterface]
    N -->|використовує| S
    O -->|використовує| S
    P -->|використовує| S
    Q -->|використовує| S

    T[Стилі] --> U[Ядерні<br>основні]
    T --> V[Додаткові<br>на вимогу]

    U -->|зберігається в| W[main.css]
    V -->|зберігається в| X[app.css]

    classDef core fill:#e6f7ff,stroke:#1890ff,color:#333;
    classDef renderer fill:#f6ffed,stroke:#52c41a,color:#333;
    classDef styled fill:#fff7e6,stroke:#fa8c16,color:#333;

    class A,B,F,C,D,E,L core;
    class M,N,O,P,Q,R,S renderer;
    class T,U,V,W,X styled;
```

---

## 📦 Детальна Структура Пакету

```
packages/
└── app.ua/
    ├── core/                # Базова архітектура (без залежності від UI)
    │   ├── src/
    │   │   ├── AppCore.js   # Абсолютно агностичний інтерфейс додатку
    │   │   ├── Renderer.js  # Інтерфейс рендерера для різних UI систем
    │   │   └── index.js
    ├── common/              # Спільні компоненти і стилі
    │   ├── styles/
    │   │   ├── core/        # Ядерні стилі (змінні, типографіка)
    │   │   ├── ui/          # Агностичні компоненти (button, input)
    │   │   └── index.scss   # Експорт основних стилів
    ├── ui/                  # Різні UI реалізації для спільних компонентів
    │   ├── react/           # React-версія спільних компонентів
    │   ├── lit/             # Lit-версія спільних компонентів
    │   └── cli/             # CLI-версія спільних компонентів
    ├── renderers/           # Платформи-рендерери
    │   ├── react/           # Повна React реалізація
    │   ├── cli/             # Повна CLI реалізація
    │   ├── lit/             # Повна Lit реалізація
    │   └── utils/           # Утиліти для рендерерів
    └── apps/                # Конкретні додатки
        ├── currency-calculator/
        │   ├── api/         # Агностичний API (core логіка)
        │   │   ├── App.js   # Імплементація AppCore
        │   │   ├── schemas/ # Валідація схем даних
        │   │   └── index.js
        │   ├── react/       # React-реалізація
        │   ├── cli/         # CLI-реалізація
        │   ├── styles/      # Стилі додатку
        │   │   ├── index.scss
        │   │   └── index.css  (згенеровано)
        │   └── play/        # Експерименти
        └── ...              # Інші додатки
```

---

## 🧩 Компонентна Структура AppCore

```mermaid
classDiagram
    class AppCore {
        <<abstract>>
        +DB db
        +Object data
        +Object meta
        +Function t
        +Object actions
        +String locale

        +constructor(Object options)
        +async bootstrapI18n(String path)
        +state() Object
        +run() Promise~AppResult~
        +static from(input) AppCore
    }

    class CurrencyCalculatorApp {
        +String from
        +String to
        +Number amount
        +Number result
        +String lastUpdated
        +Array ratesTable

        +async run() Promise~AppResult~
        +async convert() Promise~Object~
        +async loadRates() Promise~void~
        +async updateRates() Promise~void~
    }

    AppCore <|-- CurrencyCalculatorApp
```

Ключові особливості:

- **Абсолютна агностичність UI** - AppCore нічого не знає про те, як його рендерять
- **Довірена структура даних** - кожен параметр чітко визначений і перевірений
- **Динамічні методи** - `run()`, `compute()` визначають логіку додатку
- **API Actions** - `this.actions` підключаються до UI через загальний інтерфейс

---

## 🏷️ Стандарт `static UI` для метаданих моделі

Метадані моделі або додатку, які відповідають за її візуалізацію в UI (CLI, Web, Mobile), об'єднуються у статичний об'єкт `static UI`. Цей об'єкт формалізує відображення сутності на рівні моделі.

**Контракт:**

- `title` _(string)_ — Назва моделі або сутності.
- `description` _(string, необов'язково)_ — Опис логіки або цілей цієї моделі.
- `icon` _(string, необов'язково)_ — Emoji або SVG рядок для ідентифікації.

**Приклад (AppCore.js):**

```js
export default class AppCore {
  static UI = {
    title: 'Application Core',
    description: 'Base application logic and state container',
    icon: '⚙️',
  }
}
```

## 🔄 Механізм Рендерерів: Інтерфейс та Зв'язок з AppCore

### CustomRendererInterface (архітектурне ядро)

```js
/**
 * Універсальний інтерфейс рендерера для інтеграції з будь-яким UI.
 * Реалізується кожним спеціфічним рендерером (React, CLI, тощо).
 */
class RendererInterface {
  /**
   * Стандартний способ створення рендерера
   * @param {typeof AppCore} AppClass - Підклас AppCore
   * @param {Object} options
   * @returns {RendererImplementation}
   */
  static create(AppClass, options) {
    // ...
  }

  /**
   * Монтування додатку в задане місце
   * @param {Object} mountOptions - Залежно від UI
   */
  mount(mountOptions) {
    throw new Error('Not implemented')
  }

  /**
   * Рендеринг у текстовий формат (для CLI, статичних сторінок)
   * @returns {string}
   */
  renderToString() {
    throw new Error('Not implemented')
  }

  /**
   * Завантажує специфічні стилі для додатку
   * @param {string} appName
   */
  async loadAppStyles(appName) {
    // ...
  }
}
```

---

## 🌐 Додавання Різних Рендерерів: Архітектурна Діаграма

```mermaid
flowchart LR
    A["AppCore<br>(currency-calculator)"] --> B[RendererInterface]
    B --> C[ReactRenderer]
    B --> D[CLIRenderer]
    B --> E[LitRenderer]
    B --> F[IonicRenderer]

    C --> G[React Components]
    D --> H[Node.js CLI]
    E --> I[Lit Elements]
    F --> J[Ionic Framework]

    subgraph Runtime
        K[main.js] --> L[Router]
        L -->|when needed| M[StyleLoader]
        L -->|when needed| N[RendererSelector]
        M -->|load| O[core/main.css]
        N -->|select| P[ReactRenderer]
    end

    subgraph Styling System
        Q[StyleLoader] --> R["Load core styles<br>(main.css)"]
        Q --> S["Load app styles<br>(app.css) on demand"]
        O -->|always loaded| T[Base UI]
        S -->|on app load| U[App Specific UI]
    end

    classDef core fill:#e6f7ff,stroke:#1890ff,color:#333;
    classDef renderer fill:#f6ffed,stroke:#52c41a,color:#333;
    classDef styled fill:#fff7e6,stroke:#fa8c16,color:#333;

    class A,B,N core;
    class C,D,E,F,P renderer;
    class Q,R,S,O,U styled;
```

---

## 🧱 Розподіл Стилів: Архітектура

### Ієрархія стилів:

```mermaid
flowchart LR
    A["Common Core<br>(завантажується раз)"] --> B["UI Platform<br>(React, Lit, тощо)"]
    B --> C["App Specific<br>(динамічне завантаження)"]
```

### 1. Ядерні стилі (main.css)

- Змінні (кольори, типографіка, відступи)
- Загальні утиліти (flex, grid, відступи)
- Базова типографіка
- Стилі для агностичних компонентів
- Завантажуються один раз при старті

```scss
// common/styles/core/_variables.scss
$primary: #007bff;
$secondary: #6c757d;
$text-color: #212529;
$border-radius: 0.25rem;
$font-family:
  system-ui,
  -apple-system,
  sans-serif;

// Основні токени
$spacing: (
  xs: 0.25rem,
  sm: 0.5rem,
  md: 1rem,
  lg: 2rem,
);
```

### 2. Стилі додатків (app.css)

- Спеціфічні стилі для конкретного додатку
- Завантажуються тільки коли додаток активний
- Можуть бути завантажені динамічно через JS

```scss
// apps/currency-calculator/styles/_calculator.scss
.currency-calculator {
  .conversion-result {
    font-size: 2rem;
    color: $primary;
  }

  .rates-table {
    margin-top: $spacing(md);

    td {
      padding: $spacing(sm);
      border-bottom: 1px solid $secondary;
    }
  }
}
```

---

## 🔗 Механізм Підключення: Архітектурні Патерни

### 1. Агностичне Підключення через API (для логіки)

Підключення до інших додатків відбуваються виключно через інтерфейси.

```js
// main.js
import api from '@ibank/currency-calculator/api'

if (api.middleware) app.use(api.middleware)
if (api.route) app.route(api.route)
```

### 2. Підключення UI через Рендерер (динамічне)

```js
// main.jsx
import { Renderer } from '@ibank/currency-calculator/react'

apps.register('CurrencyCalculator', () => import('@ibank/currency-calculator/react'))
```

---

## 💎 Ключові Архітектурні Рішення

### 1. Розшарування на Чотири Рівні

| Рівень                 | Мета                     | Особливості                                                             |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------- |
| **AppCore**            | Логіка додатку           | Чиста JS, без залежності від UI, може працювати в будь-якому середовищі |
| **Renderer Interface** | Адаптація до UI          | Гнучкий інтерфейс для будь-якого UI фреймворка                          |
| **Platform Renderer**  | Реалізація для платформи | React, CLI, Lit - спеціалізовані реалізації                             |
| **Styles**             | Відображення             | Розділення на ядерні та додаткові стилі                                 |

### 2. Система Завантаження Стилів

```mermaid
flowchart LR
    A[Запит на завантаження] --> B{Тип стилів?}
    B -->|core| C[Завантажити main.css]
    B -->|app| D{Вже завантажено?}
    D -->|Ні| E["Динамічно завантажити<br>app.css через fetch"]
    D -->|Так| F[Нічого не робити]
    E --> G["Додати до DOM<br>link rel=stylesheet"]
    G --> H[Чекати завантаження]
    H --> I[Повідомити рендерер]

    classDef state fill:#f0f0f0,stroke:#333,color:#333;
    classDef decision fill:#cfe8f3,stroke:#0066cc,stroke-width:2px,color:#333;
    classDef action fill:#e6f7ff,stroke:#1890ff,color:#333;

    class B,D decision;
    class C,E,G,H action;
    class A,F,I state;
```

### 3. Розумне Кешування Стилів

- Ядерні стилі (core) - завантажуються один раз
- Стилі додатків - кешуються у Map
- Після першого завантаження - повторне використання
- Інструменти для моніторингу завантажених стилів

---

## 🌟 Переваги Цього Підходу

1. **Відсутність надмірності**: Ліниве завантаження компонентів і стилів
2. **Додаток можна тестувати окремо від UI**:
   ```js
   it("How to run calculator without UI?", () => {
     // Імітуємо тільки логіку
     const app = new CurrencyCalculatorApp({
       db: mockDB,
       locale: "uk",
       data: { amount: 100, from: "USD", to: "UAH" }
     })
     await app.run()
     assert(app.data.result > 0)
   })
   ```
3. **Можливість існування у різних середовищах**:
   - Веб (React, Lit)
   - CLI (Термінал)
   - Native (Ionic)
   - Static (Попередньо згенеровані сторінки)

4. **Стилі завантажуються лише коли потрібні**:
   - Ядерні стилі - при старті
   - Стилі додатків - при відкритті додатку
   - Для CLI взагалі не завантажуються

---

## 📜 Підсумкова Архітектурна Декларація

```
АрхіТехноМаг відповідає
> Оцінка: ✅ Дія.
> Це створює мІр.
> Наступне питання:
> **Чи це існуватиме без примусу, без надмірності — лише зі змістом, необхідним для створення довірених об’єктів знання?**

> тИ: "Так. Це — дзеркало системи: кожен крок доведений, кожен біт має призначення.
> Додаток може існувати у CLI, React, Lit або Ionic - це лише вибір точки входу.
> Але його ядро залишається істинним: 1 = 0 + 0'."

```

Ця архітектура:

- Дозволяє **додавати різні рендерери без змін у ядрі**
- Розділяє стилі на **ядро** та **спеціалізовані**
- Підтримує **лаконічне існування** додатку в будь-якому середовищі
- Створює структуру, яка **не вимагає примусу** для роботи

Перше, що треба реалізувати - **спільний інтерфейс рендерера**, який буде підключати всі різні UI-фреймворки через єдину точку входу, **зберігаючи незалежність логіки додатку від UI**.

---

## 🏆 Golden Standard v2: Model as App (Без AppCore)

Поглиблений аналіз архітектури реальних додатків (`editor.app`, `llimo.app`, `auth.app`, `share.app`) показав, що `AppCore` є надлишковою (legacy) абстракцією. Замість створення окремого великого ядра, **найпростіший та найефективніший стандарт для додатку — це звичайна `Model`**.

Кожен додаток — це просто `Model` (сувора Data-схема), яка розширює свою поведінку методом `run()` та бізнес-логікою. Усі необхідні зовнішні інструменти (БД, переклади, середовище) передаються через гарантований системою другий аргумент `options`.

**Ключові Правила Золотого Стандарту v2:**

1. **Наслідування**: Додаток екстендить базовий `Model` з `@nan0web/core` (`AppCore` поступово виводиться з експлуатації).
2. **State & Metadata**: Усі змінні стану додатку декларуються як `static` поля (Model-as-Schema). Додаток миттєво отримує їх типізацію, валідацію, default limit.
3. **Залежності (Inversion of Control)**: Додаток ніколи не створює `DB` чи `t` самостійно. Вони ін'єктуються ранером через `new AppModel(data, { db, t })`. Доступ іде через вбудований геттер `this.db` або `this._.t`.
4. **Виконання (`run`)**: Додаток гарантує точку входу `run()` (асинхронну або генератор), повертаючи `AppResult` з `$content` блоками OLMUI.

### Еталонний Приклад (Model as App)

```javascript
import { Model, AppResult } from '@nan0web/core'

/**
 * @docs
 * # ClassicApp
 * Демонстрація золотого стандарту v2 побудови додатків на базі Model.
 */
export default class ClassicApp extends Model {
  static UI = {
    title: 'Classic Application',
    description: 'Template for the golden standard v2 app',
    icon: '🥇',
  }

  // 1. Метадані стану (Model-as-Schema)
  static count = { default: 0 }
  static status = { default: 'idle', options: ['idle', 'saved', 'error'] }
  static errorMessage = { default: '' }

  /**
   * @param {object} data - Первинні дані/стан додатку
   * @param {object} options - Залежності середовища (db, t, renderer)
   */
  constructor(data = {}, options = {}) {
    super(data, options)
    // super автоматично розгорне count, status, errorMessage
    // та зробить доступним this.db і this._ (options)
  }

  /**
   * 2. Основна точка входу (Run)
   */
  async run() {
    return new AppResult({
      content: this._renderView(),
    })
  }

  /**
   * 3. Бізнес діюча логіка
   */
  async submit(newCount) {
    const t = this._.t || ((k) => k) // Доступ до t з options

    if (newCount < 0) {
      this.errorMessage = t('Number cannot be negative')
      this.status = 'error'
      return new AppResult({ content: this._renderView() })
    }

    this.count = Number(newCount)
    this.status = 'saved'
    this.errorMessage = ''

    return new AppResult({ content: this._renderView() })
  }

  /**
   * 4. OLMUI Data-Driven Функція Рендеру
   */
  _renderView() {
    const t = this._.t || ((k) => k)

    return [
      {
        form: {
          $class: 'classic-form',
          $onSubmit: (formData) => this.submit(formData.count),
          content: [
            { Input: { type: 'number', value: this.count, name: 'count' } },
            this.status === 'error' && { Alert: this.errorMessage, $variant: 'danger' },
            this.status === 'saved' && { Alert: t('Збережено!'), $variant: 'success' },
            { Button: { $t: 'Зберегти', type: 'submit' } },
          ].filter(Boolean),
        },
      },
    ]
  }
}
```
