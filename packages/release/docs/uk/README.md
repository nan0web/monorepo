# @nan0web/release

| Назва пакету                                            | [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                                      | Покриття тестами | Особливості                        | Версія npm |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| [@nan0web/release](https://github.com/nan0web/release/) | 🟢 `97.1%`                                                                            | 🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/release/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/release/blob/main/docs/uk/README.md) | 🟡 `84.2%`       | ✅ d.ts 📜 system.md 🕹️ playground | —          |

Керування проєктами як код, орієнтоване на Git, підписане GPG та кероване тестами.

На відміну від традиційних інструментів керування проєктами, які потребують постійної синхронізації чи ручних оновлень,
`@nan0web/release` забезпечує структуру проєкту, де:

- Завдання представлені як тести у файлах `.test.js`.
- Статус відстежується через результати виконання тестів.
- Ролі в команді та погодження зберігаються у структурованих файлах.
- Всі зміни підписані, версійовані та компонуємі.

Це гарантує:

- Чітке, автоматизоване відстеження проєкту.
- Незмінні нотатки релізів і рефлексії після них.
- Нульову неоднозначність – завдання не існують, якщо не протестовані.

## Встановлення

Як встановити за допомогою pnpm?

```bash
pnpm add @nan0web/release
```

Як встановити за допомогою npm?

```bash
npm install @nan0web/release
```

Як встановити за допомогою yarn?

```bash
yarn add @nan0web/release
```

## Використання CLI

Почніть із ініціалізації нового релізу:

Як ініціалізувати нову версію релізу?

```bash
release init v1.0.0
```

const cli = new ReleaseCLI()
Показати деталі релізу:

Як показати інформацію про реліз?

```bash
release show [--full]
```

const release = new Release({
version: "v1.0.0",
createdAt: new Date("2025-08-20")
})
console.info(release.version) // v1.0.0
Список усіх релізів у проєкті:

Як отримати список усіх релізів?

```bash
release list [--json]
```

const cli = new ReleaseCLI()
Додати повідомлення до поточного релізу:

Як написати повідомлення до релізу?

```bash
release chat write --user alice "Проблема з пайплайном збірки"
```

const cli = new ReleaseCLI()
Запустити статичний сервер для перегляду релізів:

Як запустити інтерфейс релізів?

```bash
release host [--webui] [--port 3000]
```

const cli = new ReleaseCLI()
Обслуговувати всі файли релізу для локального перегляду:

Як обслуговувати статичні ресурси релізу?

```bash
release serve [--port 8080]
```

const cli = new ReleaseCLI()
Перевірити завдання та цілісність релізу:

Як перевірити завдання релізу?

```bash
release validate [--ignore-fail]
```

const release = new Release({
version: "v1.0.0",
createdAt: new Date("2025-08-20")
})
Завершити реліз з рефлексією:

Як завершити (запечатати) реліз?

```bash
release seal [--message "Усі основні API стабільні і протестовані"]
```

const cli = new ReleaseCLI()

## Основні концепції

### 1. Реліз як об’єкт

Об’єкт `Release` включає:

- `version`: ідентифікатор релізу (vX.Y.Z).
- `createdAt`, `startAt`, `planAt`, `completeAt`: часові мітки.
- `document`: розібраний markdown-документ із структурною орієнтацією.

Усі властивості типізовані та автоматично перевіряються через JSDoc та runtime-аналіз.

Як створити об’єкт Release?

```js
import { Release } from '@nan0web/release'
const release = new Release({
  version: 'v1.0.0',
  createdAt: '2025-08-20T10:00:00Z',
})
console.info(release.version) // ← v1.0.0
console.info(release.createdAt instanceof Date) // ← true
```

### 2. Розпізнавання документа релізу

`ReleaseDocument` розширює `@nan0web/markdown`:

- Структурний аналіз markdown-файлу нотаток релізу
- Видобування розділів і завдань
- Аналіз команд і ролей із frontmatter чи коду

Як перетворити markdown-нотатки релізу у структуровані дані?

```js
import { ReleaseDocument } from '@nan0web/release'
const md = `# v1.0.0 - 2025-08-20

## Огляд
Цей реліз включає поліпшення інтерфейсу та стабілізацію API.

### Завдання
### Done **Реалізувати основний дизайн інтерфейсу** [ui.core-design]
### InProgress **Виправити проблеми адаптивності на мобільних пристроях** [ui.mobile-fixes]`

const doc = ReleaseDocument.from(md)
console.info(doc.version) // ← v1.0.0
console.info(doc.date instanceof Date) // ← true
console.info(doc.document.children instanceof Array) // ← true
```

### 3. Структури персони та команди

Об’єкт `Person` включає:

- `name`: HumanName
- `gender`: HumanGender
- `contacts`: масив HumanContact

Як створити об’єкт Person із типізованими властивостями?

```js
import { Person } from '@nan0web/release'
const person = new Person({
  name: ['Alice', 'Developer'],
  gender: 'female',
  contacts: ['mailto:alice@example.com'],
})
console.info(person.name.firstName) // ← Alice
console.info(person.contacts.length >= 0) // ← true
```

## Архітектура: керування проєктами як код

Ця архітектура розглядає завдання як тести, ролі — як класи, а прогрес — як підтверджені результати.

### Управління завданнями

Завдання фіксуються як `taskId` → `testFilePath` в `ProjectManagement`.
Статус визначається через запуск наборів тестів `node:test`.

Як зареєструвати та перевірити завдання за допомогою тестів?

```js
import { ProjectManagement } from '@nan0web/release'
const pm = new ProjectManagement()
pm.registerTask('task-1', './tests/task1.test.js')
pm.registerTask('task-2', './tests/task2.test.js')

const mockResults = {
  passed: ['task-1'],
  failed: [],
  pending: ['task-2'],
}

pm.validateProjectState = async () => mockResults
const results = await pm.validateProjectState()

console.info(results.passed.includes('task-1')) // ← true
console.info(results.pending.includes('task-2')) // ← true
```

### Обробка релізу

`ReleaseManager` координує релізи і перевіряє готовність.
Він гарантує:

- Всі зареєстровані тести проходять
- Версія правильно збільшується
- Git-тег встановлюється, якщо всі перевірки успішні

Як виконати реліз після перевірки?

```js
import { ReleaseManager, ProjectManagement } from '@nan0web/release'
const pm = new ProjectManagement()
const rm = new ReleaseManager(pm)

rm.calculateVersion = () => 'v1.0.1'
rm.publish = async () => true

const result = await rm.executeRelease('patch')
console.info(result.version) // ← v1.0.1
console.info(result.published) // ← true
```

### Інтеграція з CHANGELOG

Через `ChangelogTaskManager` можна:

- Видобувати означення завдань з записів змін
- Генерувати відповідні тести
- Автоматизувати перевірку завдань у CI

Як розібрати changelog і видобути завдання?

```js
import { ChangelogTaskManager } from '@nan0web/release'
const ctm = new ChangelogTaskManager()
const changelog = `# Зміни

## [1.0.0] - 2025-08-20
### Added
- Створено основну структуру [core.init]
- Додано підтримку нотаток релізу [docs.release-notes]`

const tasks = ctm.parseChangelog(changelog)
console.info(Array.isArray(tasks)) // ← true
console.info(tasks.length >= 0) // ← true
```

## Особливості Java•Script

Використовує JSDoc і .d.ts для автозаповнення

## Демонстрація CLI

Спробуйте пакет у терміналі:

Як запустити демо playground?

```bash
git clone https://github.com/nan0web/release.git
cd release
pnpm install
pnpm run playground
```

## Статус проєкту

Перевірити готовність проєкту можна так:

Як перевірити статус перед публікацією?

```bash
npm test
npm run test:coverage
npm run test:status
```

## Внески

Як зробити внесок? — [перегляньте тут](./CONTRIBUTING.md)

## Ліцензія

Як застосувати ліцензію ISC? — [перегляньте тут](./LICENSE)
