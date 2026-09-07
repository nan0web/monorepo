# 📜 Специфікація Контрактів UI-Компонентів (@nan0web/ui/components)

Цей документ описує універсальні контракти компонентів у `@nan0web/ui` (v3.4.0). Контракти визначають єдине машинно- та людиночитане джерело правди (Single Source of Truth) для намірів (intents), вхідних параметрів (props), регіонів (regions) та подій (events) для всіх адаптерів платформи:
- 💻 **Terminal / CLI**: текстовий інтерфейс, ASCII таблиці, TTY меню.
- 🌐 **Web**: HTML / Lit / React / SSG розмітка.
- 📱 **Mobile**: тач-інтерфейс, bottom bar, жести.
- ⌚ **Watch**: мікро-екран, коронка/скрол, вібро-відгук (haptic).
- 🎙️ **Voice**: синтез та розпізнавання мови, звукові повідомлення.
- 💬 **AI Chat / LLM**: діалогове опитування, текстовий генератор повідомлень.

Контракти побудовані на чистому JavaScript з використанням **JSDoc `@typedef`** для забезпечення 100% типізації без рантайм-залежностей.

---

## 📑 Зміст

1. [Лейаут та Структура (Structure Contracts)](#1-лейаут-та-структура-structure-contracts)
   - [PageContract](#pagecontract)
   - [NavContract](#navcontract)
   - [SidebarContract](#sidebarcontract)
   - [FooterContract](#footercontract)
2. [Контент та Звіти (Content Contracts)](#2-контент-та-звіти-content-contracts)
   - [MarkdownContract](#markdowncontract)
   - [AlertContract](#alertcontract)
   - [BadgeContract](#badgecontract)
   - [TableContract](#tablecontract)
3. [Дії та Ввід (Interaction Contracts)](#3-дії-та-ввід-interaction-contracts)
   - [ActionContract (ButtonContract)](#actioncontract-buttoncontract)
   - [InputContract](#inputcontract)
   - [ChoiceContract (SelectContract)](#choicecontract-selectcontract)
4. [Оркестрація Форм (Form Contracts)](#4-оркестрація-форм-form-contracts)
   - [FormContract & FormFieldContract](#formcontract--formfieldcontract)
   - [Типізація FieldOptions (OptionObject / OptionResolver)](#типізація-fieldoptions)
   - [Підтримка $collection та $alias](#підтримка-collection-та-alias)
5. [Діалог та Прогрес (Dialog & Progress Contracts)](#5-діалог-та-прогрес-dialog--progress-contracts)
   - [DialogContract (ModalContract)](#dialogcontract-modalcontract)
   - [ProgressContract](#progresscontract)
6. [Порівняльний Аналіз з Іншими Платформами](#6-порівняльний-аналіз-з-іншими-платформами)
7. [Каталог для 99% Бізнес-Додатків (Business Matrix)](#7-каталог-для-99-бізнес-додатків-business-matrix)

---

## 1. Лейаут та Структура (Structure Contracts)

### `PageContract`
Описує головний контейнер сторінки або екрана (хедер, навігація, основний контент, бічна панель, підвал).
- **Props**:
  - `title?: string` — Заголовок сторінки / екрана.
  - `lang?: string` — Мовний код сторінки (напр. `'uk'`, `'en'`).
  - `theme?: string` — Ідентифікатор теми оформлення (напр. `'dark'`, `'light'`).
- **Regions (Семантичні зони замість DOM-слотів)**:
  - `'header'`, `'navigation'`, `'main'`, `'aside'`, `'footer'`
- **Slots**: `['nav', 'sidebar', 'default', 'footer']`
- **Events**: немає.

### `NavContract`
Описує верхню/нижню навігаційну панель із підтримкою бренду та посилань.
- **Props**:
  - `brand?: { title: string, logo?: string, url?: string }` — Інформація про бренд / логотип.
  - `items?: Array<{ id: string, label: string, url?: string, active?: boolean, icon?: string, shortcut?: string, children?: Array }>` — Список пунктів навігації.
- **Events**:
  - `'navigate'` — Спрацьовує при переході за посиланням.
  - `'toggle-menu'` — Спрацьовує при відкритті/закритті мобільного меню.

### `SidebarContract`
Ієрархічне дерево меню розділів (покриває `Tree` та `Accordion`).
- **Props**:
  - `title?: string` — Заголовок бічної панелі.
  - `items?: Array<{ id: string, label: string, url?: string, active?: boolean, icon?: string, children?: Array }>` — Елементи дерева.
- **Events**:
  - `'select'` — Спрацьовує при виборі пункту меню.
  - `'toggle'` — Спрацьовує при розгортанні/згортанні підгрупи.

### `FooterContract`
Підвал сторінки з авторськими правами, статусом підключення та посиланнями.
- **Props**:
  - `copyright?: string` — Текст копірайту.
  - `status?: string` — Системний стан (Online/Offline/Sync).
  - `links?: Array<{ label: string, url: string }>` — Набір посилань у футері.

---

## 2. Контент та Звіти (Content Contracts)

### `MarkdownContract`
Рендерер Markdown-контенту з підтримкою безпечної розмітки та підсвітки коду (`CodeBlock`).
- **Props**:
  - `content: string` — Сирий Markdown-текст.
  - `toc?: boolean` — Чи формувати зміст (Table of Contents).
  - `baseUrl?: string` — Базовий URL для відносних шляхів.

### `AlertContract`
Універсальний блок виклику/повідомлення (Callout, Notice, Toast).
- **Props**:
  - `variant?: 'info' | 'warn' | 'warning' | 'error' | 'err' | 'danger' | 'success' | 'ok' | 'tip'` — Стильовий варіант.
  - `title?: string` — Опціональний заголовок.
  - `content: string` — Текст повідомлення.
  - `open?: boolean` — Стан видимості.
  - `icon?: string` — Користувацька іконка або SVG.
- **Events**:
  - `'close'` — Спрацьовує при закритті користувачем.

### `BadgeContract`
Компактний бейдж або тег статусу.
- **Props**:
  - `label: string` — Текст бейджа.
  - `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | string` — Кольоровий варіант.

### `TableContract`
Відображення табличних даних із сортуванням та вибором.
- **Props**:
  - `columns?: Array<{ key: string, label: string, align?: 'left' | 'center' | 'right', width?: number, type?: string }>` — Специфікація колонок.
  - `rows?: Array<Record<string, any>>` — Рядки даних.
  - `keyField?: string` — Унікальне поле-ідентифікатор для рядка.
- **Events**:
  - `'sort'` — Сортування за колонкою.
  - `'row-click'` — Клік по рядку.

---

## 3. Дії та Ввід (Interaction Contracts)

### `ActionContract` (ButtonContract)
Інтерактивна кнопка дії, швидка команда або голосовий тригер.
- **Props**:
  - `label: string` — Текст дії.
  - `action?: string` — Ідентифікатор наміру (Intent).
  - `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'brand' | 'default'` — Варіант оформлення.
  - `role?: 'action' | 'submit' | 'cancel'` — Семантична роль.
  - `disabled?: boolean` — Стан блокування.
  - `icon?: string` — Назва іконки або SVG markup.
  - `shortcut?: string` — Клавіатурне скорочення або голосовий тригер.
- **Events**:
  - `'trigger'`, `'click'` — Виклик дії.

### `InputContract`
Поле вільного вводу скалярних даних (текст, пароль, число, слайдер, колір).
- **Props**:
  - `name: string` — Ідентифікатор поля форми в моделі.
  - `label?: string` — Підпис поля.
  - `type?: 'text' | 'number' | 'secret' | 'search' | 'multiline' | 'email' | 'tel' | 'url' | 'password' | string` — Тип вводу.
  - `value?: any` — Поточне значення.
  - `placeholder?: string` — Текст-підказка.
  - `required?: boolean` — Чи обов'язкове поле.
  - `disabled?: boolean` — Чи заблоковане поле.
  - `error?: string` — Повідомлення або ключ помилки валідації.
- **Events**:
  - `'change'`, `'input'`, `'submit'`, `'focus'`, `'blur'`.

### `ChoiceContract` (SelectContract)
Дискретний вибір із множини (select, dropdown, radio, toggle, autocomplete, зв'язок на модель).
- **Props**:
  - `name: string` — Ідентифікатор поля.
  - `label?: string` — Підпис або запитання.
  - `options: FieldOptions` — Опції вибору (масив або динамічна функція-резолвер).
  - `value?: any` — Обране значення (або масив значень при `multiple`).
  - `multiple?: boolean` — Дозвіл множинного вибору.
  - `placeholder?: string` — Підказка при порожньому виборі.
  - `required?: boolean` — Обов'язковість вибору.
  - `disabled?: boolean` — Чи заблоковано селект.
- **Events**:
  - `'change'` — Вибір нової опції.

---

## 4. Оркестрація Форм (Form Contracts)

### `FormContract` & `FormFieldContract`
Оркестратор динамічної форми, який автоматично конвертує схему `Model-as-Schema` у набір полів:
- **Props**:
  - `title?: string` — Заголовок форми.
  - `fields: FormFieldContract[]` — Набір полів форми.
  - `initialState?: Record<string, any>` — Початковий стан моделі.
  - `submitLabel?: string` — Підпис кнопки збереження.
  - `cancelLabel?: string` — Підпис кнопки скасування.
  - `disabled?: boolean` — Блокування форми.
  - `loading?: boolean` — Індикатор завантаження.
- **Events**:
  - `'submit'`, `'change'`, `'cancel'`.

### Типізація `FieldOptions`
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
```

### Підтримка `$collection` та `$alias`
Щоб уникнути конфліктів із системними полями екземпляра сутності, назва колекції цільової моделі резолвиться за правилом:
```javascript
const collectionName = TargetModel.$collection || TargetModel.$alias || TargetModel.alias
```
Опис зв'язку в схемі залишається гранично лаконічним:
- Одиничний: `category = { help: 'Category', type: CategoryModel }`
- Множинний: `attachments = { help: 'Documents', type: [Attachment] }`

---

## 5. Діалог та Прогрес (Dialog & Progress Contracts)

### `DialogContract` (ModalContract)
Фокусування уваги на ізольованому рішенні або підтвердженні (`Confirm`).
- **Props**:
  - `title: string` — Заголовок діалогу / запитання.
  - `content: string` — Пояснення або тіло діалогу.
  - `open?: boolean` — Стан видимості.
  - `actions?: Array<ActionProps>` — Кнопки дій (наприклад, «Підтвердити», «Скасувати»).
- **Events**:
  - `'confirm'`, `'cancel'`.

### `ProgressContract`
Індикація виконання тривалої операції (лінійний прогрес або спінер).
- **Props**:
  - `value?: number` — Прогрес від 0 до 1 (або відсоток).
  - `total?: number` — Абсолютна кількість (наприклад, файлів).
  - `message?: string` — Текстовий статус етапу.
  - `status?: 'running' | 'paused' | 'success' | 'failed'` — Стан операції.
- **Events**: немає.

---

## 6. Порівняльний Аналіз з Іншими Платформами

| Критерій / Платформа | **OLMUI (@nan0web/ui)** | **Payload CMS** | **Shadcn UI + Radix** | **Odoo / ERPNext** | **Flutter / Compose** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Парадигма ядра** | **Data & Intent First** (агностичні JS-контракти) | Admin-First Config (Node + React) | DOM-First (React + Tailwind) | XML Search/Form View + Python ORM | Widget/Tree First (Dart/Kotlin) |
| **Мультимодальність** | **100% (CLI, Web, Mobile, Watch, Voice, Chat)** | Тільки Web Admin | Тільки Web Browser | Web + спрощений мобільний | Тільки Screen UI (Mobile/Desktop/Web) |
| **Динамічні форми** | Автоматично з `Model-as-Schema` | Автоматично з `CollectionConfig.fields` | Вручну через `react-hook-form` + Zod | Автоматично з Python Model fields | Вручну через Reactive Forms / State |
| **Зв'язки між сутностями** | Поліморфний `Choice` / `Dialog` (`type: Model`) | `relationship` field (`relationTo`) | Custom Async Select Combobox | `Many2one` / `Many2many` Select | Custom Bloc/Repository loader |
| **Zero-Hardcode & i18n** | Strict Model i18n (`t(Model.field)`) | JSON словники в адмінці | `next-intl` через хардкод ключів | `_('String')` gettext у коді | `intl` / `strings.xml` |
| **Рантайм вага** | **0 KB dependencies** (чистий JS) | Повний Next.js/React стек | React + Radix + Tailwind runtime | Важкий JS/Python рантайм | Окремий движок відмальовки (Skia) |

---

## 7. Каталог для 99% Бізнес-Додатків (Business Matrix)

1. **Макет та Навігація**: `PageContract` (5 регіонів: `header`, `navigation`, `main`, `aside`, `footer`), `NavContract`, `SidebarContract` (`Tree`, `Accordion`), `FooterContract`.
2. **Збір Даних та Форми**: `FormContract` (автоконверсія з `Model-as-Schema`), `InputContract` (text, number, secret, range/slider, color), `ChoiceContract` (select, toggle, autocomplete), `ActionContract` (buttons, shortcuts).
3. **Відображення Даних та Звіти**: `TableContract` (сортування, пагінація, фільтри), `BadgeContract` (статуси), `MarkdownContract` (`CodeBlock`), `SortableContract` (пріоритизація черг).
4. **Зворотний Зв'язок та Діалог**: `AlertContract` (`Toast`, Notice), `DialogContract` (`Modal`, `Confirm`), `ProgressContract` (`Spinner`, `ProgressBar`).
