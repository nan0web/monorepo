# ✅ Валідація (Validation)

> Строга відповідність схемі в реальному часі через Model-as-Schema.

---

## Визначення

Валідація — це автоматична перевірка даних на відповідність схемі моделі **до** їх збереження. Кожне поле моделі має визначений тип, обмеження та опис (`help`), що дозволяє генерувати форми та перевіряти дані без додаткового коду.

## Архітектура Model-as-Schema

```
┌────────────────────────────────────────────────┐
│                    Model                        │
│                                                 │
│  static order = {                               │
│    help: 'Priority weight',                     │
│    type: 'number',                              │
│    default: 0,               ← Значення за замовчуванням
│    min: -1,                  ← Мінімальне значення
│    required: 1               ← Обов'язкове      │
│  }                                              │
│                                                 │
│  static content = {                             │
│    help: 'Structured object',                   │
│    type: 'object',                              │
│    default: {}                                  │
│  }                                              │
│                                                 │
│  static resolveValidation(instance) {           │
│    // Повертає масив ModelError                  │
│  }                                              │
└────────────────────────────────────────────────┘
```

### Типи полів

| Тип             | Опис                                 | Приклад            |
| :-------------- | :----------------------------------- | :----------------- |
| `string`        | Однорядковий текст                   | Заголовок          |
| `number`        | Ціле число                           | Порядок сортування |
| `text/markdown` | Багаторядковий Markdown              | Контент статті     |
| `text/html`     | HTML блок                            | Віджет             |
| `date`          | Дата (ISO)                           | Дата публікації    |
| `ref/Model`     | Посилання на інший документ (`$ref`) | Автор              |
| `ref/Model[]`   | Масив посилань                       | Теги, категорії    |
| `image/webp`    | Зображення                           | Обкладинка         |
| `object`        | Довільний об'єкт                     | Метрики            |

## Механізм `$ref` (References)

Посилання між документами реалізуються через спеціальний тип `$ref`:

```yaml
# data/articles/article-001
title: 'Архітектура NaN•Web'
author:
  $ref: 'authors/yaro'
tags:
  - $ref: 'tags/architecture'
  - $ref: 'tags/olmui'
```

При завантаженні документа, DB-адаптер **розпаковує** (`$ref` → resolve) посилання автоматично:

```js
const article = await db.loadDocument('articles/article-001.nan0')
// article.author → { name: 'Ярослав Снігірьов', ... }
// article.tags → [{ name: 'Architecture' }, { name: 'OLMUI' }]
```

### Граф посилань

```
article-001
  ├── $ref → authors/yaro
  ├── $ref → tags/architecture
  └── $ref → tags/olmui

authors/yaro
  └── $ref → organizations/nan0web
```

## Приклади валідації

### 1. Перевірка обов'язкових полів

```js
import { Document } from '@nan0web/editor.app'

const doc = new Document({ title: '' })
const errors = Document.resolveValidation(doc)

// errors → [{ field: 'title', message: 'Title is required' }]
```

### 2. Перевірка типу

```js
const doc = new Document({ order: 'not-a-number' })
const errors = Document.resolveValidation(doc)

// errors → [{ field: 'order', message: 'Expected number, got string' }]
```

### 3. Перевірка посилань

```js
const doc = new Document({
  title: 'Test',
  author: { $ref: 'authors/non-existent' },
})
const errors = await Document.resolveValidation(doc, { db })

// errors → [{ field: 'author', message: 'Referenced document not found' }]
```

## Режими валідації в UI

### 1. Послідовна (Sequential) — CLI, Chat, Voice
Система валідує кожне поле в момент введення. Якщо поле не проходить перевірку, адаптер повторює запит саме для цього поля, не рухаючись далі.
- **Приклад**: CLI запитує заголовок → пуста стрічка → Помилка → CLI знову запитує заголовок.

### 2. Паралельна (Parallel) — Web, Mobile
Система валідує всі поля одночасно або в реальному часі (on change). Користувач бачить всі помилки в різних частинах форми.

```
┌─────────────────────────────────────┐
│ Title: [                        ]   │ ← червона рамка
│         ⚠ Title is required         │
│                                     │
│ Order: [ abc    ]                   │ ← жовта рамка
│         ⚠ Expected number           │
│                                     │
│ Author: [ authors/yaro ✓ ]          │ ← зелена галочка
└─────────────────────────────────────┘
```

## ModelError та Мовна Суверенність

Помилки валідації повертаються як об'єкти `ModelError`. В архітектурі NaN•Web повідомлення є **попередньо перекладеними** (Pre-translated). Система на старті визначає цільову мову, тому помилка містить уже готовий до виводу текст.

```js
// Об'єкт помилки вже містить перекладений message
{
  field: 'title',
  code: 'required',
  message: 'Заголовок обов\'язковий'  // Вже на українській
}
```

## Аналоги

| Платформа     | Тип валідації            | Рівень                          |
| :------------ | :----------------------- | :------------------------------ |
| **Strapi**    | JSON Schema              | Серверний                       |
| **Airtable**  | Field Types              | Клієнтський                     |
| **WordPress** | PHP Hooks                | Серверний                       |
| **Odoo**      | Python Constraints       | Серверний                       |
| **NaN•Web**   | Model-as-Schema + `$ref` | Універсальний (Client + Server) |
