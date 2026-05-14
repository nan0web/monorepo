# @nan0web/changelog

Парсити та змінювати changelog-и програмно.

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                      | Тестове покриття | Фічі                               | Версія npm |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `99.0%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/changelog/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/changelog/blob/main/docs/uk/README.md) | 🟢 `94.6%`       | ✅ d.ts 📜 system.md 🕹️ playground | 0.1.0      |

## Опис

Пакет `@nan0web/changelog` надає інструменти для парсингу, маніпуляції та генерації файлів `CHANGELOG.md` у структурованому вигляді.  
Натхненний [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) та [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Основні класи:

- `Changelog` — парсить та керує всім документом changelog.
- `Version` — представляє запис про версію з можливістю порівняння SemVer.
- `Change` — інкапсулює запис про зміни (наприклад, Added, Fixed тощо).
- `Section` — групує пов'язані зміни під заголовками (наприклад, `### Added`).

Варіанти використання:

- Автоматичне генерування нотаток про релізи.
- Перевірка структури changelog у CI.
- Запит останньої чи конкретної версії змін.
- Програмне додавання нових змін або версій.

## Встановлення

Як встановити за допомогою npm?

```bash
npm install @nan0web/changelog
```

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/changelog
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/changelog
```

## Приклад використання

### Ініціалізація Changelog

Створити порожній changelog та додати необхідні метадані.

Як ініціалізувати новий Changelog?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
log.init()

console.info(String(log.document))
// # Changelog
// All notable changes to this project will be documented in this file.

// The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

// ---
```

### Парсинг існуючого Changelog

Перетворити markdown‑строку в структурований changelog.

Як парсити існуючий текст changelog?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
const text = `# Changelog
All notable changes to this project will be documented in this file.

## [1.0.0] - 2023-12-01
### Added
- Initial release`
log.parse(text)

console.info(String(log.document))
// # Changelog
// All notable changes to this project will be documented in this file.

// ---

// ## [1.0.0] - 2023-12-01
// ### Added

// - Initial release
```

### Додати нову зміну

Створити `Change` та додати його до потрібної версії.

Як додати нову зміну до версії?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
log.parse(`# Changelog
\n
## [1.0.0] - 2023-12-01
### Added
- Initial release`)

const recent = log.getRecentVersion()
recent?.getSection('Added')?.add('New CLI support')

console.info(String(log.document))
// # Changelog

// ---

// ## [1.0.0] - 2023-12-01
// ### Added

// - Initial release
// - New CLI support
```

### Додати ще одну зміну до існуючої версії

Додавати зміни поступово до однієї й тієї ж версії.

Як додати додаткові зміни до існуючої версії?

```js
import { Changelog, Version, Section } from '@nan0web/changelog'
const log = new Changelog()

// Ініціалізуємо з деяким вмістом
log.init()
const version = new Version({
  major: 1,
  minor: 1,
  patch: 0,
  date: '2024-03-01',
})
version.add(new Section({ content: 'Added' }).add('New CLI support'))
version.add(new Section({ content: 'Fixed' }).add('Bug in version parsing'))

log.document.add(version)
version.getSection('Fixed')?.add('Crash on startup')

console.info(String(log.document))
// # Changelog
// All notable changes to this project will be documented in this file.

// The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

// ---
// ## [1.1.0] - 2024-03-01
// ### Added
// - New CLI support

// ### Fixed
// - Bug in version parsing
// - Crash on startup
```

### Отримати версії

Витягнути список версій у порядку їх появи (спочатку новіша).

Як отримати список версій у changelog?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
log.parse(`# Changelog
\n
## [1.1.1] - 2024-02-15
\n
## [1.1.0] - 2024-01-20
\n
## [1.0.0] - 2023-12-01`)

const versions = log.getVersions()
console.info(JSON.stringify(versions))
// ["1.1.1","1.1.0","1.0.0"]
```

### Отримати останню та найбільш недавню версію

Використовуйте `getLatestVersion()` для найстарішої, `getRecentVersion()` — для найновішої.

Як отримати останню та найбільш недавню версію?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
log.parse(`# Changelog
\n
## [1.1.1] - 2024-02-15
\n
## [1.1.0] - 2024-01-20
\n
## [1.0.0] - 2023-12-01`)

