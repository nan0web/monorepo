# @nan0web/log

| Назва пакета                                    | [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                              | Покриття тестами | Функції                            | Версія Npm |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| [@nan0web/log](https://github.com/nan0web/log/) | 🟢 `98.7%`                                                                            | 🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/log/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/log/blob/main/docs/uk/README.md) | 🟢 `94.1%`       | ✅ d.ts 📜 system.md 🕹️ playground | —          |

Кросплатформний клас **Logger**, який обгортає методи `console` для **Node.js** та **браузерів**,
з узгодженим інтерфейсом та підтримкою **потокового запису**.

## Опис

Пакет `@nan0web/log` надає мінімальний, але потужний фундамент для систем логування.
Основні класи:

- `Logger` — головний клас логування з підтримкою рівнів, іконок, кольорів, часу та потоків.
- `LogConsole` — обгортає методи консолі для уніфікованого крос‑платформного логування.
- `LoggerFormat` — визначає формат для рівня логування (іконка, колір, фон).
- `NoLogger` — зберігає логи в пам’яті, ідеально підходить для тестування.
- `NoConsole` — зберігає вивід консолі в пам’яті, ідеально підходить для тестування.

Ці класи чудово підходять для створення CLI‑інструментів, шарів відладки, уніфікованих записів і потокової передачі даних до файлів або зовнішніх сервісів.

## Встановлення

Як встановити через **npm**?

```bash
npm install @nan0web/log
```

Як встановити через **pnpm**?

```bash
pnpm add @nan0web/log
```

Як встановити через **yarn**?

```bash
yarn add @nan0web/log
```

## Використання

### Базовий Logger

`Logger` можна створити з рівнем або опціями, і він буде виводити все, що нижче вказаного рівня.

#### Створення інстанції Logger з рівнем

```js
import Logger from '@nan0web/log'
const logger = new Logger('debug')
logger.info(typeof logger.debug) // ← function
logger.info(logger.level) // ← debug
```

#### Створення інстанції Logger з опціями

```js
import Logger from '@nan0web/log'
const logger = new Logger({
  level: 'info',
  icons: true,
  chromo: true,
  time: true,
})
logger.info('Привіт з опціями') // ← TIME‑HH‑II‑SS… ℹ️ Привіт з опціями
```

### Кастомні формати

`Logger` підтримує власні формати для різних рівнів.

```js
import Logger from '@nan0web/log'
const logger = new Logger({
  level: 'debug',
  icons: true,
  formats: [
    ['debug', { icon: '🔍', color: Logger.CYAN }],
    ['info', { icon: 'ℹ️', color: Logger.GREEN }],
    ['warn', { icon: '⚠️', color: Logger.YELLOW }],
    ['error', { icon: '❌', color: Logger.RED }],
    ['success', { icon: '✅', color: Logger.GREEN }],
  ],
})
logger.debug('Налагодження') // ← \x1b[36m🔍 Налагодження\x1b[0m
logger.info('Інформація') // ← \x1b[32mℹ️  Інформація\x1b[0m
logger.warn('Попередження') // ← \x1b[33m⚠️  Попередження\x1b[0m
logger.error('Помилка') // ← \x1b[31m❌ Помилка\x1b[0m
logger.success('Успіх') // ← \x1b[32m✅ Успіх\x1b[0m
```

### Потокове логування

`Logger` дозволяє передавати логи у файли або інші зовнішні сервіси.

```js
import Logger from '@nan0web/log'
let streamOutput = ''
const logger = new Logger({
  stream: async (message) => {
    streamOutput += message
  },
})
logger.broadcast('Потокове повідомлення')
// Очікуємо завершення async-операції
await new Promise((resolve) => setTimeout(resolve, 10))
console.log(streamOutput) // ← Потокове повідомлення
```

### Логування в пам’ять з **NoLogger**

`NoLogger` зберігає логи в пам’яті замість виводу — ідеально для тестування.

```js
import { NoLogger } from '@nan0web/log'
const logger = new NoLogger({ level: 'debug' })
logger.debug('Налагодження')
logger.info('Інформація')
logger.warn('Попередження')
logger.error('Помилка')
logger.success('Успіх')
const logs = logger.output()
console.log(logs)
// ← [ [ 'debug', 'Налагодження' ], [ 'info', 'Інформація' ], … ]
```

### Додаткові можливості

#### Форматування таблиць

```js
import Logger from '@nan0web/log'
const logger = new Logger()
const data = [
  { name: 'Йван', age: 30, city: 'Нью‑Йорк' },
  { name: 'Олена', age: 25, city: 'Лос‑Анджелес' },
  { name: 'Богдан', age: 35, city: 'Чикаго' },
]
// Захопити вивід таблиці за допомогою мок‑консолі
logger.table(data, ['name', 'age', 'city'], { padding: 2, border: 1 })
// ---------------------------
// name    age  city
// Йван    30   Нью‑Йорк
// Олена   25   Лос‑Анджелес
// Богдан  35   Чикаго
// ---------------------------
```

#### Стилізація тексту

```js
import Logger from '@nan0web/log'
const styled = Logger.style('Стилізований текст', {
  color: Logger.MAGENTA,
  bgColor: 'white',
})
console.info(styled) // ← \x1b[35m\x1b[47mСтилізований текст\x1b[0m
```

#### Керування курсором та очищення рядків (для прогрес‑бару)

```js
import Logger from '@nan0web/log'
const logger = new Logger()
logger.info(logger.cursorUp(2)) // ← \x1b[2A
logger.info(logger.cursorDown(1)) // ← \x1b[1B
logger.info(logger.clearLine()) // ← \x1b[2K\r
```

#### Параметр **prefix**

`Logger` може додавати власний префікс до кожного рядка.

```js
const logger = new Logger({ prefix: 'PREFIX> ' })
logger.info('Повідомлення з префіксом') // ← PREFIX> Повідомлення з префіксом
```

## API

### Logger

**Властивості**

| Назва     | Опис                                                                  |
| --------- | --------------------------------------------------------------------- | -------- | -------- | --------- | ---------- |
| `level`   | мінімальний рівень логування (`debug`                                 |  `info`  |  `warn`  |  `error`  |  `silent`) |
| `console` | екземпляр `Console` (або `NoConsole`), що використовується для виводу |
| `icons`   | чи відображати іконки перед повідомленням                             |
| `chromo`  | чи застосовувати кольори (ANSI)                                       |
| `time`    | формат timestamp (за замовчуванням `false`)                           |
| `spent`   | чи виводити різницю часу виконання (за замовчуванням `false`)         |
| `stream`  | функція для асинхронного передачі рядка (за замовчуванням `null`)     |
| `formats` | мапа форматів для різних рівнів                                       |

**Методи**

- `debug(...args)` – логування в режимі налагодження
- `info(...args)` – інформативне повідомлення
- `warn(...args)` – попередження
- `error(...args)` – помилка
- `success(...args)` – успіх (використовує інфо‑канал)
- `log(...args)` – загальне повідомлення
- `setFormat(target, opts)` – задати формат для конкретного рівня
- `setStream(streamFunction)` – визначити функцію потокового запису
- `table(data, columns, options)` – виведення табличних даних
- `write(str)` – безпосередній запис у stdout
- `cursorUp(lines)` / `cursorDown(lines)` – переміщення курсору
- `clear()` – очистити консоль
- `clearLine()` – очистити поточний рядок
- `getWindowSize()` – розміри терміналу `[columns, rows]`
- `cut(str, width)` – обрізати рядок до ширини терміналу
- `static from(input)` – створити `Logger` з рядка або об’єкту опцій
- `static detectLevel(argv)` – визначити рівень за аргументами CLI
- `static createFormat(name, value)` – створити `LoggerFormat`
- `static style(value, styleOptions)` – стилізувати значення (кольори, фон)
- `static stripANSI(str)` – видалити ANSI‑коди
- `static progress(i, len, fixed)` – відсотковий прогрес
- `static spent(checkpoint, fixed)` – час від заданого контрольного пункту
- `static bar(i, len, width, char, space)` – текстовий прогрес‑бар

### LogConsole

**Властивості**

| Назва     | Опис                                                |
| --------- | --------------------------------------------------- |
| `console` | внутрішня консоль (Node.js `console` або браузерна) |
| `prefix`  | префікс, додається до кожного повідомлення          |

**Методи** – аналогічні методам `console`: `debug`, `info`, `warn`, `error`, `log`, `clear`, `assert`, `count`, `countReset`, `dir`, `dirxml`, `group`, `groupCollapsed`, `groupEnd`, `profile`, `profileEnd`, `time`, `timeStamp`, `timeEnd`, `timeLog`, `table`, `trace`.

### LoggerFormat

**Властивості**

| Назва     | Опис                                          |
| --------- | --------------------------------------------- |
| `icon`    | іконка, що відображається перед повідомленням |
| `color`   | ANSI‑колір тексту                             |
| `bgColor` | ANSI‑колір фону                               |

**Метод**

- `static from(input)` – створити об’єкт `LoggerFormat` з існуючого об’єкта або іншого екземпляра.

### NoLogger (розширює `Logger`)

**Властивості**

| Назва     | Опис                                                            |
| --------- | --------------------------------------------------------------- |
| `console` | екземпляр `NoConsole`, який зберігає усі повідомлення в пам’яті |

**Метод**

- `output()` – повертає масив усіх збережених логів у вигляді `[[type, message], …]`.

### NoConsole

**Властивості**

| Назва    | Опис                                                  |
| -------- | ----------------------------------------------------- |
| `silent` | чи придушувати вивід (`true` → нічого не записується) |

**Методи**

- `debug(...args)`, `info(...args)`, `warn(...args)`, `error(...args)`, `log(...args)` – зберігають відповідні повідомлення у внутрішньому масиві.
- `clear()` – очищає масив записів.
- `output(type?)` – повертає всі чи відфільтровані за типом записи.
- `static from(input)` – повертає існуючий або створює новий `NoConsole`.

## JavaScript

Для автодоповнення використовуються лише `.d.ts` файли (у папці `types`).

## CLI Playground

Як запустити демо‑скрипт?

```bash
# Клонування репозиторію та запуск CLI‑демо
git clone https://github.com/nan0web/log.git
cd log
npm install
npm run playground
```

## Внески

Як зробити внесок? – ознайомтеся з [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Ліцензія

Ліцензія – **ISC**. Детальніше у файлі [LICENSE](../../LICENSE).
