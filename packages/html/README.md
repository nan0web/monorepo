# @nan0web/html

HTML utilities for nan0web ecosystem.

| [Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Documentation                                                                                                                                           | Test coverage | Features                           | Npm version |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- | ----------- |
| 🟢 `99.8%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/html/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/html/blob/main/docs/uk/README.md) | 🟢 `100.0%`   | ✅ d.ts 📜 system.md 🕹️ playground | 0.2.0       |

## Installation

How to install with npm?

```bash
npm install @nan0web/html
```

How to install with pnpm?

```bash
pnpm add @nan0web/html
```

How to install with yarn?

```bash
yarn add @nan0web/html
```

## Basic usage – encode nano to HTML

How to encode a simple nano object?

```js
import { HTMLTransformer } from '@nan0web/html'
const transformer = new HTMLTransformer({ eol: '\n', tab: '\t' })
const nano = {
  div: {
    h1: 'Hello World',
    p: 'This is a paragraph',
  },
}
const result = await transformer.encode(nano)
console.info(result)
// <div>\n\t<h1>Hello World</h1>\n\t<p>This is a paragraph</p>\n</div>
```

## Tag attributes – class and id shortcuts

How to render elements with class and id shortcuts?

```js
import { HTMLTransformer } from '@nan0web/html'
const data = [
  {
    'div.d-flex#main': [
      { 'a.btn.btn-primary': 'Button' },
      { 'a#more': 'More' },
      { 'a.btn#detail.btn-success': 'Detail' },
    ],
  },
]
const transformer = new HTMLTransformer({ eol: '', tab: '' })
const result = await transformer.encode(data)
console.info(result)
// <div id="main" class="d-flex"><a class="btn btn-primary">Button</a><a id="more">More</a><a id="detail" class="btn btn-success">Detail</a></div>
```

## Lists – ordered and unordered

How to render ordered list with classes?

```js
import { HTMLTransformer } from '@nan0web/html'
const data = [
  {
    $class: 'list-group',
    ol: [
      { $class: 'list-group-item', li: 'Item 1' },
      { $class: 'list-group-item', li: 'Item 2' },
    ],
  },
]
const transformer = new HTMLTransformer({ eol: '', tab: '' })
const html = await transformer.encode(data)
console.info(html)
// <ol class="list-group"><li class="list-group-item">Item 1</li><li class="list-group-item">Item 2</li></ol>
```

## Raw HTML escaping

The `escape` helper from `@nan0web/xml` can be used to safely
embed text that contains characters with special meaning in HTML.

How to escape raw HTML strings?

```js
import { escape } from '@nan0web/html'
const raw = "<script>alert('xss')</script>"
const escaped = escape(raw)
// &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;
```

## Default HTML5 tags reference

-
- `defaultHTML5Tags` provides a ready‑to‑use instance of `HTMLTags`
- with common defaults (e.g. `$default = 'p'`, `$selfClosed` handling, …).
  \*/
  How to access default HTML5 tag definitions?

```js
import { defaultHTML5Tags } from '@nan0web/html'
console.info(defaultHTML5Tags)
// HTMLTags {
//   '$attrTrue': '',
//   '$default': 'p',
//   '$nonEmptyTags': [
//     'script',
//     'style'
//   ],
//   '$singleChild': [
//     'tbody'
//   ],
//   '$tagAttrs': {
//     '#': 'id',
//     '.': 'class'
//   },
//   dl: 'dt',
//   ol: 'li',
//   select: 'option',
//   table: 'tr',
//   tr: 'td',
//   ul: 'li'
// }
```

## TypeScript declarations

The package ships with declaration files for a better editor experience.

Uses `d.ts` files for autocompletion

## CLI playground

Run the bundled playground script to see a live demo.

How to run the playground script?

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
