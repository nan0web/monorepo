# @nan0web/co

Комунікація починається з простого повідомлення.

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                            | Покриття тестами | Функції                            | Версія Npm |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `98.5%`                                                                            | 🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/co/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/co/blob/main/docs/uk/README.md) | 🟢 `91.5%`       | ✅ d.ts 📜 system.md 🕹️ playground | 1.0.1      |

## Опис

Пакет `@nan0web/co` надає мінімальний, але потужний фундамент для систем комунікації на основі повідомлень і роботи з контактами. Основні класи:

- `Message` — базовий клас для представлення загальних повідомлень з часовими мітками.
- `Chat` — представляє чат‑повідомлення та ланцюжки повідомлень.
- `Contact` — аналізує та представляє контактну інформацію з певними URI‑схемами.
- `Language` — обробляє локалізаційні дані: назву, іконку, код та локаль.
- `I18nMessage` — розширює `Message` підтримкою перекладів.
- `InputMessage` / `OutputMessage` — адаптери повідомлень для UI.
- `App` — мінімальне ядро застосунку, орієнтоване на події.
- `Command` — клас для визначення CLI‑команд з параметрами та аргументами.
- `CommandMessage` — розширення `Message`, призначене для роботи з повідомленнями у стилі командного рядка.
- `CommandOption` — представляє окремі параметри або аргументи команди.
- `CommandError` — спеціальний клас помилок для команд.

Ці класи чудово підходять для побудови парсерів, CLI‑інструментів, комунікаційних протоколів, шарів валідації повідомлень та управління контактною та мовною інформацією.

## Встановлення

Як встановити через npm?

```bash
npm install @nan0web/co
```

Як встановити через pnpm?

```bash
pnpm add @nan0web/co
```

Як встановити через yarn?

```bash
yarn add @nan0web/co
```

## Використання

### Базове повідомлення

Повідомлення містять тіло повідомлення (`body`) і час створення (`time`).

#### Як створити `Message` з рядка?

```js
import { Message } from '@nan0web/co'
const msg = Message.from('Привіт світ')
console.info(String(msg)) // 2023-04-01T10:00:00 Привіт світ
```

#### Як створити `Message` з об’єкта?

```js
import { Message } from '@nan0web/co'
const msg = Message.from({ body: 'Привіт 2000', time: new Date('2000-01-01') })
console.info(String(msg)) // 2000-01-01T00:00:00.000Z Привіт 2000
```

### Чат‑повідомлення

`Chat` створює ланцюжок повідомлень з авторами.

#### Приклад створення ланцюжка з авторами

```js
const alice = Contact.from('alice@example.com')
const bob = Contact.from('+1234567890')
const chat = new Chat({
  author: alice,
  body: 'Привіт, Боб!',
  next: new Chat({
    author: bob,
    body: 'Привіт, Еліс!',
  }),
})
console.info(String(chat))
// 2025-11-12T11:02:37.033Z mailto:alice@example.com
// Привіт, Боб!
// ---
// 2025-11-12T11:02:37.033Z tel:+1234567890
// Привіт, Еліс!
```

### Обробка контактів

`Contact` коректно обробляє різні URI та рядкові входи.

#### Приклад створення контактів різних типів

```js
// Прямі екземпляри
const email = new Contact({ type: Contact.EMAIL, value: 'test@example.com' })
const phone = Contact.from('+123456') // Автоматично визначається як телефон
const address = Contact.parse('вул. Головна, 123') // Автоматично — адреса

// Виведення URI
console.info(email.toString()) // "mailto:test@example.com"
console.info(phone.toString()) // "tel:+123456"
console.info(address.toString()) // "address:вул. Головна, 123"

// Автодетекція з рядка
const website = Contact.parse('https://example.com') // Автоматично — URL
console.info(website) // "https://example.com"
```

### Обробка мов

`Language` працює з ISO‑кодами та виводить рядкові представлення.

#### Приклад створення `Language`

```js
const lang = new Language({
  name: 'Українська',
  icon: '🇺🇦',
  code: 'uk',
  locale: 'uk-UA',
})
console.info(String(lang)) // ← Українська 🇺🇦
```

### I18nMessage — перекладені повідомлення

`I18nMessage` успадковує `Message` і додає підтримку локалізованих рядків.

#### Приклад використання

```js
import { I18nMessage } from '@nan0web/co'
const i18n = I18nMessage.from({
  body: { en: 'Hello', uk: 'Привіт' },
  locale: 'uk',
})
console.info(String(i18n)) // 2023-04-01T10:00:00 Привіт
```

### InputMessage та OutputMessage — UI‑орієнтовані адаптери

