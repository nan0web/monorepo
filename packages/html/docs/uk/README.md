# @nan0web/html

Трансформуйте nano-об’єкти в валідний HTML легко.

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                            | Покриття тестами | Функції                            | Версія Npm |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `99.7%`                                                                            | 🧪 [Англійська 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/html/blob/main/README.md) | 🟢 `100.0%`      | ✅ d.ts 📜 system.md 🕹️ playground | 0.1.1      |

## Опис

Пакет `@nan0web/html` забезпечує мінімальний, але потужний шар трансформації  
для створення чистого, валідного та читабельного HTML із структурованих nano-об’єктів.

Він підтримує:

- **Вкладені структури** — масиви та об’єкти прямо відображаються в дерево елементів.
- **Скорочення атрибутів** — синтаксис `.class` та `#id`.
- **Обробка списків** — автоматичне обгортання в `li` для `ul` та `ol`.
- **Самозакривні теги** — правильна обробка порожніх елементів, як от `meta`, `link`.
- **Підтримка коментарів** — вбудовані коментарі через `{ '#Comment': 'текст' }`.
- **DOCTYPE** — спеціальний ключ `!DOCTYPE` для оголошення типу документа.
- **Екранування** — безпека за замовчуванням через утиліту `escape()`.

Чудово підходить для створення інтерфейсів без шаблонів,  
створення email-шаблонів, рендерингу статичних сторінок  
або роботи з розміткою, що формується на основі конфігурацій.

## Встановлення

Як встановити через npm?

```bash
npm install @nan0web/html
```

Як встановити через pnpm?

```bash
pnpm add @nan0web/html
```

Як встановити через yarn?

```bash
yarn add @nan0web/html
```

## Використання

### Базова трансформація HTML

Трансформуйте простий об’єкт у форматований HTML.

Як трансформувати nano-об’єкт у гарний HTML?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '\n', tab: '\t' })
const nanoData = {
  div: {
    h1: 'Привіт, Всесвіт',
    p: 'Це простий абзац із використанням трансформації nano у HTML',
  },
}

const html = await tr.encode(nanoData)
console.info(html)
// <div>
// 	<h1>Привіт, Всесвіт</h1>
// 	<p>Це простий абзац із використанням трансформації nano у HTML</p>
// </div>
```

Як трансформувати nano у мінімальний HTML (без форматування)?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const nanoData = {
  'div.d-flex#container': [
    { 'span.text-bold': 'Жирний текст' },
    { 'a.btn.btn-primary': 'Основна кнопка', $href: '#', $target: '_blank' },
  ],
}

const html = await tr.encode(nanoData)
console.info(html)
// <div id="container" class="d-flex"><span class="text-bold">Жирний текст</span><a class="btn btn-primary" href="#" target="_blank">Основна кнопка</a></div>
```

### Атрибути та класи

Використовуйте скорочений синтаксис `.class` та `#id` для задання атрибутів.

Як додати класи та ID через крапку та хеш?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = { 'div.header.main#app': 'Вміст' }

const html = await tr.encode(data)
console.info(html)
// <div id="app" class="header main">Вміст</div>
```

Як встановити будь-який HTML-атрибут через ключі `$attr`?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = [{ img: '', $src: 'image.png', $alt: 'Зображення', $loading: 'lazy' }]

const html = await tr.encode(data)
console.info(html)
// <img src="image.png" alt="Зображення" loading="lazy">
```

### Списки (ul/ol)

Автоматично обгортайте елементи масиву в `li`, якщо предок — `ul` або `ol`.

Як відобразити невпорядкований список з елементами?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = [
  {
    ul: [
      'Перший елемент',
      'Другий елемент',
      {
        li: ['Вкладений елемент', { strong: 'із жирним текстом' }],
      },
      'Четвертий елемент',
    ],
  },
]

const html = await tr.encode(data)
console.info(html)
// <ul><li>Перший елемент</li><li>Другий елемент</li><li>Вкладений елемент<strong>із жирним текстом</strong></li><li>Четвертий елемент</li></ul>
```

Як відобразити впорядкований список із мішаним вмістом?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = [
  {
    ol: [
      'Перший крок',
      'Другий крок',
      {
        li: ['Підкрок', { em: 'із емфазою' }],
      },
      'Фінальний крок',
    ],
  },
]

const html = await tr.encode(data)
console.info(html)
// <ol><li>Перший крок</li><li>Другий крок</li><li>Підкрок<em>із емфазою</em></li><li>Фінальний крок</li></ol>
```

