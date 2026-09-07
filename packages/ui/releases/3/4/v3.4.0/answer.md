# 🏛 Мультимодальні OLMUI Контракти Компонентів (v3.4.0)

> **Статус:** Реалізовано та узгоджено (Завершено)  
> **Концепція:** One Logic — Multiple User Interfaces (OLMUI)  
> **Середовища виконання (Мультимодальність):**  
> 💻 **Terminal (CLI)** | 🌐 **Web (Lit/React/SSR)** | 📱 **Mobile** | ⌚ **Watch (Wearable)** | 🎙️ **Voice (Speech/Audio)** | 💬 **AI Chat / LLM**

---

## 🧭 I. Фундаментальні Принципи OLMUI Контрактів

1. **Семантичний Намір замість DOM-розмітки**:
   - Контракт описує **намір і структуру даних** (Data & Intent), а не специфічні теги браузера чи CSS-властивості.
   - Елемент взаємодії — це семантична дія (`Action`), вибір із множини (`Choice`), текстовий ввід (`Input`), повідомлення (`Alert / Notice`), стан процесу (`Progress`).
2. **Абсолютна платформна агностичність**:
   - Жодних браузеро-специфічних понять у ядрі контрактів (жодних `htmlFor`, `optgroup`, `slot` як DOM-елементів).
   - Замість DOM-слотів використовуються **семантичні зони/регіони** (`regions`: `header`, `navigation`, `main`, `aside`, `footer`).
3. **Чистий JavaScript + JSDoc Typedefs**:
   - 100% типізація через JSDoc для IDE/IntelliSense без сторонніх компіляторів.
   - Незмінні мета-об'єкти (`Object.freeze`) для автоматичних контрактних тестів будь-яких UI-адаптерів.
4. **Матриця мультимодальної адаптації**:
   - Кожен контракт визначає, як він матеріалізується у кожному з 6 ключових інтерфейсних середовищ.

---

## 🗺️ II. Матриця Мультимодальної Адаптації 24 Існуючих Компонентів

Усі компоненти, описані у специфікаціях `packages/ui/docs/uk/**/*.yaml` (5 категорій, 24 компоненти), проектуються на канонічні семантичні контракти та мультимодальні платформи:

