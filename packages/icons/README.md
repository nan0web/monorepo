# @nan0web/icons

🇺🇦 [Українська](./docs/uk/README.md)

Framework-agnostic SVG icons from react-icons sets — zero React dependency at runtime.

<!-- %PACKAGE_STATUS% -->

## Description

The `@nan0web/icons` package provides a lightweight, universal way to use popular icon sets (like Bootstrap, FontAwesome, Material Design) in any environment (Browser, Node.js, CLI, Lit, React).

It works by extracting icon data at build time, allowing you to render icons as pure SVG strings or DOM elements without bundling heavy React libraries.

## Installation

How to install with npm?
```bash
npm install @nan0web/icons
```

How to install with pnpm?
```bash
pnpm add @nan0web/icons
```

## Usage

### SVG Strings

Perfect for server-side rendering or template literals.

How to render icon as SVG string?
```js
import { toSvg } from '@nan0web/icons'
import { BsBank2 } from '@nan0web/icons/bs'
const svg = toSvg(BsBank2, { size: 24, class: 'text-primary' })
console.info(svg.startsWith('<svg')) // true
console.info(svg.includes('width="24"')) // true
console.info(svg.includes('class="text-primary"')) // true
```
### DOM Elements

Create real SVG elements for direct DOM manipulation.

How to render icon as DOM element?
```js
import { toElement } from '@nan0web/icons'
import { BsStar } from '@nan0web/icons/bs'
const el = toElement(BsStar)
console.info(el.localName) // svg
console.info(el.getAttribute('viewBox')) // 0 0 16 16
```
### Multiple Icon Sets

You can mix icons from different sets in the same project.

How to use multiple icon sets?
```js
import { toSvg } from '@nan0web/icons'
import { BsHeart } from '@nan0web/icons/bs'
const svg = toSvg(BsHeart, { size: 32 })
console.info(svg.includes('width="32"')) // true
console.info(svg.includes('height="32"')) // true
```
### CLI Usage

Use icons in your CLI tools with terminal-friendly characters.

How to use icons in CLI?
```js
import { iconChar } from '@nan0web/icons/adapters/cli'
import { BsBank2 } from '@nan0web/icons/bs'
const char = iconChar(BsBank2)
console.info(char) // 🏦
console.info(iconChar({ tag: 'svg' }, '●')) // ●
```
## Contributing

How to participate? – [see CONTRIBUTING.md]($pkgURL/blob/main/CONTRIBUTING.md)

## License

ISC LICENSE – [see full text]($pkgURL/blob/main/LICENSE)