#### Приклад створення та використання

```js
import { InputMessage, OutputMessage } from '@nan0web/co'

const inMsg = new InputMessage({
  value: 'користувальницьке ввід',
  options: ['так', 'ні'],
})
const outMsg = new OutputMessage({
  content: ['Результат:', 'Успішно'],
  type: OutputMessage.TYPES.SUCCESS,
})

console.info(inMsg.toString()) // ← TIMESTAMP користувальницьке ввід
console.info(outMsg.content) // ← ["Результат:", "Успішно"]
```

### App — ядро подій

#### Приклад роботи з `App`

```js
import { App } from '@nan0web/co'

const app = new App()
const im = new app.InputMessage({ value: 'ping' })
const gen = app.run(im) // повертає async‑генератор
const { value, done } = await gen.next()
const { done: done2 } = await gen.next()

console.info(value) // ← OutputMessage { body: ["Run"], ... }
console.info(done) // ← false
console.info(done2) // ← true
```

### Парсинг тіла повідомлення зі статичною мета‑конфігурацією

Метод `Message.parseBody` може трансформувати сирі об’єкти в добре‑визначене тіло згідно схеми.

#### Приклад

```js
import { Message } from '@nan0web/co'

const Body = {
  // Підказка: прапорець допомоги (alias: h)
  help: { alias: 'h', defaultValue: false },
  // Формат виводу (alias: fmt)
  format: { alias: 'fmt', defaultValue: 'txt', options: ['txt', 'md', 'html'] },
  // Прапорець verbose (без alias)
  verbose: { defaultValue: false },
}
const raw = { h: true, fmt: 'md', verbose: 1 }
const parsed = Message.parseBody(raw, Body)

console.info(parsed)
// { help: true, format: "md", verbose: true }
```

### Схема валідації повідомлення

`Message` підтримує статичну схему `Body`, яка дозволяє описувати:

- **Аліаси** – альтернативні короткі ключі.
- **Значення за замовчуванням** – застосовуються, коли поле відсутнє.
- **Обов’язкові поля** – вимушують їх присутність.
- **Перевірка патерну** – регулярні вирази.
- **Перерахування** – обмеження набору допустимих значень.
- **Кастомна валідація** – довільна функція, що повертає `true` або рядок помилки.

Валідація виконується методом `msg.validate()`, який повертає `Map<string, string>` помилок, а `msg.getErrors()` – у форматі `Record<string, string[]>`.

#### Приклад схеми та валідації

```js
class MyBody {
  /** @type {string} */
  name
  static name = {
    alias: 'n',
    required: true,
    pattern: /^[a-z]+$/,
  }
  /** @type {string} */
  title
  static title = {
    pattern: /^.{3,}$/,
    defaultValue: '',
  }
  /** @type {string} */
  mode
  static mode = {
    options: ['auto', 'manual'],
    defaultValue: 'auto',
  }
  /** @type {string} */
  custom
  static custom = {
    validate: (v) => (v.length > 5 ? true : 'Too short'),
  }
  constructor(input = {}) {
    const {
      name,
      title = MyBody.title.defaultValue,
      mode = MyBody.mode.defaultValue,
      custom,
    } = Message.parseBody(input, MyBody)
    this.name = String(name)
    this.title = String(title)
    this.mode = String(mode)
    this.custom = String(custom)
  }
}
class MyMessage extends Message {
  static Body = MyBody
  /** @type {MyBody} */
  body
  constructor(input = {}) {
    super(input)
    this.body = new MyBody(input.body ?? {})
  }
}
const msg = new MyMessage({
  body: { name: 'john', title: 'Hello', custom: 'abc' },
})
// змінюємо поле на неправильне значення
msg.body.mode = 'invalid'
const errors = msg.validate()
console.info(errors)
// Map (3) {
//   'custom' => 'Too short',
//   'mode' => 'Enumeration must have one value',
//   'name' => 'Does not match pattern /^[a-z]+$/',
// }
```

## API

### Message

- **Властивості**
  - `body` – фактичний вміст повідомлення.
  - `time` – час створення повідомлення.
- **Методи**
  - `toObject()` – повертає `{ body, time }`.
  - `toString()` – форматує час і текст у рядок.
  - `static from(input)` – створює екземпляр з рядка або об’єкта.
  - `validate()` – перевіряє тіло за схемою `Body`, повертає `Map<string, string>`.
  - `getErrors()` – повертає помилки у форматі `Record<string, string[]>`.

### Chat

Розширює `Message`.

- **Властивості**
  - `author` – об’єкт контакту, що представляє відправника.
  - `next` – наступне повідомлення в ланцюжку (може бути `null`).