| Категорія в docs | Компонент у docs | Контракт ядра (`@nan0web/ui`) | Роль / Намір | CLI (Термінал) | Web (Lit/React) | Mobile | Watch | Voice (Голос) | AI Chat |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Actions** | `Button.yaml` | `ActionContract` (аліас `Button`) | Ініціація дії / команди | Гаряча клавіша / `[Enter]` | Кнопка `<button>` / pill | Тач-кнопка (>=44px) | Тап по екрану | Голосова команда («Збережи») | Quick Reply кнопка |
| **Actions** | `Toggle.yaml` | `ChoiceContract` (тип `boolean`) | Бінарний перемикач | Toggle `[x] / [ ]` | Перемикач-світч | Світч під великий палець | Перемикач у списку | «Увімкнено / Вимкнено» | Текстовий статус перемикача |
| **Data** | `Accordion.yaml` | `SidebarContract` / `Tree` | Розкривний список секцій | Дерево зі стрілками `▶ / ▼` | Розкривні панелі `<details>` | Акордеон-секції | — (поелементний перегляд) | Голосовий список з розкриттям | Нумерований спойлер |
| **Data** | `Badge.yaml` | `BadgeContract` | Статусна мітка / тег | ANSI тег `[STATUS]` | Тег / badge / pill | Компактна мітка | Кольоровий індикатор | Короткий вербальний статус | Мітка `[Статус]` |
| **Data** | `Card.yaml` | `PageContract` / `Container` | Семантичний блок контенту | Рамка навколо блоку (box) | Картка з тінню/межами | Сенсорна картка | Одиночний екран | Зачитування блоку цілком | Окремий блок повідомлення |
| **Data** | `CodeBlock.yaml` | `MarkdownContract` (код) | Підсвічений блок коду | ANSI кольоровий синтаксис | Блок коду з копіюванням | Код з горизонтальним скролом | — | «Блок коду мовою X» | Блок коду з markdown-підсвіткою |
| **Data** | `Markdown.yaml` | `MarkdownContract` | Форматований документ | ANSI форматування тексту | HTML розмітка | Адаптивний текст статті | Саммарі тексту | Синтез мови з паузами | Повідомлення чату |
| **Data** | `Sortable.yaml` | `ChoiceContract` (ordered) | Зміна порядку списку | Переміщення клавішами `K/J` | Drag-and-drop список | Жест перетягування | — | «Перемістити X вище Y» | Команда перестановки |
| **Data** | `Table.yaml` | `TableContract` | Двовимірні табличні дані | ASCII / Unicode таблиця | Адаптивна таблиця | Картковий список рядків | Послідовні значення | Зачитування підсумків | Markdown таблиця |
| **Data** | `Tree.yaml` | `SidebarContract` (ієрархія) | Ієрархічні дані (таксономія) | Дерево папок терміналу | Деревоподібний список | Вкладені екрани (drill-down) | — | Поетапне занурення в рівні | Дерево відступами |
| **Feedback** | `Alert.yaml` | `AlertContract` (Notice) | Важливе повідомлення / callout | Кольорова рамка (warn/err) | Плашка сповіщення | Спливаючий банер | Haptic + іконка | Звук + голосове застереження | Виділений блок `> Увага:` |
| **Feedback** | `Confirm.yaml` | `DialogContract` (Confirm) | Підтвердження дії (y/N) | Запит у терміналі `(y/N)` | Модальний діалог підтвердження | Bottom Sheet «Підтвердити?» | Екран `Так / Ні` | «Ви впевнені? Скажіть так чи ні» | «Ви підтверджуєте? (Так/Ні)» |
| **Feedback** | `Modal.yaml` | `DialogContract` | Фокусування на задачі | Вкладений підрежим CLI | Модальне вікно (popup) | Повноекранний діалог | Моно-екран | Пріоритетний діалог | Діалогова гілка |
| **Feedback** | `ProgressBar.yaml`| `ProgressContract` (лінійний) | Прогрес операції (0..100%) | Текстовий прогрес-бар `[=== ]` | Прогрес-бар з відсотками | Лінійний індикатор | Круговий індикатор | «Завершено 45 відсотків» | Індикатор у повідомленні |
| **Feedback** | `Spinner.yaml` | `ProgressContract` (асинхронний) | Індикатор очікування | Анімований спінер (ora/dots) | Анімований лоадер | Спінер у центрі | Пульсуюча крапка | Звуковий сигнал очікування | «ШІ думає...» |
| **Feedback** | `Toast.yaml` | `AlertContract` (Floating) | Спливаюче сповіщення | Однорядковий статус унизу | Спливаючий тост (auto-hide) | Системний push / snackbar | Короткий вібро-відгук | Коротке звукове підтвердження | Коротке повідомлення-статус |
| **Forms** | `Input.yaml` | `InputContract` | Введення тексту/числа/паролю | Текстовий prompt | Поле `<input>` | Сенсорна клавіатура | Голосовий надиктовувач | Розпізнавання мови (STT) | Очікування відповіді користувача |
| **Forms** | `Autocomplete.yaml`| `ChoiceContract` / `Input` | Вибір із пошуком/підказками | Пошуковий prompt (Tab-complete) | Інпут із підказками / combobox | Інпут із пошуковим дропдауном | — | Голосовий пошук та вибір | Запит з автодоповненням |
| **Forms** | `Select.yaml` | `ChoiceContract` (Dropdown) | Дискретний вибір із переліку | Стрілочний вибір чи цифри | Випадаючий `<select>` | Bottom Sheet зі списком | Коронка прокрутки | Озвучення списку варіантів | Список варіантів вибору |
| **Forms** | `Slider.yaml` | `InputContract` (Range) | Числовий діапазон | Повзунок стрілками `[--*--]` | Повзунок `<input type=range>` | Сенсорний слайдер | Обертання коронки годинника | «Встановіть значення від A до B» | Введення числа в межах |
| **Forms** | `Color.yaml` | `InputContract` (Колір) | Вибір кольору (HEX/RGBA) | ANSI палітра або hex-ввід | Color picker | Сенсорна колірна палітра | — | «Назвіть колір або код» | Вибір із колірних кнопок |
| **Forms** | `Shadow.yaml` | `InputContract` (Ефект) | Налаштування тіней/глибини | Вибір рівня elevation (0..5) | Візуальний селектор тіней | Рівень elevation | — | «Рівень тіні від 1 до 5» | Вибір стилю |
| **System** | `LangSelect.yaml` | `ChoiceContract` (Мова) | Вибір мови локалізації | Меню вибору `[uk / en]` | Мовний перемикач у шапці | Мовний перемикач | — | «Перемкнути на українську» | Команда `/lang uk` |
| **System** | `ThemeToggle.yaml`| `ActionContract` (Тема) | Перемикач теми Dark/Light | Перемикання кольорової схеми | Кнопка день/ніч з іконкою | Перемикач теми | — | «Увімкни темну тему» | Команда `/theme dark` |

