# Basic Utilities

A collection of lightweight, zero-dependency tools for common JavaScript tasks.

## Matching & Validation

### `match(test, options)`
Checks if any of the arguments match a string or regex pattern. Optimized for multiple tests.

```js
import { match } from "@nan0web/types"
const fn = match(/^hello$/)
console.info(fn('hello', 'world')) // ← true
```

### `Enum(...values)`
Validates a value (or array of values) against a list of allowed values. Throws `TypeError` if validation fails.

```js
import { Enum } from "@nan0web/types"
const color = Enum('red', 'green', 'blue')
console.info(color('red')) // ← red
console.info(color('yellow')) // ← throws a TypeError
```

### `oneOf(...args)`
Returns a value ONLY if it exists in the list, otherwise returns `undefined`.

```js
import { oneOf } from "@nan0web/types"
const fn = oneOf('a', 'b', 'c')
console.info(fn('b')) // ← "b"
```

---

## Content Handlers

### `undefinedOr(fn)`
Applies `fn` only if the value is not `undefined`.

### `nullOr(fn)`
Applies `fn` only if the value is not `undefined`, otherwise returns `null`.

### `arrayOf(Fn)`
Applies `Fn` to each element of an array.

---

## Conversions & Cloning

### `to(type)`
Converts values into target type-friendly representations. Supported types: `Object`, `Array`, `Boolean`, `Number`, `FullObject`, `UndefinedObject`.

```js
import { to } from "@nan0web/types"
class A { x = 9 }
const converted = to(Object)(new A()) // { x: 9 }
```

### `clone(obj)`
Deeply clones objects, arrays, Maps, Sets, and custom classes. Preserves instances if they have a `.clone()` method.

### `merge(target, source, options?)`
Deeply merges two plain objects or arrays. Supports `$clear` flag as the first element of an array or as a key in an object to reset the structure.