- **Методи**
  - `get size` – кількість повідомлень у ланцюжку.
  - `get recent` – останнє повідомлення у ланцюжку.
  - `toString()` – форматує весь ланцюжок.
  - `static from(input)` – будує ланцюжок зі списку.

### Contact

- **Статичні префікси URI**
  - `Contact.ADDRESS` – `"address:"`
  - `Contact.EMAIL` – `"mailto:"`
  - `Contact.TELEPHONE` – `"tel:"`
  - `Contact.URL` – `"//"`
  - Соціальні мережі: `FACEBOOK`, `INSTAGRAM`, `LINKEDIN`, `SIGNAL`, `SKYPE`, `TELEGRAM`, `VIBER`, `WHATSAPP`, `X`
- **Методи**
  - `toString()` – перетворює контакт у URI‑рядок.
  - `static parse(string)` – визначає схему або використовує евристику.
  - `static from(input)` – повертає існуючий `Contact` або створює новий.

### Language

- **Властивості**
  - `name` – назва мови рідною мовою.
  - `icon` – емоджі прапора.
  - `code` – код мови ISO 639‑1.
  - `locale` – ідентифікатор локалі.
- **Методи**
  - `toString()` – комбінує `name` і `icon`.
  - `static from(input)` – створює або повертає екземпляр `Language`.

### I18nMessage

- **Властивості**
  - `body` – об’єкт з локалізованими рядками.
  - `locale` – поточна мова відображення.
- **Методи**
  - `static from(input)` – створює екземпляр з багатомовним тілом.
  - `toString()` – повертає рядок у вибраному локалі.

### InputMessage / OutputMessage

- **InputMessage**
  - `value` – вхідний текст.
  - `options` – можливі варіанти відповіді.
- **OutputMessage**
  - `content` – масив рядків виводу.
  - `type` – тип повідомлення (наприклад, `SUCCESS`).
- **Методи**
  - `toString()` – форматує повідомлення з таймстампом.

### Command

- **Властивості**
  - `name` – назва команди.
  - `help` – опис команди.
  - `options` – набір параметрів.
  - `arguments` – очікувані аргументи.
  - `subcommands` – вкладені команди.
  - `aliases` – скорочені назви прапорців.
- **Методи**
  - `addOption(name, type, def, help?, alias?)` – додає параметр.
  - `addArgument(name, type, def, help?, required?)` – додає аргумент.
  - `addSubcommand(subcommand)` – додає підкоманду.
  - `parse(argv)` – парсить аргументи, повертає `CommandMessage`.
  - `runHelp()` – генерує довідку.
  - `generateHelp()` – повертає відформатований текст довідки.

### CommandMessage

- **Властивості**
  - `name` – назва (підкоманди).
  - `args` – аргументи.
  - `opts` – розібрані прапорці.
  - `children` – підповідомлення підкоманд.
- **Методи**
  - `get subCommand` – назва першої підкоманди, якщо є.
  - `add(message)` – додає підповідомлення.
  - `updateBody()` – оновлює тіло на основі `name`, `argv` і `opts`.
  - `toString()` – відтворює повний рядок команди.
  - `static parse(args)` – перетворює масив аргументів у `CommandMessage`.
  - `static from(input)` – повертає вхідне повідомлення або створює нове.

### CommandOption

- **Властивості**
  - `name` – назва параметра.
  - `type` – тип значення (`Number`, `String`, `Boolean`, `Array`, `Class`).
  - `def` – значення за замовчуванням.
  - `help` – опис.
  - `alias` – коротка назва.
  - `required` – чи обов’язковий.
- **Методи**
  - `getDefault()` – повертає `def`.
  - `isOptional()` – `true`, якщо має значення за замовчуванням або не обов’язковий.
  - `toObject()` – формує об’єкт параметра для довідки.
  - `static from()` – створює екземпляр з конфігурації.

### CommandError

- **Властивості**
  - `message` – опис помилки.
  - `data` – додатковий контекст.
- **Методи**
  - `toString()` – повертає форматовану помилку з JSON‑даними.

Усі експортовані класи проходять базові тести для забезпечення коректності прикладів у API.

## JavaScript

Для автодоповнення використовуються `.d.ts` файли.

## Пісочниця CLI

Як запустити пісочницю CLI?

```bash
# Клонуйте репозиторій і запустіть CLI‑пісочницю
git clone https://github.com/nan0web/co.git
cd co
npm install
npm run play
```

## Внески

Як внести свій вклад? — [читайте тут](../../CONTRIBUTING.md)

## Ліцензія

Як застосовується ISC‑ліцензія? — [читайте тут](../../LICENSE)