---

## 📐 III. Детальна Специфікація Контрактів на JSDoc

### 1. Доменна група: Структура (Structure)

#### 1.1. `PageContract`
Семантичний контейнер документа або екрана застосунку.
```javascript
/**
 * @typedef {Object} PageProps
 * @property {string} [title] - Семантичний заголовок сторінки / екрана
 * @property {string} [description] - Опис для SEO, голосових помічників або доступності
 * @property {string} [lang] - Мовний код ('uk', 'en')
 * @property {string} [theme] - Ідентифікатор теми ('dark', 'light', 'high-contrast')
 */

/**
 * Семантичні зони макета (замість прив'язки до веб-слотів):
 * @typedef {'header' | 'navigation' | 'main' | 'aside' | 'footer'} PageRegion
 */
```

#### 1.2. `NavContract`
Головна навігаційна структура / карта переходів.
```javascript
/**
 * @typedef {Object} NavBrand
 * @property {string} title - Назва бренду / проєкту
 * @property {string} [icon] - Ідентифікатор іконки або логотипу
 * @property {string} [url] - Маршрут переходу на головну
 *
 * @typedef {Object} NavItem
 * @property {string} id - Унікальний ідентифікатор пункту
 * @property {string} label - Текстова мітка для відображення / озвучення
 * @property {string} [url] - Маршрут або команда
 * @property {boolean} [active] - Чи є активним у даний момент
 * @property {string} [icon] - Ідентифікатор іконки
 * @property {string} [shortcut] - Гаряча клавіша або голосовий тригер
 * @property {NavItem[]} [children] - Вкладені пункти підменю
 *
 * @typedef {Object} NavProps
 * @property {NavBrand} [brand]
 * @property {NavItem[]} [items]
 *
 * Події:
 * - 'navigate' ({ id, url, item })
 * - 'toggle' ({ open })
 */
```

#### 1.3. `SidebarContract`
Ієрархічне дерево розділів або навігаційне меню категорій.
```javascript
/**
 * @typedef {Object} SidebarItem
 * @property {string} id
 * @property {string} label
 * @property {string} [url]
 * @property {boolean} [active]
 * @property {string} [icon]
 * @property {SidebarItem[]} [children]
 *
 * @typedef {Object} SidebarProps
 * @property {string} [title] - Заголовок панелі / розділу
 * @property {SidebarItem[]} [items] - Елементи дерева
 *
 * Події:
 * - 'select' ({ item, id })
 * - 'toggle' ({ item, id, open })
 */
```