const latest = log.getLatestVersion()
const recent = log.getRecentVersion()

console.info(`Latest: ${latest?.ver}, Recent: ${recent?.ver}`)
// Latest: 1.0.0, Recent: 1.1.1
```

### Отримати зміни конкретної версії

Витягнути структуровані дані для певної версії.

Як отримати зміни конкретної версії?

```js
import { Changelog } from '@nan0web/changelog'
const log = new Changelog()
log.parse(`# Changelog
\n
## [1.1.0] - 2024-01-20
### Added
- Dark mode
- CSV export
\n
## [1.0.0] - 2023-12-01
### Added
- Initial release`)

const entry = log.getVersion('1.1.0')
console.info(JSON.stringify(entry?.ver))
// "1.1.0"
```

### Порівняння версій

Порівнювати версії за правилами SemVer.

Як порівнювати версії за SemVer?

```js
import { Version } from '@nan0web/changelog'
const v1 = new Version('1.2.3')
const v2 = new Version('1.2.4')
const v3 = new Version('1.3.0')

console.info(`v1 < v2: ${v1.lowerThan(v2)}`)
// v1 < v2: true
console.info(`v2 > v1: ${v2.higherThan(v1)}`)
// v2 > v1: true
console.info(`v3 >= v1: ${v3.acceptableTo(v1)}`)
// v3 >= v1: true
```

### Форматування рядка версії

Генерувати рядки версії у markdown або у звичайному тексті.

Як формувати Version як рядок у різних форматах?

```js
import { Version, Section } from '@nan0web/changelog'
const v = new Version({ major: 1, minor: 2, patch: 3, date: '2025-01-01' })
const section = new Section({ content: 'Added' })
section.add(new Change({ content: 'New feature' }))
v.add(section)

console.info(`Markdown:\n${v.toString()}`)
// Markdown:
// ## [1.2.3] - 2025-01-01
// ### Added
// - New feature

console.info(`Text:\n${v.toString({ format: '.txt' })}`)
// Text:
// v1.2.3 - 2025-01-01
//   Added
//     - New feature
```

## API

### Changelog

- **Властивості**
  - `versions` – Map рядків версій до інстансів `Version`.
  - `title` – `MDHeading1` документа.
  - `document` – дерево кореневого `MDElement`.

- **Методи**
  - `parse(text)` – парсить markdown у структуру блоків.
  - `getVersions()` – повертає масив рядків версій.
  - `getVersion(version)` – повертає об’єкт `Version` для вказаної версії.
  - `addChange(change)` – додає `Change` до відповідної версії.
  - `getLatestVersion()` – повертає найстарішу версію (останню у файлі).
  - `getRecentVersion()` – повертає найновішу версію (першу у файлі).
  - `init()` – ініціалізує новий changelog з шаблоном.

### Version

- **Властивості**
  - `major`, `minor`, `patch` – компоненти SemVer.
  - `date` – дата релізу.
  - `ver` – геттер, що повертає рядок `"major.minor.patch"`.
  - `content` – відформатований рядок версії.

- **Методи**
  - `higherThan(other)` – true, якщо ця версія більша.
  - `lowerThan(other)` – true, якщо ця версія менша.
  - `acceptableTo(other)` – true, якщо ця >= інша.
  - `toString()` – повертає markdown‑рядок версії та її діти.
  - `toString({ format: '.txt' })` – повертає плоский текстовий рядок.
  - `static from(input)` – створює Version зі строки/об’єкта.

### Change

- **Властивості**
  - `major`, `minor`, `patch` – цільова версія.
  - `date` – дата зміни.
  - `content` – опис зміни.

- **Методи**
  - `static from(input)` – повертає інстанс Change.
  - `static fromElementString(str)` – парсить зі строки markdown‑елементу списку.

### Section

- **Методи**
  - `add(change)` – додає елемент зміни до секції.

## JavaScript

Використовує файли `d.ts` для автодоповнення.

## CLI Playground

Запуск інтерактивних демо.

Як запустити скрипт playground?

```bash
pnpm play
```

## Внесок

Як долучитися? – [дивіться тут](./CONTRIBUTING.md)

## Ліцензія

Як задати ліцензію ISC? – [дивіться тут](./LICENSE)
