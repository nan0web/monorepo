# Базові утиліти

Колекція легких інструментів без зовнішніх залежностей для виконання типових завдань JavaScript.

## Порівняння та валідація

### `match(test, options)`
Перевіряє, чи будь-який із аргументів відповідає рядковому шаблону або регулярному виразу. Оптимізовано для перевірки декількох значень одночасно.

```js
import { match } from "@nan0web/types"
const fn = match(/^hello$/)
console.info(fn('hello', 'world')) // ← true
```

### `Enum(...values)`
Валідує значення (або масив значень) за списком дозволених значень. Викидає `TypeError`, якщо валідація не пройшла.

```js
import { Enum } from "@nan0web/types"
const color = Enum('red', 'green', 'blue')
console.info(color('red')) // ← red
console.info(color('yellow')) // ← throws a TypeError
```

### `oneOf(...args)`
Повертає значення ТІЛЬКИ якщо воно є у списку, інакше повертає `undefined`.

```js
import { oneOf } from "@nan0web/types"
const fn = oneOf('a', 'b', 'c')
console.info(fn('b')) // ← "b"
```

---

## Обробники вмісту

### `undefinedOr(fn)`
Застосовує `fn` тільки якщо значення не є `undefined`.

### `nullOr(fn)`
Застосовує `fn` тільки якщо значення не є `undefined`, інакше повертає `null`.

### `arrayOf(Fn)`
Застосовує `Fn` до кожного елемента масиву.

---

## Конверсії та клонування

### `to(type)`
Конвертує значення у представлення, зручне для цільового типу. Підтримувані типи: `Object`, `Array`, `Boolean`, `Number`, `FullObject`, `UndefinedObject`.

```js
import { to } from "@nan0web/types"
class A { x = 9 }
const converted = to(Object)(new A()) // { x: 9 }
```

### `clone(obj)`
Глибоко клонує об'єкти, масиви, Map, Set та кастомні класи. Зберігає інстанси, якщо вони мають метод `.clone()`.

### `merge(target, source, options?)`
Глибоко зливає два простих об'єкти або масиви. Підтримує прапор `$clear` як перший елемент масиву або як ключ у об'єкті для скидання структури.