#### 1.4. `FooterContract`
Завершення контексту (копірайт, допоміжні посилання, системний статус).
```javascript
/**
 * @typedef {Object} FooterLink
 * @property {string} label
 * @property {string} url
 *
 * @typedef {Object} FooterProps
 * @property {string} [copyright]
 * @property {string} [status] - Системний статус (наприклад, стан підключення до мережі)
 * @property {FooterLink[]} [links]
 */
```

---

### 2. Доменна група: Контент та Повідомлення (Content & Feedback)

#### 2.1. `MarkdownContract`
Відображення та структуризація форматованого тексту.
```javascript
/**
 * @typedef {Object} MarkdownProps
 * @property {string} content - Сирий Markdown текст
 * @property {boolean} [toc] - Чи формувати зміст (Table of Contents)
 * @property {string} [baseUrl] - Базовий URL для резолвінгу посилань
 */
```

#### 2.2. `AlertContract` (Notice)
Семантичне сповіщення або попередження.
```javascript
/**
 * @typedef {'info' | 'warn' | 'error' | 'success'} AlertVariant
 *
 * @typedef {Object} AlertProps
 * @property {AlertVariant} [variant='info'] - Рівень важливості сповіщення
 * @property {string} [title] - Опціональний заголовок сповіщення
 * @property {string} content - Тіло повідомлення
 * @property {string} [icon] - Семантична іконка
 * @property {boolean} [dismissible] - Чи може користувач закрити сповіщення
 *
 * Події:
 * - 'dismiss' ()
 */
```

#### 2.3. `BadgeContract`
Компактний індикатор стану, тег або підпис.
```javascript
/**
 * @typedef {'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'} BadgeVariant
 *
 * @typedef {Object} BadgeProps
 * @property {string} label - Текст мітки
 * @property {BadgeVariant | string} [variant='default'] - Стильовий варіант
 * @property {string} [icon] - Опціональна іконка або піктограма
 */
```

#### 2.4. `TableContract`
Двовимірні структуровані табличні дані.
```javascript
/**
 * @typedef {Object} TableColumn
 * @property {string} key - Ключ властивості в об'єкті даних
 * @property {string} label - Назва колонки для шапки/озвучення
 * @property {'left' | 'center' | 'right'} [align='left'] - Вирівнювання даних
 * @property {number} [width] - Відносна чи фіксована ширина
 * @property {'text' | 'number' | 'date' | 'badge'} [type='text'] - Тип відображення
 *
 * @typedef {Object} TableProps
 * @property {TableColumn[]} [columns] - Опис колонок
 * @property {Array<Record<string, any>>} [rows] - Масив даних
 * @property {string} [keyField='id'] - Поле унікального ідентифікатора рядка
 *
 * Події:
 * - 'sort' ({ key, direction: 'asc' | 'desc' })
 * - 'select-row' ({ row, index })
 */
```

---

### 3. Доменна група: Дії та Ввід (Action & Input)

#### 3.1. `ActionContract` (Button)
Ініціація наміру, підтвердження або команда.
```javascript
/**
 * @typedef {'primary' | 'secondary' | 'danger' | 'ghost'} ActionVariant
 * @typedef {'action' | 'submit' | 'cancel'} ActionRole
 *
 * @typedef {Object} ActionProps
 * @property {string} label - Текст дії (для відображення, озвучення або голосової команди)
 * @property {string} [action] - Ідентифікатор наміру (Intent)
 * @property {ActionVariant} [variant='primary']
 * @property {ActionRole} [role='action']
 * @property {boolean} [disabled] - Чи заблокована дія
 * @property {string} [icon] - Іконка
 * @property {string} [shortcut] - Клавіатурне скорочення (напр. 'Enter', 'ctrl+s')
 *
 * Події:
 * - 'trigger' ({ action })
 */
```

