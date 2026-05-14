# @nan0web/types

[English](../en/README.md) | [Українська](README.md)

<!-- %PACKAGE_STATUS% -->

Мінімалістичний інструментарій без зовнішніх залежностей для роботи з JavaScript‑структурами даних, конверсіями та валідацією типів. Створений згідно з [філософією nan0web](https://github.com/nan0web/monorepo/blob/main/system.md#nanweb-nan0web), де нуль — це нескінченне джерело (Всесвіт), звідки виникають значущі структури.

Цей пакет допомагає безпечно працювати з типами, об'єктами, масивами, документами у форматі NaN0 та базовими деревовидними структурами, такими як відступний текст. Особливо корисний у монорепо, де потрібні легкі, перевірені та багаторазово використані утиліти.

## Зміст
- [Основні концепції](#основні-концепції)
- [Використання: базові типи](#використання-базові-типи)
- [Конверсії та утиліти](#конверсії-та-утиліти)
- [Симетрична i18n валідація](#symmetrical-i18n-validation)
- [Парсер та деревовидні структури](#парсер-та-деревовидні-структури)
- [Формат NaN0](#формат-nan0)
- [Розширення VS Code](#розширення-vs-code)
- [Пісочниця](#пісочниця)
- [Java•Script](#javascript)

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/types
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/types
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/types
```

## Основні концепції

Пакет спроектовано з урахуванням мінімалізму та точності:

- ✅ Повністю типізовано за допомогою **JSDoc** та `.d.ts`‑файлів
- 🔁 Підтримує синхронні та асинхронні операції
- 🧠 Створений для когнітивної ясності: кожна функція має чітку мету
- 🌱 Не має зовнішніх залежностей

### `Model` (Доменна модель, керована даними)

Базовий клас для всіх доменних об'єктів в екосистемі NaN0Web. Він автоматично
застосовує значення за замовчуванням, розв'язує аліаси та забезпечує вбудовану
валідацію на основі статичних метаданих класу.

Як використовувати Model для доменної логіки?
```js
import { Model } from "@nan0web/types"
class User extends Model {
	static name = { default: 'Anonymous' }
	static age = {
		errorTooYoung: 'Too young',
		validate: (v) => v >= 18 || User.age.errorTooYoung,
	}
}
const user = new User({ age: 25 })
console.info(user.name) // ← "Anonymous"
console.info(user.age) // ← 25
```

## Використання: базові типи

### `match(test, options)`

Перевіряє, чи будь‑який з аргументів відповідає рядковому або regex‑шаблону.

- **Параметри**
  - `test` (string|RegExp) – Шаблон для порівняння.
  - `options` (object, optional) – Параметри порівняння.
    - `caseInsensitive` (boolean) – За замовчуванням `false`.
    - `stringFn` (string) – Метод типу `includes`, `startsWith` тощо.
    - `method` ("some"|"every") – Перевіряти один чи усі аргументи. За замовчуванням `"some"`.

Як використовувати `match(regex)`?

```js
import { match } from '@nan0web/types'
const fn = match(/^hello$/)
console.info(fn('hello', 'world')) // ← true
console.info(fn('world')) // ← false
```

### `Enum(...values)`

Валідує значення (або масив значень) проти списку дозволених значень або кастомних функцій‑валідаторів.

Як валідувати за допомогою Enum?

```js
import { Enum } from '@nan0web/types'
const color = Enum('red', 'green', 'blue')
console.info(color('red')) // ← red
console.info(color('yellow')) // ← throws a TypeError → Enumeration must have one value of..
```

### `oneOf(...args)`

Повертає значення, якщо воно міститься у списку, інакше повертає `undefined`.

Як використовувати oneOf?

```js
import { oneOf } from '@nan0web/types'
const fn = oneOf('a', 'b', 'c')
console.info(fn('b')) // ← "b"
console.info(fn('z')) // ← undefined
```

### `undefinedOr(fn)`

Застосовує `fn` лише якщо значення не `undefined`, інакше повертає `undefined`.

Як використовувати undefinedOr(fn)?

```js
import { undefinedOr } from '@nan0web/types'
const fn = undefinedOr((x) => x * 2)
console.info(fn(5)) // ← 10
console.info(fn(undefined)) // ← undefined
```

### `nullOr(fn)`

Застосовує `fn` лише якщо значення не `undefined`, інакше повертає `null`.

Як використовувати nullOr(fn)?

```js
import { nullOr } from '@nan0web/types'
const fn = nullOr((x) => x + 1)
console.info(fn(1)) // ← 2
console.info(fn(undefined)) // ← null
```

### `arrayOf(Fn)`

Застосовує `Fn` до кожного елементу масиву.

Як мапити масив за допомогою arrayOf(fn)?

```js
import { arrayOf } from '@nan0web/types'
const fn = arrayOf((x) => x.toUpperCase())
console.info(fn(['a', 'b'])) // ← [ 'A', 'B' ]
```

### `typeOf(Fn)`

Перевіряє, чи значення є інстанцією заданого типу (або примітиву).

Як перевірити тип за допомогою typeOf(String)?

```js
import { typeOf } from '@nan0web/types'
const fn = typeOf(String)
console.info(fn('hello')) // ← true
console.info(fn(123)) // ← false
```

### `functionOf(value)`

Повертає конструктор для переданого значення.

Як отримати конструктор за допомогою functionOf?

```js
import { functionOf } from '@nan0web/types'
console.info(functionOf('hello')) // ← [Function: String]
console.info(functionOf(123)) // ← [Function: Number]
console.info(functionOf(new Date())) // ← [Function (anonymous)]
```

### `resolveAliases(Class, input)`

Сканує статичні властивості класу на наявність ключа `alias` та перевідображає
вхідні дані відповідно. Це корисно для підтримки зворотної сумісності
або відображення коротких імен на описові імена властивостей.

Як розв'язати аліаси зі статичних метаданих?

```js
import { resolveAliases } from '@nan0web/types'
class Config {
  static appName = { alias: 'name' }
}
const data = resolveAliases(Config, { name: 'my-app' })
console.info(data) // ← { appName: "my-app" }
```

### `resolveDefaults(Class, target)`

Застосовує значення `default` зі статичних метаданих класу до цільового об'єкта.
Це гарантує, що ваш інстанс завжди матиме коректний початковий стан на основі
схеми класу.

Як застосувати значення за замовчуванням зі статичних метаданих?

```js
import { resolveDefaults } from '@nan0web/types'
class Config {
  static port = { default: 3000 }
  static theme = { default: 'dark' }
}
const settings = { port: 8080 }
resolveDefaults(Config, settings)
console.info(settings) // ← { port: 8080, theme: "dark" }
```

### `empty(...values)`

Перевіряє, чи будь‑яке з переданих значень вважається порожнім.

Як перевірити порожні значення?

```js
import { empty } from '@nan0web/types'
console.info(empty(undefined)) // ← true
console.info(empty('')) // ← true
console.info(empty({})) // ← true
console.info(empty(null)) // ← true
console.info(empty([])) // ← true
console.info(empty(0)) // ← false
```

### `equal(...args)`

Порівнює пари аргументів на строгий збіг (наприклад, `equal(a, b, c, d)` → `a === b && c === d`).

Як порівняти значення строго за допомогою equal()?

```js
import { equal } from '@nan0web/types'
console.info(equal('a', 'a', 'b', 'b')) // ← true
console.info(equal(1, '1')) // ← false
```

## Конверсії та утиліти

### `to(type)`

Конвертує значення у представлення, зручне для цільового типу (наприклад, `.toObject()` чи `.toArray()`).

Як конвертувати за допомогою to(Object)?

```js
import { to } from '@nan0web/types'
class A {
  x = 9
}
const converted = to(Object)(new A())
console.info(converted) // ← { x: 9 }
```

### `ContainerObject`

Базовий клас для створення ієрархічних деревоподібних структур. Він забезпечує систему відстеження рівня вкладеності (`level`) та метод `.add()` для додавання дочірніх елементів.

Як побудувати кастомне дерево через ContainerObject?

```js
import { ContainerObject } from '@nan0web/types'
/** @typedef {import("@nan0web/types/types/Object/ContainerObject").ContainerObjectArgs} ContainerObjectArgs */
class B extends ContainerObject {
  /** @type {string} */
  body
  /** @type {B[]} */
  children = []
  /** @param {ContainerObjectArgs & string} */
  constructor(input = {}) {
    if ('string' === typeof input) {
      input = { body: input }
    }
    const { children = [], body = '', ...rest } = input
    super(rest)
    this.body = String(body)
    children.map((c) => this.add(c))
  }
  /**
   * Додає елемент до контейнера.
   * @param {Partial<B>} element
   * @returns {B}
   */
  add(element) {
    this.children.push(B.from(element))
    this._updateLevel()
    return this
  }
  /**
   * @param {Partial<B> | string} input
   * @returns {B}
   */
  static from(input) {
    if (input instanceof B) return input
    return new B(input)
  }
}
const root = new B('root')
root.add('1st')
root.add('2nd')
console.info(root)
// B { body: "root", level: 0, children: [
//   B { body: "1st", level: 1, children: [] }
//   B { body: "2nd", level: 1, children: [] }
// ] }
```

### NonEmptyObject

Базовий клас, чий `.toObject()` пропускає властивості з порожніми значеннями.

Як використовувати NonEmptyObject для фільтрації порожніх значень?

```js
import { NonEmptyObject } from '@nan0web/types'
class B extends NonEmptyObject {
  name = 'Name'
  emptyValue = ''
}
const obj = new B().toObject()
console.info(obj) // ← { name: "Name" }
```

### FullObject

Маркер‑клас, що використовується через `to(FullObject)` для збору всіх enumerable‑властивостей, включно з тими, що успадковуються (наприклад, геттери).

Як зібрати усе за допомогою to(FullObject)?

```js
import { to, FullObject } from '@nan0web/types'
class A {
  x = 9
}
class B extends A {
  get y() {
    return this.x ** 2
  }
}
const obj = to(FullObject)(new B())
console.info(obj) // ← { x: 9, y: 81 }
```

### UndefinedObject

Допоміжний клас, що використовується через `to(UndefinedObject)` для збереження `undefined` у об'єктах.

Як зберегти `undefined` у об'єктах через to(UndefinedObject)?

```js
import { to, UndefinedObject } from '@nan0web/types'
const data = { x: 9, y: undefined }
const obj = to(UndefinedObject)(data)
console.info(obj) // ← { x: 9, y: undefined }
```

### Строге приведення до Boolean

`to("boolean")` (або `to(Boolean)`) приводить будь‑яке значення до boolean.
Конверсія відповідає правилам truthiness у JavaScript.

Як привести до Boolean зі строгим приведенням?

```js
const fn = to('boolean')
console.info(fn(1)) // ← true
console.info(fn(0)) // ← false
console.info(fn('')) // ← false
console.info(fn('yes')) // ← true
console.info(fn('no')) // ← true
console.info(fn('false')) // ← true
console.info(fn(false)) // ← false
```

### Строге приведення до Number

`to("number")` (або `to(Number)`) конвертує значення у числа.
Нечислові рядки стають `NaN`; `null`/`undefined` стають `0`.

Як привести до Number зі строгим приведенням?

```js
const fn = to('number')
console.info(fn('42')) // ← 42
console.info(fn('foo')) // ← NaN
console.info(fn(null)) // ← 0
console.info(fn(undefined)) // ← 0
```

### `clone(obj)`

Глибоке клонування об'єктів, масивів, Map, Set та кастомних класів.

Як глибоко клонувати об'єкти?

```js
import { clone } from '@nan0web/types'
const original = { a: { b: [1, 2] } }
const copy = clone(original)
console.info(copy) // ← { a: { b: [ 1, 2 ] } }
```

### `merge(target, source, options?)`

Глибоке злиття двох простих об'єктів або масивів, опціонально з унікальністю елементів.

Як зливати два об'єкти?

```js
import { merge } from '@nan0web/types'
const a = { x: 1, nested: { a: 1 } }
const b = { y: 2, nested: { b: 2 } }
const result = merge(a, b)
console.info(result) // ← { x: 1, nested: { a: 1, b: 2 }, y: 2 }
```

### `isConstructible(fn)`

Перевіряє, чи функцію можна викликати з `new`.

Як перевірити, чи функція конструктор?

```js
import { isConstructible } from '@nan0web/types'
console.info(isConstructible(class X {})) // ← true
console.info(isConstructible(() => {})) // ← false
```

### `TFunction` (Контракт)

Визначення типу функції для перекладів:
`(key: string, vars?: Record<string, any>) => string`

### `createT(vocabulary, locale)`

Легкий рушій інтернаціоналізації (i18n), що підтримує підстановку змінних, рекурсивну множину та скорочений запис для чисел.

Як використовувати createT для перекладів?

```js
import { createT } from '@nan0web/types'
const t = createT(
  {
    'Hello {name}': 'Привіт, {name}!',
    apples_one: '{count} яблуко',
    apples_few: '{count} яблука',
    apples_many: '{count} яблук',
    'I have {apples}': 'У мене є {apples}',
  },
  'uk-UA',
)
// Базова підстановка
console.info(t('Hello {name}', { name: 'Світ' })) // ← "Привіт, Світ!"
// Скорочений запис для чисел (apples: 5 -> t('apples', { $count: 5, count: 5 }))
console.info(t('I have {apples}', { apples: 5 })) // ← "У мене є 5 яблук"
```

### `resolveValidation(Class, target)`

Виконує пакетну валідацію обʼєкта проти статичних метаданих класу. Якщо валідація не пройшла — кидає `ModelError`.

```js
import { resolveValidation, ModelError } from '@nan0web/types'
class User {
	static name = {
		errorNameTooShort: 'Name too short',
		validate: (v) => v.length > 2 || User.name.errorNameTooShort,
	}
	static age = {
		errorAdultOnly: 'Must be an adult',
		validate: (v) => v >= 18 || User.age.errorAdultOnly,
	}
}
try {
  resolveValidation(User, { name: 'Bo', age: 17 })
} catch (e) {
  if (e instanceof ModelError) {
    console.info(e.fields) // ← { name: "Name too short", age: "Must be an adult" }
  }
}
```

### `ModelError`

Структурований клас помилок для валідації. Містить map полів з повідомленнями про помилки та підтримує переклад через `.translate(t)`.

```js
import { ModelError, createT } from '@nan0web/types'
const error = new ModelError({
  email: 'Invalid format',
  password: ['Too short {min}', { min: 8 }],
})
console.info(error.fields.email) // ← "Invalid format"

// Переклад помилки
const t = createT({ 'Invalid format': 'Невірний формат' })
const translated = error.translate(t)
console.info(translated.fields.email) // ← "Невірний формат"
```

## Парсер та деревовидні структури

### `Parser`

Базовий парсер документів, що працює з відступами: розбиває рядки на ієрархію `Node`.

Як розпарсити відступний рядок за допомогою Parser?

```js
import { Parser } from '@nan0web/types'
const parser = new Parser({ tab: '  ' })
const text = 'root\n  child\n    subchild\nsibling to root'
const tree = parser.decode(text)
console.info(tree)
console.info(tree.toString({ tab: '-' }))
// root
// -child
// --subchild
// sibling to root"
```

### `Node`

Універсальний вузол дерева, що зберігає вміст та дочірні елементи. Можна розширювати для формат‑специфічних вузлів (наприклад, AST Markdown).

Як створити дерево за допомогою Node?

```js
import { Node } from '@nan0web/types'
const root = new Node({ content: 'root' })
const child = new Node({ content: 'child' })
root.add(child)
console.info(String(root)) // ← "root\n\tchild"
```

## Формат NaN0

Формат **NaN0** — це компактна, зручна для людини мова серіалізації, створена
для типізованих даних. Він балансує між зручністю читання та строгими правилами
типізації, що робить його ідеальним для конфігураційних файлів, тестових фікстур
та обміну даними, де потрібен мінімум синтаксичного шуму.

### Загальні правила

- **Верхній рівень** значення може бути **об'єктом** або **масивом**.
- **Відступ** (два пробіли) визначає вкладеність — той самий принцип, що й у Python.
- **Коментарі** починаються з `#` і можуть з'являтися перед будь‑яким вузлом (ключ об'єкта,
  елемент масиву чи порожній контейнер). Послідовні рядки коментарів об'єднуються.
- **Порожні контейнери**
  - `[]` → порожній масив
  - `{}` → порожній об'єкт
  - Якщо порожній контейнер має попередній коментар, коментар прикріплюється до
    контейнера (індекс масиву `[0]` для масивів верхнього рівня, `.` для об'єктів верхнього рівня).

### Примітивні типи

| Тип                                         | Представлення                                                  | Приклад                                                 |
| ------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| **String**                                  | Простий текст, **якщо** не містить пробілів,                   |
| `:` або `#` — має бути в подвійних лапках.  |
| `"escaped \" quote"`                        |
| **Багаторядковий String**                   | Позначається `                                                 | ` у рядку значення; наступні відступлені рядки формують |
| рядок (нові рядки зберігаються).            |
| `desc:                                      | \n line one\n line two`                                        |
| **Number**                                  | Цифри можуть містити нижні підкреслення для зручності читання. |
| Підтримуються як цілі, так і дробові числа. |
| `160_000_500.345`                           |
| **Boolean**                                 | Літерал `true` або `false`.                                    |
| `true`                                      |
| **Null**                                    | Літерал `null`.                                                |
| `null`                                      |
| **Date / DateTime**                         | ISO‑8601 без часового поясу (`YYYY‑MM‑DD`) або з часом         |
| (`YYYY‑MM‑DDTHH:MM:SS`).                    |
| `2024-11-13`<br>`2024-11-13T19:34:00`       |

### Об'єкти

- Визначаються серією рядків `key: value`.
- Ключі — простий текст (лапки не потрібні) і можуть містити пробіли.
- Вкладені об'єкти виражаються збільшенням відступу.

Як зберігати об'єкти у NaN0‑документі в типізовану ієрархію класів?

```js
class Address {
  /** @type {string} */
  city = ''
  /** @type {string} */
  zip = ''
  constructor(input = {}) {
    const { city = this.city, zip = this.zip } = input
    this.city = String(city)
    this.zip = String(zip)
  }
}
class Person {
  name = ''
  age = 0
  /** @type {Address} */
  address = new Address()
  constructor(input = {}) {
    const { name = this.name, age = this.age, address = this.address } = input
    this.name = String(name)
    this.age = Number(age)
    this.address = new Address(address)
  }
}
const ctx = {
  comments: [],
  Body: class Body {
    person = new Person()
    constructor(input = {}) {
      this.person = new Person(input.person ?? {})
    }
  },
}
const str =
  `person:\n` +
  `  name: John Doe\n` +
  `  age: 30\n` +
  `  address:\n` +
  `    city: Kyiv\n` +
  `    zip: 10010\n`
const pojo = to(Object)(NaN0.parse(str, ctx))
console.info(pojo)
// person: {
//   name: "John Doe", age: 30, address: {
//     city: "Kyiv", zip: "10010"
//   }
// }
```

### Парсинг та серіалізація

Бібліотека експортує два основні хелпери:

- `NaN0.parse(text [, context])`
  - Повертає JavaScript‑значення.
  - `context.comments` міститиме витягнуті коментарі з їхнім
    ідентифікатором (`.` для кореневого об'єкта, `[0]` для індексу масиву верхнього рівня, або
    ім'я ключа для об'єктів).

- `NaN0.stringify(value [, context])`
  - Генерує NaN0‑рядок.
  - `context.comments` можна використовувати для повторного вставлення коментарів.

Обидві операції **безпечні для round‑trip**: `parse(stringify(x))` повертає структуру,
глибоко рівну `x` (включно з об'єктами `Date`, числами з підкресленнями тощо).

> Коментарі поки що не серіалізуються, todo

### Швидкий приклад

Формат навмисно **мінімальний** — немає ком, дужок (крім порожніх
контейнерів) чи іншої пунктуації, що могла б засмічити візуальну структуру.

Повну довідку див. у `src/NaN0.js` та набір тестів
`src/NaN0.test.js`.

Як працювати з форматом NaN0?

```js
import NaN0 from '@nan0web/types'
const example =
  `# Sample NaN0\n` +
  `person:\n` +
  `  name: Bob\n` +
  `  age: 42\n` +
  `  address:\n` +
  `    city: Lviv\n` +
  `    zip: 79_000\n` +
  `  tags:\n` +
  `    - developer\n` +
  `    - |\n` +
  `      multi\n` +
  `      line`
const ctx = { comments: [] }
const parsed = NaN0.parse(example, ctx)
const stringified = NaN0.stringify(parsed, ctx)
console.info(ctx.comments)
// [ { id: "person", text: "Sample NaN0" } ]
console.info(stringified)
// # Sample NaN0
// person:
//   name: Bob
//   age: 42
//   address:
//     city: Lviv
//     zip: 79_000
```

## Розширення VS Code

Цей пакет включає вбудоване розширення VS Code (`nan0-vscode`), що надає **підсвітку синтаксису** та **форматування** для формату NaN0.

Як скомпілювати та використовувати розширення VS Code?

```bash
# 1. Перейдіть у директорію розширення:
cd src/ui/vscode

# 2. Зберіть бандл розширення (потрібен esbuild):
npm run build

# 3. Запакуйте у .vsix файл:
npm run package

# 4. Встановіть згенерований .vsix файл у VS Code вручну.
```

Розширення суворо дотримується визначеного стандарту форматування `NaN0.TAB` (2 пробіли) при збереженні/форматуванні документа, запобігаючи конфліктам у Git між різними конфігураціями редакторів.

## Пісочниця

Як запустити CLI‑пісочницю?

```bash
# Спробуйте приклади та пограйте з бібліотекою:
git clone https://github.com/nan0web/types.git
cd types
npm install
npm run play
```

## Java•Script

Використовує `.d.ts` для автодоповнень у редакторах.

## Внесок

Як внести свій вклад? — [перегляньте інструкції]($pkgURL/blob/main/CONTRIBUTING.md)

## Ліцензія

Як дізнатись про ліцензію? — файл [ISC LICENSE]($pkgURL/blob/main/LICENSE).
