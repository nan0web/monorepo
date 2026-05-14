# @nan0web/transformer

Базовий і агностичний трансформер.

| Назва пакунку                                                   | [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                          | Покриття тестами | Можливості                         | Версія Npm |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| [@nan0web/transformer](https://github.com/nan0web/transformer/) | 🟢 `99.7%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/transformer/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/transformer/blob/main/docs/uk/README.md) | 🟢 `100.0%`      | ✅ d.ts 📜 system.md 🕹️ playground | —          |

## Опис

Пакунок `@nan0web/transformer` надає легку та гнучку основу для послідовного перетворення даних.
Він дозволяє об’єднувати кілька кроків перетворення (трансформерів), які кодують та декодують дані передбачуваним, компонованим способом.

Екземпляр `Transformer` збирає об’єкти-трансформери та послідовно застосовує їхні методи `encode` або `decode`.
Кожен трансформер може реалізовувати один чи обидва методи, а процес є повністю асинхронним, що дозволяє інтеграцію з асинхронними операціями.

Цей пакунок ідеально підходить для:

- Створення конвеєрів даних (наприклад, шифрування, стиснення, форматування)
- Створення шарів серіалізації/десеріалізації
- Розробки обробки, схожої на middleware
- Будь-яких сценаріїв, де дані мають проходити кілька етапів перетворення

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/transformer
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/transformer
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/transformer
```

## Використання

### Базове перетворення

Створіть `Transformer` та додайте об’єкти-трансформери, які мають методи `encode` та/або `decode`.

Як ланцюгувати кілька енкодерів?

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

Як додавати та видаляти трансформери динамічно?

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

### Пропуск трансформерів без реалізації

Трансформери, що не мають методів `encode` чи `decode`, автоматично пропускаються.

Як переконатися, що застосовуються лише трансформери з encode/decode?

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

### Асинхронні трансформери

Усі перетворення є `async`, що дозволяє інтеграцію з промісами та асинхронними операціями.

Як використовувати асинхронні перетворення з затримками?

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

Клас, що керує послідовністю трансформерів.

- **Конструктор**
  - `new Transformer()` — створює порожній ланцюг трансформерів.

- **Властивості**
  - `transformers` – масив об’єктів-трансформерів, доданих через `addTransformer`.

- **Методи**
  - `encode(data)` – послідовно застосовує всі методи `encode`.
  - `decode(data)` – послідовно застосовує всі методи `decode`.
  - `addTransformer(t)` – додає об’єкт-трансформер до ланцюга.
  - `removeTransformer(t)` – видаляє конкретний об’єкт-трансформер з ланцюга.

Усі методи повертають проміси і є безпечними для `await`.

## Java•Script

Використовує файли `d.ts` для автодоповнення

## CLI Playground

Запускайте локальні експерименти за допомогою скрипта playground.

Як запустити скрипт playground?

```bash
# Запустити playground
npm run play
```

## Як зробити внесок

Цей проєкт дотримується суворих правил тестування та лінтингу.

Як зробити внесок? - [перевірте тут](./CONTRIBUTING.md)

## Ліцензія

Ліцензовано за ISC.

Як отримати ліцензію ISC? - [перевірте тут](./LICENSE)