#### 3.2. `InputContract`
Вільне введення скалярних даних (текст, число, секрет, пошук).
```javascript
/**
 * @typedef {'text' | 'number' | 'secret' | 'search' | 'multiline'} InputType
 *
 * @typedef {Object} InputProps
 * @property {string} name - Ідентифікатор поля моделі
 * @property {string} [label] - Підпис поля
 * @property {InputType} [type='text'] - Семантичний тип вводу
 * @property {any} [value] - Поточне значення
 * @property {string} [placeholder] - Текст-підказка
 * @property {boolean} [required] - Обов'язковість заповнення
 * @property {boolean} [disabled] - Стан блокування
 * @property {string} [error] - Текст або ключ помилки валідації
 *
 * Події:
 * - 'change' ({ name, value })
 * - 'input' ({ name, value })
 * - 'submit' ({ name, value })
 */
```

#### 3.3. `ChoiceContract` (Select)
Дискретний вибір із множини варіантів.
```javascript
/**
 * @typedef {Object} ChoiceOption
 * @property {string} label - Текстовий опис варіанту
 * @property {any} value - Значення опції
 * @property {string} [hint] - Додаткова підказка (наприклад, для голосового асистента або CLI)
 * @property {boolean} [disabled] - Чи заблокована ця конкретна опція
 *
 * @typedef {Object} ChoiceProps
 * @property {string} name - Ідентифікатор вибору
 * @property {string} [label] - Запитання або заголовок вибору
 * @property {ChoiceOption[]} options - Перелік доступних варіантів
 * @property {any} [value] - Поточне обране значення (або масив значень при multiple)
 * @property {boolean} [multiple] - Дозвіл множинного вибору
 * @property {boolean} [required] - Чи обов'язковий вибір
 * @property {boolean} [disabled] - Чи заблоковано весь компонент
 *
 * Події:
 * - 'change' ({ name, value, selectedOption })
 */
```

---

### 4. Доменна група: Діалог та Прогрес (Dialog & Progress)

#### 4.1. `DialogContract` (Modal)
Фокусування уваги на ізольованому рішенні або підтвердженні.
```javascript
/**
 * @typedef {Object} DialogProps
 * @property {string} title - Заголовок діалогу / запитання
 * @property {string} content - Пояснення або тіло діалогу
 * @property {boolean} [open=true] - Стан видимості
 * @property {ActionProps[]} [actions] - Кнопки/дії (наприклад, «Підтвердити», «Скасувати»)
 *
 * Події:
 * - 'confirm' ()
 * - 'cancel' ()
 */
```

#### 4.2. `ProgressContract` (Spinner / ProgressBar)
Індикація виконання тривалої операції.
```javascript
/**
 * @typedef {Object} ProgressProps
 * @property {number} [value] - Прогрес від 0 до 1 (якщо відомий)
 * @property {number} [total] - Абсолютний тотал (наприклад, кількість файлів)
 * @property {string} [message] - Текстове повідомлення стану
 * @property {'running' | 'paused' | 'success' | 'failed'} [status='running']
 */
```

---

#### 5.1. Поліморфний Синтаксис Опису Полів та Референсів у Моделях
У парадигмі **Model-as-Schema** та **Model-as-App** поле моделі оголошується максимально лаконічно:
1. **Одиничні референси (Relationship)**:
   - `category = { help: 'Category', type: CategoryModel }`
   - `category = { help: 'Category', type: 'model', model: CategoryModel }`
   - Назва колекції цільової моделі автоматично береться з `CategoryModel.$collection || CategoryModel.$alias`, її **не потрібно вказувати в полі** (використання префікса `$` гарантує, що статичні конфігурації не конфліктують із полями екземпляра).
2. **Множинні референси (Has Many)**:
   - `attachments = { help: 'Documents', type: [Attachment] }`
   - `attachments = { help: 'Documents', type: 'array', model: Attachment }`
   - `attachments = { help: 'Documents', type: 'model[]', model: Attachment }`

