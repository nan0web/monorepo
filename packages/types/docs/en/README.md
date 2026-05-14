# @nan0web/types

[English](README.md) | [Українська](../uk/README.md)

<!-- %PACKAGE_STATUS% -->

A minimal, zero-dependency toolkit for managing JavaScript data structures,
conversions, and type validation. Built for [nan0web philosophy](https://github.com/nan0web/monorepo/blob/main/system.md#nanweb-nan0web),
where zero represents the infinite source (universe), from which emerge meaningful structures.

This package helps you work safely with types, objects, arrays, NaN0 format documents,
and basic tree structures like indented texts. It is especially useful in monorepos
where lightweight, proven, reusable utilities are essential.

## Installation

How to install with npm?
```bash
npm install @nan0web/types
```

How to install with pnpm?
```bash
pnpm add @nan0web/types
```

How to install with yarn?
```bash
yarn add @nan0web/types
```

## Core Concepts

This package is designed with minimalism and precision:
- ✅ Fully typed with **JSDoc** and `.d.ts` files
- 🔁 Supports both sync and async operations
- 🧠 Built for cognitive clarity: each function has a clear purpose
- 🌱 No external dependencies

## Usage: Basic Types

### `match(test, options)`
Checks if any of the arguments match a string or regex pattern.

- **Parameters**
  - `test` (string|RegExp) – Pattern to match against.
  - `options` (object, optional) – Matching settings.
    - `caseInsensitive` (boolean) – Default `false`.
    - `stringFn` (string) – A method like `includes`, `startsWith`.
    - `method` ("some"|"every") – Whether check one or all args. Default `"some"`.

How to use `match(regex)`?
```js
import { match } from "@nan0web/types"
const fn = match(/^hello$/)
console.info(fn('hello', 'world')) // ← true
console.info(fn('world')) // ← false
```
### `Enum(...values)`

Validates a value (or array of values) against a list of allowed values
or custom validator functions.

How to validate with Enum?
```js
import { Enum } from "@nan0web/types"
const color = Enum('red', 'green', 'blue')
console.info(color('red')) // ← red
console.info(color('yellow')) // ← throws a TypeError → Enumeration must have one value of..
```
### `oneOf(...args)`
Returns a value if it exists in the list, otherwise returns undefined.

How to use oneOf?
```js
import { oneOf } from "@nan0web/types"
const fn = oneOf('a', 'b', 'c')
console.info(fn('b')) // ← "b"
console.info(fn('z')) // ← undefined
```
### `undefinedOr(fn)`
Applies `fn` only if the value is not `undefined`, otherwise returns `undefined`.

How to use undefinedOr(fn)?
```js
import { undefinedOr } from "@nan0web/types"
const fn = undefinedOr((x) => x * 2)
console.info(fn(5)) // ← 10
console.info(fn(undefined)) // ← undefined
```
### `nullOr(fn)`
Applies `fn` only if the value is not `undefined`, otherwise returns `null`.

How to use nullOr(fn)?
```js
import { nullOr } from "@nan0web/types"
const fn = nullOr((x) => x + 1)
console.info(fn(1)) // ← 2
console.info(fn(undefined)) // ← null
```
### `arrayOf(Fn)`
Applies `Fn` to each element of an array.

How to map array with arrayOf(fn)?
```js
import { arrayOf } from "@nan0web/types"
const fn = arrayOf((x) => x.toUpperCase())
console.info(fn(['a', 'b'])) // ← [ 'A', 'B' ]
```
### `typeOf(Fn)`
Checks if value is instance of the given type (or primitive).

How to check type with typeOf(String)?
```js
import { typeOf } from "@nan0web/types"
const fn = typeOf(String)
console.info(fn('hello')) // ← true
console.info(fn(123)) // ← false
```
### `functionOf(value)`
Attempts to return the constructor for a given value.

How to get constructor with functionOf?
```js
import { functionOf } from "@nan0web/types"
console.info(functionOf('hello')) // ← [Function: String]
console.info(functionOf(123)) // ← [Function: Number]
console.info(functionOf(new Date())) // ← [Function (anonymous)]
```
### `resolveAliases(Class, input)`

Scans static properties of a class for `alias` keys and remaps
input data accordingly. This is useful for maintaining backward
compatibility or mapping short names to descriptive property names.

How to resolve aliases from static metadata?
```js
import { resolveAliases } from "@nan0web/types"
class Config {
	static appName = { alias: 'name' }
}
const data = resolveAliases(Config, { name: 'my-app' })
console.info(data) // ← { appName: "my-app" }
```
### `resolveDefaults(Class, target)`

Applies `default` values from static class metadata to a target object.
This ensures your instance always has a valid initial state based on
the class schema.

How to apply defaults from static metadata?
```js
import { resolveDefaults } from "@nan0web/types"
class Config {
	static port = { default: 3000 }
	static theme = { default: 'dark' }
}
const settings = { port: 8080 }
resolveDefaults(Config, settings)
console.info(settings) // ← { port: 8080, theme: "dark" }
```
### `resolveValidation(Class, target)`

Performs batch validation of an object against static metadata rules defined
in a class. If any validation fails, it throws a `ModelError`.

How to validate model via resolveValidation?
```js
import { resolveValidation, ModelError } from "@nan0web/types"
class User {
	static name = {
		validate: (v) => v.length > 2 || 'Name too short',
	}
	static age = {
		validate: (v) => v >= 18 || 'Must be an adult',
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

A structured error class for validation failures. It holds a map of fields
that failed validation and their respective error messages.

How to use ModelError for structured errors?
```js
import { ModelError } from "@nan0web/types"
const error = new ModelError({
	email: 'Invalid format',
	password: ['Too short {min}', { min: 8 }],
})
console.info(error.fields.email) // ← "Invalid format"
```
### `empty(...values)`
Checks if any of provided values are considered empty.

How to check for empty values?
```js
import { empty } from "@nan0web/types"
console.info(empty(undefined)) // ← true
console.info(empty('')) // ← true
console.info(empty({})) // ← true
console.info(empty(null)) // ← true
console.info(empty([])) // ← true
console.info(empty(0)) // ← false
```
### `equal(...args)`
Compares pairs of arguments for strict equality (e.g., `equal(a, b, c, d)` → `a === b && c === d`).

How to compare values strictly with equal()?
```js
import { equal } from "@nan0web/types"
console.info(equal('a', 'a', 'b', 'b')) // ← true
console.info(equal(1, '1')) // ← false
```
## Conversions & Utilities

### `to(type)`

Converts values into target type-friendly representations (e.g., `.toObject()` or `.toArray()`).

How to convert using to(Object)?
```js
import { to } from "@nan0web/types"
class A {
	x = 9
}
const converted = to(Object)(new A())
console.info(converted) // ← { x: 9 }
```
### `ContainerObject`

A base class for creating hierarchical tree structures. It provides
a level-tracking system and an `.add()` method for children.

How to build a custom tree with ContainerObject?
```js
import { ContainerObject } from "@nan0web/types"
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
	 * Adds element to the container.
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

A base class whose `.toObject()` skips properties with empty values.

How to use NonEmptyObject to filter empty values?
```js
import { NonEmptyObject } from "@nan0web/types"
class B extends NonEmptyObject {
	name = 'Name'
	emptyValue = ''
}
const obj = new B().toObject()
console.info(obj) // ← { name: "Name" }
```
### FullObject

A marker class used via `to(FullObject)` to collect all enumerable properties,
including those from prototype chain (like getters).

How to collect everything with to(FullObject)?
```js
import { to, FullObject } from "@nan0web/types"
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

A helper used via `to(UndefinedObject)` to keep `undefined` values in objects.

How to keep `undefined` in objects via to(UndefinedObject)?
```js
import { to, UndefinedObject } from "@nan0web/types"
const data = { x: 9, y: undefined }
const obj = to(UndefinedObject)(data)
console.info(obj) // ← { x: 9, y: undefined }
```
### Strict Boolean cast

`to("boolean")` (or `to(Boolean)`) coerces any value to a boolean.
The conversion follows JavaScript truthiness rules.

How to cast to Boolean with strict cast?
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
### Strict Number cast

`to("number")` (or `to(Number)`) converts values to numbers.
Non‑numeric strings become `NaN`; `null`/`undefined` become `0`.

How to cast to Number with strict cast?
```js
const fn = to('number')
console.info(fn('42')) // ← 42
console.info(fn('foo')) // ← NaN
console.info(fn(null)) // ← 0
console.info(fn(undefined)) // ← 0
```
### `clone(obj)`
Deep clones objects, arrays, Maps, Sets, and custom classes.

How to deeply clone objects?
```js
import { clone } from "@nan0web/types"
const original = { a: { b: [1, 2] } }
const copy = clone(original)
console.info(copy) // ← { a: { b: [ 1, 2 ] } }
```
### `merge(target, source, options?)`
Deeply merges two plain objects or arrays, optionally preserving uniqueness.

How to merge two objects?
```js
import { merge } from "@nan0web/types"
const a = { x: 1, nested: { a: 1 } }
const b = { y: 2, nested: { b: 2 } }
const result = merge(a, b)
console.info(result) // ← { x: 1, nested: { a: 1, b: 2 }, y: 2 }
```
### `TFunction` (Contract)

A function type definition for translations:
`(key: string, vars?: Record<string, any>) => string`

### `createT(vocabulary, locale)`

A lightweight internationalization engine that supports variable substitution,
recursive pluralization, and numeric shorthands.

/**
@docs
### Symmetrical i18n Validation

This package establishes a pattern for **Symmetrical i18n Validation**.
By using `createT` (the factory) and `TFunction` (the contract), you can
define validation rules in your domain models that return translatable
structures (e.g., `["Invalid DSN: {dsn}", { dsn: value }]`).

These errors are caught as `ModelError` and translated at any UI layer
(CLI, Web, Mobile) using a local `TFunction` instance.

How to use createT for translations?
```js
import { createT } from "@nan0web/types"
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
// Basic substitution
console.info(t('Hello {name}', { name: 'Світ' })) // ← "Привіт, Світ!"
// Numeric shorthand for plurals (apples: 5 -> t('apples', { $count: 5, count: 5 }))
console.info(t('I have {apples}', { apples: 5 })) // ← "У мене є 5 яблук"
```
### `isConstructible(fn)`
Checks whether a function can be called with `new`.

How to check if function is constructible?
```js
import { isConstructible } from "@nan0web/types"
console.info(isConstructible(class X {})) // ← true
console.info(isConstructible(() => {})) // ← false
```
## Parser & Tree Structures

### `Parser`
Basic indentation-based document parser: splits rows into `Node` hierarchy.

How to parse indented string with Parser?
```js
import { Parser } from "@nan0web/types"
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
Generic tree node that holds content and children.
You can extend it into format-specific nodes (e.g., Markdown AST).

How to build a tree with Node?
```js
import { Node } from "@nan0web/types"
const root = new Node({ content: 'root' })
const child = new Node({ content: 'child' })
root.add(child)
console.info(String(root)) // ← "root\n\tchild"
```
## NaN0 Format

The **NaN0** format is a minimal, human‑readable serialization language designed
for typed data. It was architecturally designed as a **faster subset of YAML**,
optimized specifically for performance-critical JavaScript applications while keeping
the human-friendly indentation-based syntax.

It balances readability with strict typing rules, making it ideal for configuration
files, test fixtures, and data exchange where minimal syntax noise is required.

### ⚡ Performance Benchmark (macOS, ~21 kB)

NaN0 closes the gap between the speed of native JSON and the readability of YAML/Markdown.

| Format          | Source     | Size (rel.) | Parse Speed (vs JSON) | Use Case |
|-----------------|------------|-------------|-----------------------|-------------|
| **JSON**        | Native V8  | 100%        | **1.0x**              | Machine-to-machine |
| **NaN0**        | Core JS    | 101.1%      | **5.3x - 5.5x**       | **Fastest human format** |
| **MD+N0**       | Hybrid     | 100.3%      | **5.0x - 5.1x**       | Articles with metadata |
| **YAML**        | `yaml` lib | 105.7%      | **55.7x**             | Industry standard |
| **MD (YAML)***  | `yaml` lib | 103.6%      | **62.3x**             | Old-school MD |

> \* **Standard MD (YAML)** uses standard YAML frontmatter. By switching to **MD+NaN0**,
> you get a **12x parsing speedup** for Markdown content.

### General Rules

- **Top‑level** value may be an **object** or an **array**.
- **Indentation** (two spaces) defines nesting – the same principle as in Python.
- **Comments** start with `#` and may appear before any node (object key,
  array item, or empty container). Consecutive comment lines are merged.
- **Empty containers**
  - `[]` → empty array
  - `{}` → empty object
  - If an empty container has a preceding comment, the comment is attached to the
    container (array index `[0]` for top‑level arrays, `.` for top‑level objects).

### Primitive Types

| Type      | Representation                               | Example                               |
|----------|---------------------------------------------|---------------------------------------|
| **String** | Plain text **unless** it contains whitespace,
`:` or `#`, it must be quoted with double quotes. |
`"escaped \" quote"` |
| **Multiline String** | Prefixed by `|` on the value line; following indented lines form the
string (newlines are preserved). |
`desc: |\n  line one\n  line two` |
| **Number** | Digits may contain underscores for readability.
Both integers and floats are supported. |
`160_000_500.345` |
| **Boolean** | Literal `true` or `false`. |
`true` |
| **Null** | Literal `null`. |
`null` |
| **Date / DateTime** | ISO‑8601 without timezone (`YYYY‑MM‑DD`) or with time
(`YYYY‑MM‑DDTHH:MM:SS`). |
`2024-11-13`<br>`2024-11-13T19:34:00` |

### Objects

- Defined by a series of `key: value` lines.
- Keys are plain text (no quoting needed) and may contain spaces.
- Nested objects are expressed by increasing indentation.

How to store objects in NaN0 document into a typed class hierarchy?
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
### Parsing & Stringifying

The library exports two main helpers:

- `NaN0.parse(text [, context])`
  - Returns a JavaScript value.
  - `context.comments` will contain extracted comments with their
    identifier (`.` for root object, `[0]` for top‑level array index, or the
    key name for objects).

- `NaN0.stringify(value [, context])`
  - Produces a NaN0 string.
  - `context.comments` can be used to inject comments back.

Both operations are **round‑trip safe**: `parse(stringify(x))` returns a deep‑equal
structure to `x` (including `Date` objects, numbers with underscores, etc.).

> Comments are not stringifying yet, todo

### Quick Example

The format is intentionally **minimal** – there are no commas, brackets (except for
empty containers), or other punctuation that could clutter the visual structure.

For a complete reference see `src/NaN0.js` and the test suite
`src/NaN0.test.js`.

How to work with NaN0 format?
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
## Playground

How to run CLI sandbox?
```bash
# To try out examples and play with the library:
git clone https://github.com/nan0web/types.git
cd types
npm install
npm run play
```

## Java•Script

Uses `d.ts` to provide autocomplete hints.

## Contributing

How to contribute? - [check here]($pkgURL/blob/main/CONTRIBUTING.md)

## License

How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.
