# @nan0web/test

| [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                            | Тестове покриття | Функції                            | Версія Npm |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- | ---------- |
| 🟢 `97.6%`                                                                            | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/test/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/test/blob/main/docs/uk/README.md) | 🟡 `85.9%`       | ✅ d.ts 📜 system.md 🕹️ playground | 1.0.1      |

Тестовий пакет із простими утилітами для тестування в середовищі node.js.
Розроблено відповідно до [філософії nan0web](https://github.com/nan0web/monorepo/blob/main/system.md#%D0%BD%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%BD%D1%8F-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D1%96%D1%97%D0%B2),
де відсутність залежностей означає максимальну свободу та мінімальні припущення.

Цей пакет допомагає створювати ProvenDocs та структуровані набори даних з прикладів тестів,
особливо корисний для тонкого налаштування LLM.

## Встановлення

Як встановити з npm?

```bash
npm install @nan0web/test
```

Як встановити з pnpm?

```bash
pnpm add @nan0web/test
```

Як встановити з yarn?

```bash
yarn add @nan0web/test
```

## Основні концепції

Цей пакет розроблений для забезпечення **Цифрової Гігієни** та повної ізоляції тестів:

- ✅ **Zero-Hallucination**: Кожне слово в документації підтверджено тестом.
- ✅ **JS-Only Typization**: Повна типізація через JSDoc та `.d.ts`.
- ✅ **Happy DOM**: Легке браузерне середовище всередині Node.js (заміна JSDOM).
- ✅ **RRS (Release Readiness Score)**: Система автоматичної оцінки готовності пакета до релізу.
- 🌱 **Total Logic Isolation**: Логіка не залежить від мережі чи реальної FS.

## Використання: Утиліти макетування

### `MemoryDB(options)`

Утиліта для симуляції файлової системи в тестах.

- **Параметри**
  - `options` – об'єкт параметрів, включає:
    - `predefined` – Map із попередньо визначеними файлами (наприклад, `{ 'users.json': '[{ id: 1 }]' }`)

Як створити макет файлової системи через MemoryDB?

```js
import { MemoryDB } from '@nan0web/test'

const db = new MemoryDB({
  predefined: new Map([
    ['file1.txt', 'content1'],
    ['file2.txt', 'content2'],
  ]),
})

await db.connect()
const content = await db.loadDocument('file1.txt')

console.info(content) // 'content1'
```

### `runSpawn(cmd, args, options)`

Утиліта для створення макета і виконання дочірніх процесів (CLI інструменти).

- **Параметри**
  - `cmd` – команда для запуску (наприклад, `"git"`)
  - `args` – масив аргументів
  - `opts` – необов’язкові опції запуску з обробником `onData`

- **Повертає**
  - `{ code: number, text: string }`

Як використовувати runSpawn як тестовий CLI інструмент?

```js
import { runSpawn } from '@nan0web/test'

const { code, text } = await runSpawn('echo', ['hello world'])

console.info(code) // 0
console.info(text.includes('hello world')) // true
```

### `TestPackage(options)`

Клас для автоматичного перевіряння пакетів за стандартами nan0web.

- **Параметри**
  - `options` – метадані пакета та екземпляр бази даних файлової системи

Як перевірити пакет через TestPackage.run(rrs)?

```js
import { TestPackage, RRS } from '@nan0web/test'
const db = new MemoryDB()

db.set('system.md', '# system.md')
db.set('tsconfig.json', '{}')
db.set('README.md', '# README.md')
db.set('LICENSE', 'ISC')

const pkg = new TestPackage({
  db,
  cwd: '.',
  name: '@nan0web/test',
  baseURL: 'https://github.com/nan0web/test',
})

const rrs = new RRS()
const statuses = []

for await (const s of pkg.run(rrs)) {
  statuses.push(s.name + ':' + s.value)
}

console.info(statuses.join('\n'))
```

### `RRS` (Release Readiness Score)

Система оцінки "зрілості" вашого коду. Вона аналізує наявність Git-репозиторію, типів, тестів, покриття (>=90%), документації та playground.

```js
import { RRS } from '@nan0web/test'
const rrs = new RRS()
// ... аналіз пакету через TestPackage
```

### `jsdom` (на базі Happy DOM)

Забезпечує браузерне середовище (window, document, localStorage) для тестів у Node.js.

```js
import "@nan0web/test/jsdom"

it("тест UI", () => {
  document.body.innerHTML = '<div id="app"></div>'
  assert.ok(document.getElementById('app'))
})
```

### `DocsParser`

Парсер для вилучення документації з тестів і генерації markdown (ProvenDoc).

Читає js-тести з коментарями, такими як:

```js
it("Як зробити щось?", () => {
  ...
})
```

і перетворює їх на структуровані `.md` документи.

Як генерувати документацію через DocsParser?

````js
import { DocsParser } from '@nan0web/test'

const parser = new DocsParser()
const md = parser.decode(() => {
  /**
   * @docs
   * # Заголовок
   * Вміст
   */
  it('Як зробити X?', () => {
    /**
     * ```js
     * doX()
     * ```
     */
    assert.ok(true)
  })
})

console.info(md) // ← markdown з вмістом коментарів @docs
````

### `DatasetParser`

Парсер, що перетворює markdown документи (як README.md) на структуровані `.jsonl` набори даних.

Кожен блок "Як зробити..." стає окремим тест-кейсом:

````json
{"instruction": "Як зробити X?", "output": "```js\n doX()\n```", ...}
````

Як генерувати набір даних із markdown документації?

````js
import { DatasetParser } from '@nan0web/test'
const md = '# Заголовок\n\nЯк зробити X?\n```js\ndoX()\n```'
const dataset = DatasetParser.parse(md, '@nan0web/test')

console.info(dataset[0].instruction) // ← "Як зробити X?"
````

## Пісочниця

Цей пакет не використовує важкі макети чи віртуальні середовища — він моделює їх легковагими обгортками.
Ви можете експериментувати у пісочниці так:

Як запустити CLI пісочницю?

```bash
git clone https://github.com/nan0web/test.git
cd test
npm install
npm run play
```

## Компоненти API

Має багато тестових компонентів, що можна імпортувати окремо:

```js
import { MemoryDB, DocsParser, DatasetParser, runSpawn } from '@nan0web/test'
```

## Java•Script типи та автозаповнення

Пакет повністю типізований за допомогою jsdoc і d.ts.

Скільки d.ts файлів має охопити джерело?

## Внесок

Як зробити внесок? – [дивіться тут](https://github.com/nan0web/test/blob/main/CONTRIBUTING.md)

## Ліцензія

ISC – [LICENSE](https://github.com/nan0web/test/blob/main/LICENSE)
