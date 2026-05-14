# @nan0web/core

Ядро фреймворку додатків для nan0web, що надає легковаговий контейнер стану з підтримкою бази даних та вбудованою інтернаціоналізацією.

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                            | Покриття тестами | Функціональність                   | Версія Npm |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `98.9%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/core/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/core/blob/main/docs/uk/README.md) | 🟢 `95.3%`       | ✅ d.ts 📜 system.md 🕹️ playground | —          |

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/core
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/core
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/core
```

## Основне використання – AppCore

Створіть екземпляр `AppCore` з моковою БД та огляньте його стан.

Як створити екземпляр AppCore?

```js
import { AppCore } from '@nan0web/core'
const db = new DB()
const core = new AppCore({ db, title: 'Demo', uri: '/demo', locale: 'en' })
console.info(core.title)
console.info(core.uri)
```

## Ініціалізація інтернаціоналізації

Завантажте JSON перекладів з БД та отримайте функцію перекладу.

Як bootstrapI18n завантажує переклади?

```js
const db = new DB({
  predefined: [['i18n/uk.json', { hello: 'Вітаю!' }]],
})
await db.connect()
const core = new AppCore({ db, locale: 'uk' })
await core.init()
const result = core.t('hello')
console.info(result) // ← Вітаю!
```

## Огляд стану

Як отримати поточний стан?

```js
const db = new DB()
const core = new AppCore({ db })
const state = core.state()
```

## Допоміжник AppResult

Як створити екземпляр AppResult?

```js
import { AppResult } from '@nan0web/core'
const res = new AppResult({ content: 'Done', priority: 2, meta: { ok: true } })
console.info(res.content[0]) // ← Done
```

## Контракт run()

Базовий метод `run` викидає помилку – підкласи повинні його реалізувати.

Як поводиться run() коли не перевизначено?

```js
const db = new DB()
const core = new AppCore({ db })
await core.run() // ← викидає помилку → AppCore: run() must be implemented
```

## Внесок

Як внести вклад? - [перевірте тут](./CONTRIBUTING.md)

## Ліцензія

Як ліцензувати ISC? - [перевірте тут](./LICENSE)