### Екранування вмісту

Використовуйте утиліту `escape()` для попередження XSS та безпечного виводу.

Як безпечно екранувати небезпечний HTML-вміст?

```js
import { escape } from '@nan0web/html'
const unsafe = '<script>alert("xss")</script>'
const safe = escape(unsafe)
console.info(safe)
// &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

Як змішати екранований і неекранований текст у структурі?

```js
import { HTMLTransformer, escape } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = {
  p: [
    'Ввід користувача: <malicious> тепер безпечний.',
    escape("<code>console.log('test');</code>"),
  ],
}

const html = await tr.encode(data)
console.info(html)
// <p>Ввід користувача: &lt;malicious&gt; тепер безпечний.&lt;code&gt;console.log(&#039;test&#039;);&lt;/code&gt;</p>
```

### Спеціальні теги та DOCTYPE

Обробляйте спеціальні елементи: `!DOCTYPE`, `script`, `style`, та коментарі.

Як правильно вказати DOCTYPE та атрибут мови?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '\n', tab: '' })
const data = [
  { '!DOCTYPE': true, $html: true },
  {
    $lang: 'uk',
    html: [{ head: [{ title: 'Сторінка' }] }, { body: [{ h1: 'Привіт' }] }],
  },
]

const html = await tr.encode(data)
console.info(html)
// <!DOCTYPE html>
// <html lang="uk">
// <head><title>Сторінка</title></head>
// <body><h1>Привіт</h1></body>
// </html>
```

Як правильно вивести вбудовані script та style теги?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = [{ script: 'console.log("привіт");' }, { style: '.my-class { color: red; }' }]

const html = await tr.encode(data)
console.info(html)
// <script>console.log("привіт");</script><style>.my-class { color: red; }</style>
```

Як додати коментарі у вивід HTML?

```js
import { HTMLTransformer } from '@nan0web/html'
const tr = new HTMLTransformer({ eol: '', tab: '' })
const data = [
  { p: 'Перед коментарем' },
  { '#Увімкнений режим налагодження': true },
  { p: 'Після коментаря' },
]

const html = await tr.encode(data)
console.info(html)
// <p>Перед коментарем</p><!--Увімкнений режим налагодження--><p>Після коментаря</p>
```

## API

### HTMLTransformer

Трансформує структури nano у HTML-рядки.

- **Параметри конструктора**
  - `tab` — рядок для відступів (типово: `\t`).
  - `eol` — рядок розриву рядка (типово: `\n`).
  - `defaultTags` — налаштування тегів (типово: `HTMLTags`).

- **Методи**
  - `encode(data)` — async функція, що повертає HTML-рядок.
  - `decode(str)` — ще не реалізовано (планується у майбутньому).

### HTMLTags

Типова конфігурація тегів.

- **Властивості**
  - `$default` — типовий тег (типово: `p`).
  - `$nonEmptyTags` — теги, що потребують закриття (наприклад, `script`, `style`).
  - `$attrTrue` — значення для булевих атрибутів (типово: `""`).
  - `$singleChild` — теги, що зникають при єдиному дитячому (наприклад, `tbody`).
  - `$tagAttrs` — відображення скорочених символів (`.class`, `#id`).
  - `ul`, `ol`, `dl`, `table`, `tr`, `select` — типові дитячі теги.

- **Методи**
  - `$selfClosed(tag)` — повертає `></tag>`, якщо потрібно, інакше `>`.

### escape(input)

Утиліта для екранування небезпечних символів у HTML.

- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`

Усі експорти мають бути доступними та функціональними

## Java•Script

Використовує файли `d.ts` для автодоповнення

## CLI Playground

Вивчіть можливості інтерактивно через вбудований демо-скрипт.

Як запустити ігрове поле?

```bash
# Запустити інтерактивне поле
npm run play
```

## Внески

Як зробити внесок? - [див. тут](./CONTRIBUTING.md)

## Ліцензія

Як використовується ISC ліцензія? - [див. тут](./LICENSE)
