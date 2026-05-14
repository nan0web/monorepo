---
description: ProvenDoc — стандарт верифікованої документації пакетів
---

- [](./packages/$pkgDir/bin/**)
- [](./packages/$pkgDir/docs/**)
- [](./packages/$pkgDir/package.json)
- [](./packages/$pkgDir/play/**)
- [](./packages/$pkgDir/scripts/**)
- [](./packages/$pkgDir/src/**)
- [](./packages/$pkgDir/tsconfig.json)

---

## Задача

Створи `./packages/$pkgDir/src/README.md.js` або вдоскональ той що є за шаблоном (дотримуйся правил `/code-style` стосовно табуляції і відсутніх `;` наприкінці рядків).

Оскільки README.md.js генерує документацію для реального використання розробниками, вона має працювати 1:1 як описана без mock-ів і різної тестувальної інформації.

Для перевірки використовуємо `console.info`, `assert.equal(console.output()[*][1])` або `assert.deepStrictEqual(console.output(), [...])`.

Іноді потрібно написати клас обгортку щоб імітувати реальну поведінку.

---

# 📄 Шаблон: `README.md.js` — **ProvenDoc Manifest**

> 🧠 Це не просто тест.
> Це — **сценарій життя твого пакету**,
> записаний як приклади, покриті асертом.

## Ключові правила

1. Використовуй питання у тестах: `it("How to ...?")` — це потрібно для генерації datasets.
2. Використовуй `//import doSomething from "current-package"` у кожному блоці щоб цей приклад працював на 100%.
3. Використовуй `console.output()[0][1]` для перевірки значень де `output() => Array<Array<level: string, value: any>>`.
4. **Стоп-маркер DocsParser**: рядок що починається з `assert.` зупиняє збір документації.
   - **Бібліотечні пакети** (`co`, `db`, `i18n`): код між `*/` і `assert.` — це сам приклад. Нічого додаткового не потрібно.
   - **Серверні/API пакети** (`auth-node`, `http-node`): приклади в JSDoc як `curl` команди, а тестовий код (`fetch`) — реалізація що не повинна бути в README. В такому разі `assert.ok(api)` має бути **першим рядком** після `*/`.

## Структура файлу

````js
import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import {
  DatasetParser, // .datasets з it("How to ...?")
  DocsParser, // .md з it("How to ...?")
  runSpawn, // для запуску команд
} from '@nan0web/test'
import {} from /* exports */ './index.js'

const fs = new FS()
let pkg

before(async () => {
  const doc = await fs.loadDocument('package.json', {})
  pkg = doc || {}
})

let console = new NoConsole()
beforeEach(() => {
  console = new NoConsole()
})

function testRender() {
  /**
   * @docs
   * # @nan0web/package-name
   * <!-- %PACKAGE_STATUS% -->
   * ## Description
   * ...
   * ## Installation
   */
  it('How to install with npm?', () => {
    /** ```bash
     * npm install @nan0web/package-name
     * ``` */
    assert.equal(pkg.name, '@nan0web/package-name')
  })

  /**
   * @docs
   * ## Usage
   * ### Basic Example
   */
  it('How to do something?', () => {
    //import { Something } from '@nan0web/package-name'
    const result = Something.from('test')
    console.info(result)
    assert.deepStrictEqual(console.output(), [['info', 'expected']])
  })

  /**
   * @docs
   * ## API
   * ### ClassName
   * * **Properties** ...
   * * **Methods** ...
   */
  it('All exported classes should pass basic test', () => {
    assert.ok(Something)
  })
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
  const parser = new DocsParser()
  const sourceCode = fsNode.readFileSync(fileURLToPath(import.meta.url), 'utf-8')
  const text = String(parser.decode(sourceCode))
  await fs.saveDocument('README.md', text)
  const dataset = DatasetParser.parse(text, pkg.name)
  await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

  it('document is rendered in README.md', async () => {
    const text = await fs.loadDocument('README.md')
    assert.ok(text.includes('## License'))
  })
})
````

## Кожен блок `it()` з `@docs`

```js
/**
 * @docs
 * #### Atomic Header
 */
it('How to ...?', async () => { ... })
```

**Умова зупинки**: Кожен тестовий блок МАЄ закінчуватися викликом `assert`. DocsParser чисто закриває блоки коду при зустрічі `assert`.

## Bun-сумісність

- **ЗАБОРОНЕНО**: Передавати `Function` в `DocsParser.decode()` — Bun (JavaScriptCore) стрипає коментарі з `Function.toString()`.
- **ОБОВ'ЯЗКОВО**: Читати вихідний файл як рядок через `fs.loadDocument('src/README.md.js', '')` і передавати рядок у `parser.decode(source)`.

---

## ✅ Як використовувати шаблон

Українська у шаблоні — інструкція, англійська — те, що потрапляє у генерацію.

Якщо `src/README.md.js` існує — перевір чи він повноцінний, чи є що додати.

1. На основі джерельного коду, тестів, типів і пісочниці згенеруй код і збережи у `src/README.md.js`
2. Заміни `<package-name>` на назву пакета
3. Заміни імпорти та приклади на реальні
4. Додай приклади з: `playground/`, `data/`, `src/`, `types/`, `__tests__/`
5. `//import` коментарі дуже важливі — кожен приклад має працювати у користувача

## Реальні приклади

- [](./packages/co/src/README.md.js)
- [](./packages/xml/src/README.md.js)
- [](./packages/auth-node/src/README.md.js) — серверний патерн з `curl` прикладами та `assert.ok(api)` стоп-маркером
