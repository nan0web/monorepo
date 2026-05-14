# @nan0web/xml

Перетворювач XML і службові утиліти.

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                          | Покриття тестами | Можливості                         | Npm версія |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `98.8%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/xml/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/xml/blob/main/docs/uk/README.md) | 🟢 `93.5%`       | ✅ d.ts 📜 system.md 🕹️ playground | 1.0.3      |

## Опис

Пакет `@nan0web/xml` надає мінімалістичний, але потужний фундамент для перетворення JS-об’єктів у нано-стилі на XML та обробки типових задач, пов’язаних із XML.

Основні можливості:

- `Case` — Утиліти для трансформації рядків (camel, kebab, snake тощо).
- `escape` — Екранує небезпечні символи у рядках XML.
- `nano2attrs` — Перетворює об’єкт атрибутів на рядок атрибутів XML.
- `nano2xml` — Перетворює JS-об’єкт або масив у форматований рядок XML.
- `XMLTags` — Налаштовувані відображення тегів і логіка самозакриття.
- `XMLTransformer` — Повноцінний клас перетворення, що кодує об’єкти у XML.

Ці інструменти ідеально підходять для створення sitemap, atom-стрічок, конфігураційних файлів або будь-якого структурованого XML-виводу — без потреби у DOM.

## Встановлення

Як встановити через npm?

```bash
npm install @nan0web/xml
```

Як встановити через pnpm?

```bash
pnpm add @nan0web/xml
```

Як встановити через yarn?

```bash
yarn add @nan0web/xml
```

## Використання

### Трансформація рядків

Використовуйте `Case` для перетворення рядків між різними конвенціями іменування.

Як перетворювати рядки між різними стилями?

```js
import { Case } from '@nan0web/xml'
console.info(Case.toCamelCase('hello-world')) // ← helloWorld
console.info(Case.toKebabCase('helloWorld')) // ← hello-world
console.info(Case.toSnakeCase('helloWorld')) // ← hello_world
console.info(Case.toPascalCase('hello-world')) // ← HelloWorld
console.info(Case.toUpperCase('hello')) // ← HELLO
console.info(Case.toLowerCase('HELLO')) // ← hello
```

Як використовувати Case.transform з константами типу?

```js
import { Case } from '@nan0web/xml'
const input = 'my_string-value'
console.info(Case.transform(input, Case.CAMEL)) // ← myStringValue
console.info(Case.transform(input, Case.KEBAB)) // ← my-string-value
console.info(Case.transform(input, Case.SNAKE)) // ← my_string_value
console.info(Case.transform(input, Case.PASCAL)) // ← MyStringValue
console.info(Case.transform(input, Case.UPPER)) // ← MYSTRINGVALUE
console.info(Case.transform('MyVar', Case.LOWER)) // ← myvar
```

### Екранування небезпечних символів

Використовуйте `escape()`, щоб безпечно кодувати спеціальні символи у вмісті XML.

Як екранувати небезпечні символи XML?

```js
import { escape } from '@nan0web/xml'
const input = `&<>"'`
const result = escape(input)
console.info(result) // ← &amp;&lt;&gt;&quot;&#039;
```

Як екранувати, ігноруючи певні символи?

```js
import { escape } from '@nan0web/xml'
const input = `&<>"'`
const result = escape(input, ['<', '>'])
console.info(result) // ← &amp;<>&quot;&#039;
```

Як екранувати примітиви, що не є рядками?

```js
import { escape } from '@nan0web/xml'
console.info(escape(123)) // ← 123
console.info(escape(true)) // ← true
console.info(escape(BigInt(420))) // ← 420
```

### Перетворення атрибутів на рядки XML

Використовуйте `nano2attrs`, щоб перетворити об’єкт атрибутів на серіалізований рядок.

Як перетворити об’єкт атрибутів на рядок атрибутів XML?

```js
import { nano2attrs } from '@nan0web/xml'
const attrs = { $id: 'main', $hidden: true, $title: 'Hello & World' }
const result = nano2attrs(attrs)
console.info(result) // ← ` id="main" hidden title="Hello &amp; World"`
```

Як налаштувати регістр атрибутів та суфікс для true?

```js
import { nano2attrs, Case } from '@nan0web/xml'
const attrs = { $dataValue: 'test', $active: true }
const defaultTags = { $attrCase: Case.UPPER, $attrTrue: '_present' }
const result = nano2attrs(attrs, defaultTags)
console.info(result) // ← ` DATAVALUE="test" ACTIVE_present`
```

Як пропускати невизначені атрибути у виводі?

```js
import { nano2attrs } from '@nan0web/xml'
const attrs = { $id: 'test', $class: undefined, $value: 'ok' }
const result = nano2attrs(attrs)
console.info(result) // ← ` id="test" value="ok"`
```

### Перетворення нано-об’єктів у XML

Використовуйте `nano2xml`, щоб перетворити JS-об’єкти або масиви у рядки XML.

Як перетворити простий об’єкт у XML?

```js
import { nano2xml } from '@nan0web/xml'
const data = { $id: '1', note: 'Hello' }
const xml = nano2xml(data, { indent: '  ', newLine: '\n' })
console.info(xml) // ← `<note id="1">Hello</note>`
```

Як обробляти масиви з обгортанням тегу за замовчуванням?

```js
import { nano2xml } from '@nan0web/xml'
const data = [{ item: 'A' }, { item: 'B' }]
const xml = nano2xml(data, {
  indent: '',
  newLine: '',
  defaultTags: { $default: 'item' },
})
console.info(xml) // ← `<item>A</item><item>B</item>`
```

Як обробляти самозакривні теги?

```js
import { nano2xml } from '@nan0web/xml'
const data = { img: true, $src: 'pic.png' }
const xml = nano2xml(data, {
  defaultTags: {
    $selfClosed: (tag) => tag === 'img',
    $attrCase: 'kebab',
  },
})
console.info(xml.trim()) // ← `<img src="pic.png" />`
```

Як обробляти порожній вміст і логіку самозакриття?

```js
import { nano2xml } from '@nan0web/xml'
const data = { br: '' }
const defaultTags = { $selfClosed: true }
const xml = nano2xml(data, { defaultTags })
console.info(xml) // ← `<br />`
```

Як рендерити коментарі у XML?

```js
import { nano2xml } from '@nan0web/xml'
const data = { root: true, '#comment': 'This is a comment' }
const xml = nano2xml(data, { indent: '\t', newLine: '\n' })
console.info(xml) // ← `<!-- comment: This is a comment -->\n<root></root>`
```

Як рендерити елемент із вбудованими атрибутами (наприклад, div.main#id)?

```js
import { nano2xml } from '@nan0web/xml'
const data = { 'div.container#main': 'Content' }
const defaultTags = { $tagAttrs: { '#': 'id', '.': 'class' } }
const xml = nano2xml(data, { defaultTags })
console.info(xml) // ← `<div id="main" class="container">Content</div>`
```

### Використання конфігурації XMLTags

Використовуйте `XMLTags`, щоб визначити відображення тегів за замовчуванням і поведінку самозакриття.

Як створити і використати власну конфігурацію XMLTags?

```js
import { XMLTags } from '@nan0web/xml'
const tags = new XMLTags()
console.info(tags.$default) // ← element
console.info(tags.books) // ← book
console.info(tags.library) // ← section
console.info(tags.$selfClosed('note')) // ← ></note>
console.info(tags.$selfClosed('?xml')) // ← ?>
```

### Використання XMLTransformer

Використовуйте клас `XMLTransformer` для послідовного кодування нано-об’єктів у XML.

Як створити XMLTransformer з опціями за замовчуванням?

```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
console.info(transformer.tab) // ← \t
console.info(transformer.eol) // ← \n
console.info(transformer.defaultTags instanceof XMLTags) // ← true
```

Як створити XMLTransformer з власними опціями?

```js
import { XMLTransformer, XMLTags } from '@nan0web/xml'
const customTags = new XMLTags()
const transformer = new XMLTransformer({
  tab: '  ',
  eol: '\r\n',
  defaultTags: customTags,
})
console.info(transformer.tab) // ←    (2 пробіли)
console.info(transformer.eol) // ← \r\n
console.info(transformer.defaultTags) // ← XMLTags { ... }
```

Як кодувати дані у XML за допомогою XMLTransformer?

```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
const data = { note: 'Hello World' }
const xml = await transformer.encode(data)
console.info(xml) // ← `<note>Hello World</note>`
```

Як переконатися, що метод decode ще не реалізовано?

```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
const xmlString = '<note>Hello</note>'
await assert.rejects(async () => await transformer.decode(xmlString), {
  message: 'XMLTransformer.decode() is not implemented yet',
})
```

## API

### Case

Службовий клас для трансформації регістру рядків.

- **Статичні константи**
  - `Case.CAMEL` – "camel"
  - `Case.KEBAB` – "kebab"
  - `Case.SNAKE` – "snake"
  - `Case.PASCAL` – "pascal"
  - `Case.UPPER` – "upper"
  - `Case.LOWER` – "lower"

- **Методи**
  - `toCamelCase(str)` – перетворює на camelCase.
  - `toKebabCase(str)` – перетворює на kebab-case.
  - `toSnakeCase(str)` – перетворює на snake_case.
  - `toPascalCase(str)` – перетворює на PascalCase.
  - `toUpperCase(str)` – перетворює на UPPERCASE.
  - `toLowerCase(str)` – перетворює на lowercase.
  - `static transform(str, type)` – застосовує вказане перетворення регістру.

### escape(unsafe, ignore = [])

Екранує спеціальні символи XML у рядку.

- **Параметри**
  - `unsafe` – значення для екранування (рядок, число, булеве, bigint).
  - `ignore` – необов’язковий масив символів, які слід пропустити.
- **Повертає** – екранований рядок.

### nano2attrs(attrs, defaultTags = {})

Перетворює об’єкт атрибутів на рядок атрибутів XML.

- **Параметри**
  - `attrs` – об’єкт, у якому ключі починаються з `$`.
  - `defaultTags` – об’єкт конфігурації з `$attrCase` та `$attrTrue`.
- **Повертає** – серіалізований рядок атрибутів (з початковими пробілами).

### nano2xml(data, { indent, newLine, defaultTags })

Перетворює нано-подібну структуру JS на рядок XML.

- **Параметри**
  - `data` – вхідна структура даних.
  - `indent` – рядок відступу (за замовчуванням: `\t`).
  - `newLine` – рядок нового рядка (за замовчуванням: `\n`).
  - `defaultTags` – конфігурація тегів (наприклад, `$selfClosed`, `$tagAttrs`, правила регістру).
- **Повертає** – форматований рядок XML.

### XMLTags

Теги за замовчуванням і допоміжні методи.

- **Властивості**
  - `$default` – резервне ім’я тега.
  - `books`, `library`, `catalog`, `employees`, `department` – вбудовані відображення тегів.
- **Методи**
  - `$selfClosed(tag)` – повертає `?>` для PI-тегів, `></tag>` інакше.

### XMLTransformer

Клас для кодування нано-об’єктів у XML.

- **Властивості**
  - `tab` – рядок відступу.
  - `eol` – рядок кінця рядка.
  - `defaultTags` – екземпляр XMLTags.
- **Методи**
  - `constructor(options)` – приймає `tab`, `eol`, `defaultTags`.
  - `encode(data)` – перетворює нано-об’єкт на рядок XML.
  - `decode(str)` – _(не реалізовано)_ викидає помилку.

Всі експортовані функції та класи мають бути доступні.

## Java•Script

Використовує файли `d.ts` для автозавершення.

## CLI-майданчик (playground)

Запустіть скрипт майданчика, щоб локально протестувати приклади.

Як запустити скрипт майданчика?

```bash
# Клонуйте репозиторій і запустіть майданчик
git clone https://github.com/nan0web/xml.git
cd xml
npm install
npm run play
```

## Участь у розробці

Як брати участь? — [див. тут](./CONTRIBUTING.md)

## Ліцензія

Як використовується ліцензія ISC? — [див. тут](./LICENSE)
