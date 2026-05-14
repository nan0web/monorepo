# @nan0web/icons

🇬🇧 [English](../../README.md)

Фреймворк-агностичні SVG іконки з наборів react-icons — нуль залежностей від React під час виконання.

<!-- %PACKAGE_STATUS% -->

## Опис

Пакет `@nan0web/icons` надає легкий та універсальний спосіб використання популярних наборів іконок (таких як Bootstrap, FontAwesome, Material Design) у будь-якому середовищі (Браузер, Node.js, CLI, Lit, React).

Він працює шляхом вилучення даних іконок під час збірки, що дозволяє рендерити іконки як чисті рядки SVG або DOM-елементи без підключення важких бібліотек React.

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/icons
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/icons
```

## Використання

### SVG рядки

Ідеально для рендерингу на стороні сервера або шаблонних літералів.

Як відрендерити іконку як SVG рядок?

```js
import { toSvg } from '@nan0web/icons'
import { BsBank2 } from '@nan0web/icons/bs'
const svg = toSvg(BsBank2, { size: 24, class: 'text-primary' })
console.info(svg.startsWith('<svg')) // true
console.info(svg.includes('width="24"')) // true
console.info(svg.includes('class="text-primary"')) // true
```

### DOM елементи

Створюйте реальні SVG елементи для прямої маніпуляції з DOM.

Як відрендерити іконку як DOM елемент?

```js
import { toElement } from '@nan0web/icons'
import { BsStar } from '@nan0web/icons/bs'
const el = toElement(BsStar)
console.info(el.localName) // svg
console.info(el.getAttribute('viewBox')) // 0 0 16 16
```

### Кілька наборів іконок

Ви можете комбінувати іконки з різних наборів в одному проєкті.

Як використовувати кілька наборів іконок?

```js
import { toSvg } from '@nan0web/icons'
import { BsHeart } from '@nan0web/icons/bs'
const svg = toSvg(BsHeart, { size: 32 })
console.info(svg.includes('width="32"')) // true
console.info(svg.includes('height="32"')) // true
```

### Використання в CLI

Використовуйте іконки у ваших CLI інструментах як символи, дружні до терміналу.

Як використовувати іконки в CLI?

```js
import { iconChar } from '@nan0web/icons/adapters/cli'
import { BsBank2 } from '@nan0web/icons/bs'
const char = iconChar(BsBank2)
console.info(char) // 🏦
console.info(iconChar({ tag: 'svg' }, '●')) // ●
```

## Сприяння

Як взяти участь? – [див. CONTRIBUTING.md]($pkgURL/blob/main/CONTRIBUTING.md)

## Ліцензія

ЛІЦЕНЗІЯ ISC – [див. повний текст]($pkgURL/blob/main/LICENSE)
