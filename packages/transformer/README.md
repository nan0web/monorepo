# @nan0web/transformer

Basic and agnostic transformer.

| Package name                                                    | [Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Documentation                                                                                                                                                         | Test coverage | Features                           | Npm version |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- | ----------- |
| [@nan0web/transformer](https://github.com/nan0web/transformer/) | 🟢 `99.7%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/transformer/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/transformer/blob/main/docs/uk/README.md) | 🟢 `100.0%`   | ✅ d.ts 📜 system.md 🕹️ playground | —           |

## Description

The `@nan0web/transformer` package provides a lightweight and flexible foundation for sequential data transformation.
It allows you to chain multiple transformation steps (transformers) that can encode and decode data in a predictable, composable way.

A `Transformer` instance collects transformer objects and applies their `encode` or `decode` methods in sequence.
Each transformer may implement one or both methods, and the process is fully asynchronous, allowing integration with async operations.

This package is ideal for:

- Building data pipelines (e.g., encryption, compression, formatting)
- Creating serialization/deserialization layers
- Developing middleware-like processing sequences
- Any scenario where data must pass through multiple stages of transformation

## Installation

How to install with npm?

```bash
npm install @nan0web/transformer
```

How to install with pnpm?

```bash
pnpm add @nan0web/transformer
```

How to install with yarn?

```bash
yarn add @nan0web/transformer
```

## Usage

### Basic Transformation

Create a `Transformer` and add transformer objects with `encode` and/or `decode` methods.

How to chain multiple encoders?

```js
import { Transformer } from '@nan0web/transformer'
const transformer = new Transformer()

const upperCase = {
  encode: async (data) => data.toUpperCase(),
  decode: async (data) => data.toLowerCase(),
}

const addPrefix = {
  encode: async (data) => `[ENC] ${data}`,
  decode: async (data) => data.replace(/^\[ENC\]\s/i, ''),
}

transformer.addTransformer(upperCase)
transformer.addTransformer(addPrefix)

const encoded = await transformer.encode('hello world')
console.info(encoded) // [ENC] HELLO WORLD

const decoded = await transformer.decode(encoded)
console.info(decoded) // hello world
```

How to add and remove transformers dynamically?

```js
import { Transformer } from '@nan0web/transformer'
const transformer = new Transformer()

const spyTransformer = {
  encode: async (data) => `${data} • spy`,
  decode: async (data) => data.replace(/ • spy$/, ''),
}

transformer.addTransformer(spyTransformer)
console.info(transformer.transformers) // ← [spyTransformer]

transformer.removeTransformer(spyTransformer)
console.info(transformer.transformers) // ← []
```

### Skip Non-Implementing Transformers

Transformers without `encode` or `decode` methods are skipped automatically.

How to ensure only transformers with encode/decode are applied?

```js
import { Transformer } from '@nan0web/transformer'
const transformer = new Transformer()

const validEncoder = {
  encode: async (data) => data + '•encoded',
}

const invalidTransformer = {
  process: async (data) => data,
}

transformer.addTransformer(validEncoder)
transformer.addTransformer(invalidTransformer)

const result = await transformer.encode('data')
console.info(result) // data•encoded
```

### Asynchronous Transformers

All transformations are `async`, enabling integration with promises and async operations.

How to use asynchronous transformations with delays?

```js
import { Transformer } from '@nan0web/transformer'
const transformer = new Transformer()

const delayEncode = {
  encode: async (data) => {
    await new Promise((r) => setTimeout(r, 10))
    return `[DELAYED] ${data}`
  },
}

transformer.addTransformer(delayEncode)
const result = await transformer.encode('test')
console.info(result) // [DELAYED] test
```

## API

### Transformer

A class that manages a sequence of transformers.

- **Constructor**
  - `new Transformer()` — creates an empty transformer chain.

- **Properties**
  - `transformers` – array of transformer objects added via `addTransformer`.

- **Methods**
  - `encode(data)` – applies all `encode` methods in sequence.
  - `decode(data)` – applies all `decode` methods in sequence.
  - `addTransformer(t)` – adds a transformer object to the chain.
  - `removeTransformer(t)` – removes a specific transformer object from the chain.

All methods return promises and are `await`-safe.

## Java•Script

Uses `d.ts` files for autocompletion

## CLI Playground

Run local experiments using the playground script.

How to run playground script?

```bash
# Run the playground
npm run play
```

## Contributing

This project follows strict testing and linting rules.

How to contribute? - [check here](./CONTRIBUTING.md)

## License

Licensed under ISC.

How to license ISC? - [check here](./LICENSE)
