---
description: Формалізація Data-Model-As-Schema (як описувати class з метаданими для UI Form)
---

# 📐 Ворклоу: Model-as-Schema (Самоописові Моделі)

Цей workflow формалізує, як описувати доменні моделі (Data Models) так, щоб вони автоматично працювали у генераторах форм (`ui-cli`, Web UI) без дублювання логіки (наприклад, валідації чи схеми).

## 1. Концепція Model-as-Schema

У NaN0Web доменні класи одночасно є:

1. Типізованим сховищем даних для рантайму.
2. Схемою для автоматичної генерації форм (напр. `generateForm` у `ui-cli`).
3. Джерелом i18n ключів, підказок та валідації.

**НІКОЛИ** не описуйте конфігурацію полів (валідатори, підказки) окремо від самого класу!

## 2. Базовий Патерн Опису

Кожне поле моделі складається з двох пов'язаних частин:

1. **`static` конфігурація** (метадані: `help`, `default`, `type`, `hidden`, `validate`, `options`).
2. **Типізація інстансу (JSDoc у конструкторі)**, яка вказує TypeScript/VS Code типи полів, але НЕ використовує ініціалізацію інстанс-полів (class fields) типу `field = value`, щоб не перезаписувати дані `super()`.

```javascript
import { Model } from '@nan0web/types'

/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA'} Locale */

/**
 * Language model (Еталон Model-as-Schema)
 */
export class Language extends Model {
  // 1. Статична мета-схема (для UI-форм та генераторів)
  static title = {
    help: 'Language title',
    default: '',
  }
  static locale = {
    help: 'Locale',
    errorNotFound: 'Locale not found',
    errorInvalidFormat: 'Invalid locale format',
    /** @type {Locale} */
    default: 'en_GB',
    validate: /** @param {string} str */ (str) =>
      /^[a-z]{2}(_[A-Z]{2})?$/.test(str) || Language.locale.errorInvalidFormat,
  }
  static icon = {
    help: 'Language icon',
    default: '🇬🇧',
  }

  // 2. Instance initialization and JSDoc typing (NO class fields)
  /**
   * @param {Partial<Language>} [data]
   * @param {import('@nan0web/types').ModelOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options)
    /** @type {string} Language title */ this.title
    /** @type {Locale} Locale */ this.locale
    /** @type {string} Language icon */ this.icon
  }
}
```

## 3. Інтеграція з `@nan0web/ui-cli` Forms

Завдяки цьому паттерну, модель можна напряму "силою" згодувати у `generateForm`. UI автоматично прочитає `static` поля як інструкцію, згенерує потрібні `prompts`, додасть валідатори та переклади:

```js
import { generateForm } from '@nan0web/ui-cli'
import { Language } from '../src/domain/Language.js'

async function runDemo() {
  // Форма сама прочитає Language, спитає всі поля і поверне дані!
  const data = await generateForm({ schema: Language })

  // Ініціалізуємо готовий об'єкт зібраними та ПРОВАЛІДОВАНИМИ даними
  const language = new Language(data)
  console.info('Створено:', language)
}
```

## 4. Правила для Агента

При розробці нових Data Models або розширенні існуючих:

- ✅ **Обов'язково** робіть `static fieldName = { help: '...', default: ... }`.
- ✅ **Обов'язково** використовуйте `JSDoc` **всередині конструктора** (`/** @type {Type} */ this.field`), щоб типізувати поля без створення JS class fields.
- ❌ **ЗАБОРОНЕНО** ініціалізувати поля об'єкта поза конструктором (напр. `field = 'val'`), оскільки це перезаписує дані від `super(data)`.
- ❌ **ЗАБОРОНЕНО** хардкодити `prompt` або `ask({ message: 'Enter email' })` вручну, якщо можна використати підхід через `generateForm({ schema: Model })`.
- ✅ **Управління валідацією**: Правила валідації пишуться ВИКЛЮЧНО всередині `static fieldName.validate()`, щоб UI (веб чи термінал) міг миттєво їх викликати без дублювання if-else у контролерах.

# Оновлення для 0HCnAI Model-as-Schema Workflow

Додай цей блок до секції з правилами розробки моделей:

---

### 📜 Правило: Емансипація `name` (Конфлікт з JS Function.name)

**Проблема:** В JavaScript властивість `static name` зарезервована за функцією (класом). Якщо використовувати її для метаданих OLMUI, це перезапише системне ім'я класу, що зламає генератори схем та інструменти інтроспекції (вони почнуть видавати об'єкт метаданих замість назви класу).

**Рішення:** Завжди використовуй `alias`, якщо поле у даних має називатися `name`.

- У класі називай поле контекстно (наприклад, `appName`, `pageTitle`).
- У метаданих вказуй `alias: 'name'`.

```javascript
export default class AppEntryConfig extends Model {
  static appName = {
    alias: 'name', // This name will be used in JSON Schema and *.nan0 files
    type: 'string',
    required: true,
  }

  /**
   * @param {Partial<AppEntryConfig>} [data]
   * @param {import('@nan0web/types').ModelOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options)
    /** @type {string} Application name */ this.appName
  }
}
```

### 🏗 JSON Schema Generator (VS Code Integration)

Для забезпечення Autocomplete та валідації у `.nan0` (YAML) файлах, використовується генератор схем (`generate-schemas.js`).

**Особливості:**

1. **Рекурсивність:** Якщо поле вказано як тип іншої моделі через `hint: MyModel`, генератор автоматично додасть `MyModel` у чергу та створить для неї схему.
2. **Ієрархія:** Генератор відтворює файлову структуру домену у папці `schemas/` (напр. `domain/HR/Person.js` -> `schemas/HR/Person.schema.json`).
3. **Посилання ($ref):** Вкладені об'єкти автоматично зв'язуються через `$ref` на відповідні JSON файли схем.

---