#### 5.2. `FormContract` та `FormFieldContract`
Чи вистачить нам контрактів для полів форми? Так, вони повністю покривають всі типи:
- **`InputContract`**: скалярний вільний ввід (текст, число, пароль, дата, час, slider, колір).
- **`ChoiceContract`**: вибір із множини (select, dropdown, radio, toggle, autocomplete, зв'язок на одиночну модель).
- **`TableContract`**: зв'язок на множину моделей (`type: [Model]`) або редагування вкладених записів.
- **`MarkdownContract`**: форматований текст / Lexical WYSIWYG.
- **`DialogContract`**: виклик повноцінного модального каталогу вибору (`CatalogView`).

```javascript
/**
 * Одиничний опис опції вибору:
 * @typedef {Object} OptionObject
 * @property {string} label - Текстовий підпис опції для відображення / озвучення
 * @property {any} value - Значення опції (ідентифікатор, примітив або об'єкт)
 * @property {string} [hint] - Додаткова підказка (для голосового помічника, тултипу або CLI опису)
 * @property {boolean} [disabled] - Чи заблокована ця опція для вибору
 * @property {string} [icon] - Іконка опції
 */

/**
 * Асинхронна або синхронна функція-резолвер динамічних опцій:
 * @typedef {(query?: string, ctx?: { db?: any, model?: Function }) => Promise<OptionObject[]> | OptionObject[]} OptionResolver
 */

/**
 * Об'єднаний тип опцій:
 * @typedef {OptionObject[] | OptionResolver} FieldOptions
 */

/**
 * @typedef {Object} FormFieldContract
 * @property {string} name - Назва поля в моделі
 * @property {string} label - Локалізований підпис
 * @property {'Input' | 'Choice' | 'Table' | 'Markdown' | 'Dialog'} contract - Цільовий контракт поля
 * @property {string | Function | Array<Function>} [type] - Базовий тип ('string', 'number', CategoryModel, [Attachment])
 * @property {any} [default] - Дефолтне значення
 * @property {boolean} [required] - Обов'язковість
 * @property {FieldOptions} [options] - Статичні опції або функція-резолвер
 * @property {Function} [model] - Конструктор цільової моделі для референсів
 * @property {boolean} [multiple] - Прапорець множинного вибору (hasMany)
 * @property {string} [hint] - Хінт для вибору кастомного віджета
 * @property {(val: any) => true | string} [validate] - Функція валідації
 */

/**
 * @typedef {Object} FormProps
 * @property {string} [title] - Заголовок форми
 * @property {FormFieldContract[]} fields - Сконвертовані поля моделі
 * @property {Record<string, any>} [initialState] - Початковий стан
 * @property {string} [submitLabel] - Кнопка підтвердження
 * @property {string} [cancelLabel] - Кнопка скасування
 * @property {boolean} [disabled]
 * @property {boolean} [loading]
 *
 * Події:
 * - 'submit' ({ values, modelInstance })
 * - 'change' ({ field, value, values })
 * - 'cancel' ()
 */
```

---

## 🌐 6. Порівняльний Аналіз з Іншими Популярними Платформами

| Критерій / Платформа | **OLMUI (@nan0web/ui)** | **Payload CMS (Lexical/React)** | **Shadcn UI + Radix** | **Odoo / ERPNext** | **Flutter / Compose** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Парадигма ядра** | **Data & Intent First** (агностичні JS-контракти) | Admin-First Config (Node + React) | DOM-First (React + Tailwind) | XML Search/Form View + Python ORM | Widget/Tree First (Dart/Kotlin) |
| **Мультимодальність** | **100% (CLI, Web, Mobile, Watch, Voice, Chat)** | Тільки Web Admin | Тільки Web Browser | Web + спрощений мобільний | Тільки Screen UI (Mobile/Desktop/Web) |
| **Динамічні форми** | Автоматично з `Model-as-Schema` | Автоматично з `CollectionConfig.fields` | Вручну через `react-hook-form` + Zod | Автоматично з Python Model fields | Вручну через Reactive Forms / State |
| **Зв'язки між сутностями** | Поліморфний `Choice` / `Dialog` (`type: Model`) | `relationship` field (`relationTo`) | Custom Async Select Combobox | `Many2one` / `Many2many` Select | Custom Bloc/Repository loader |
| **Zero-Hardcode & i18n** | Strict Model i18n (`t(Model.field)`) | JSON словники в адмінці | `next-intl` через хардкод ключів | `_('String')` gettext у коді | `intl` / `strings.xml` |
| **Рантайм вага** | **0 KB dependencies** (чистий JS) | Повний Next.js/React стек | React + Radix + Tailwind runtime | Важкий JS/Python рантайм | Окремий движок відмальовки (Skia) |

---

## 🏛️ 7. Каталог Компонентів для 99% Бізнес-Додатків (OLMUI Business Matrix)

Щоб покрити **99% потреб бізнес-додатків** (CRM, ERP, Банкінг, E-commerce, Інструменти адміністрування, AI-агенти), система OLMUI контрактів охоплює 6 функціональних модулів:

### Модуль 1: Макет та Навігація (Navigation & Workspace) — 100% покриття
- **`PageContract`**: повноцінний робочий простір з адаптивними регіонами (`header`, `navigation`, `main`, `aside`, `footer`).
- **`NavContract`**: верхній/нижній бар навігації, бренд, глобальні дії.
- **`SidebarContract`**: бічне ієрархічне дерево, навігація по категоріях (`Tree`, `Accordion`).
- **`FooterContract`**: копірайт, статус підключення (Online/Offline/Sync), версія.

### Модуль 2: Збір Даних та Форми (Forms & Inputs) — 100% покриття
- **`FormContract`**: оркестратор динамічної форми (`Model-as-Schema` ➔ `FormFieldContract[]`).
- **`InputContract`**: скалярний ввід (текст, пароль/secret, email, телефон, число, дата/час, діапазон/slider, колір).
- **`ChoiceContract`**: вибір (select, radio, toggle, autocomplete, зв'язок `type: ModelClass`).
- **`ActionContract`**: кнопки дій (`submit`, `cancel`, `action`), комбінації клавіш, голосові тригери.

### Модуль 3: Відображення Даних та Звіти (Data Presentation) — 100% покриття
- **`TableContract`**: реляційні таблиці, сортування, пагінація, фільтри, вибір рядків (`selectIds`), мобільний перегляд картками.
- **`BadgeContract`**: статуси документів (`Pending`, `Paid`, `Failed`, `Active`).
- **`MarkdownContract`**: багатий текст, інструкції, підсвітка коду (`CodeBlock`).
- **`SortableContract`**: упорядкування пріоритетів / черг (drag-and-drop / клавіші K/J).

### Модуль 4: Зворотний Зв'язок та Діалог (Feedback & Interruption) — 100% покриття
- **`AlertContract`**: інформаційні плашки, попередження, плаваючі тости (`Toast`).
- **`DialogContract`**: модальні вікна, підтвердження (`Confirm y/N`), діалогові форми.
- **`ProgressContract`**: лінійні прогрес-бари, спінери завантаження операцій.

---

## 🎯 8. Наступні Кроки Реалізації

1. [ ] Узгодити з Архітектором склад контрактів та семантичні назви.
2. [ ] Оновити файли у `packages/ui/src/Component/contracts/`:
   - `Structure.js`
   - `Content.js`
   - `Interaction.js` (Action, Input, Choice)
   - `Form.js` (Form, FormField)
   - `Dialog.js` (Dialog, Progress)
3. [ ] Створити контрактні тести у `task.spec.js`, що валідують метадані 14 контрактів, мультимодальні властивості, `TargetModel.$collection || TargetModel.$alias` та функцію-резолвер `FieldOptions`.
4. [ ] Оновити документацію `packages/ui/docs/uk/contracts/README.md`.
