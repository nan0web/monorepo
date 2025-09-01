- [](./packages/$pkgDir/bin/**)
- [](./packages/$pkgDir/docs/**)
- [](./packages/$pkgDir/package.json)
- [](./packages/$pkgDir/playground/**)
- [](./packages/$pkgDir/scripts/**)
- [](./packages/$pkgDir/src/**)
- [](./packages/$pkgDir/tsconfig.json)

---

## Задача

Створи `./packages/$pkgDir/src/README.md.js` або вдоскональ той що є за шаблоном (дотримуйся правил nan0coder стосовно табуляції і відсутніх ; наприкинці рядків)

---

# 📄 Шаблон: `README.md.js` — **ProvenDoc Manifest**

> 🧠 Це не просто тест.  
> Це — **сценарій життя твого пакету**,  
> записаний як приклади, покриті асертом.

1. Використовуй питання у тестах: `it("How to ...?")` це потрібно для генерації datasets.
1. Використовуй `//import doSomething from "current-package"` у кожному блоці щоб цей приклад працював на 100%.
1. Використовуй `console.output()[0][1]` для перевірки значень де `output() => Array<Array<level: string, value: any>>`.

```js
// src/README.md.js

import { describe, it, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";

// 🔧 Внутрішні інструменти
import { spawn } from "node:child_process";
import DB from "@nan0web/db-fs";
import { NoConsole } from "@nan0web/log";
import { DocsParser, MemoryDB } from "@nan0web/test";

// 📦 Імпортуй свій пакет
import "./index.js";

// 🧪 Передтестові дії: підготуй FS, console, package.json
const fs = new DB();
let pkg;

before(async () => {
  const doc = await fs.loadDocument("package.json", {});
  pkg = doc || {};
});

beforeEach(() => {
  console = new NoConsole(); // фіксуємо вивід
});

/**
 * ✨ Основна функція тестування, яка також генерує README.md
 *
 * Кожен блок коментаря з `@docs` стає частиною `README.md`.
 * Конструкція:
 *   - `it("опис")` → описує, що має бути у документації
 *   - всередині — реальний запуск коду
 *   - `assert` — доводить, що приклад працює і вже не потрапляє до документу, це стоп слово
 *   - `/** @docs *\/` - теж стоп-слово, \/ - це екранований /.
 *
 * Так виникає **ProvenDoc** — документація, доведена до істини.
 * 
 * Зберігай <!-- %PACKAGE_STATUS% -->, цей шаблон автоматично заміняється на статус репозиторія і релізу.
 */
function testReadme() {
  /**
   * @docs
   * # @nan0web/<package-name>
   * 
   * <!-- %PACKAGE_STATUS% -->
   *
   * <Короткий опис призначення пакету в одному абзаці.
   *   Чому він існує? Яку потребу задовольняє?>
   * 
   * ## Installation
   */
  it("How to install with npm?", () => {
    /**
     * ```bash
     * npm install @nan0web/<package-name>
     * ```
     */
    assert.equal(pkg.name, "@nan0web/<package-name>");
  });
  /**
   * @docs
   */
  it("How to install with pnpm?", () => {
    /**
     * ```bash
     * pnpm add @nan0web/<package-name>
     * ```
     */
    assert.equal(pkg.name, "@nan0web/<package-name>");
  });
  /**
   * @docs
   */
  it("How to install with yarn?", () => {
    /**
     * ```bash
     * yarn add @nan0web/<package-name>
     * ```
     */
    assert.equal(pkg.name, "@nan0web/<package-name>");
  });

  /**
   * @docs
   * ## Quick Start
   */
  it("How to run function doSomething?", () => {
    //import doSomething from "current-package"
    // ✨ Приклад: міні-використання
    const result = doSomething("hello");
    console.info(result);
    // 💬 Приклад виводу (для документації)
    console.info(result) // ← "expected"

    // ✅ Асерт: перевірка результату
    assert.equal(console.output(), [["info, "expected"]])
  });

  /**
   * @docs
   * ## Usage with Real Context
   */
  it("How to use in real apps?", () => {
    // Як це використовується в додатку?
    // Додай реалістичний сценарій
    // Наступний рядок з коментарем потрапить у приклад коду без коментаря, тому що відсутній пробіл:
    //import { createT } from "@nan0web/i18n"
    const t = createT({ Save: "Зберегти" });
    const label = t("Save");
    console.info(label); // ← "Зберегти"
    assert.equal(console.output(), [["info, "Зберегти"]])
  });

  /**
   * @docs
   * ## Advanced: Database Integration
   */
  it("How to integrate with database?", async () => {
    //import { I18nDb } from "@nan0web/i18n"
    //import { MemoryDB } from "@nan0web/test"
    const db = new MemoryDB({
      predefined: new Map([
        ["data/uk/_/t.json", { "Welcome!": "Ласкаво просимо!" }],
        ["data/uk/apps/chat/_/t.json", { "Welcome!": "Привіт!" }],
      ]),
    });
    await db.connect();

    // ← реальний код пакету
		const i18n = new I18nDb({ db, locale: 'uk', tPath: '_/t.json' })
		const t = await i18n.createT('uk', 'apps/chat')
		const msg = t('Welcome!')
		console.info(msg) // ← "Привіт!" (дитячий контекст)

    assert.equal(console.output(), [["info", "Привіт!"]])
  });

  /**
   * @docs
   * ## Playground: Try Before You Commit
   */
  it("There is a CLI sandbox to experiment safely:", () => {
    /**
     * ```bash
     * git clone https://github.com/nan0web/<package>.git
     * cd <package>
     * npm install
     * npm run playground
     * ```
     */
    assert.ok(String(pkg.scripts?.playground).includes("playground"));
  });

  /**
   * @docs
   * ## API Reference
   *
   * ### `functionName(input)`
   * Описує, що робить функція.
   *
   * * **Parameters**
   *   * `input` – що очікується.
   *
   * * **Returns**
   *   * опис результату
   */
  it("How to use API function: functionName?", () => {
    // реальний виклик
    const out = functionName("test")
    console.info(out) // ← "result"
    assert.equal(console.output(), [["info", "result"]])
  });

  /**
   * @docs
   * ## Java•Script types & Autocomplete
   * Package is fully typed with jsdoc and d.ts.
   */
  it("How many d.ts files should cover the source?", () => {
    assert.equal(pkg.types, "types/index.d.ts");
  });

  /**
   * @docs
   * ## Contributing
   */
  it("How to participate? - check [CONTRIBUTING.md](./CONTRIBUTING.md)", async () => {
    const text = await fs.loadDocument("CONTRIBUTING.md");
    assert.ok(String(text).includes("# Contributing"));
  });

  /**
   * @docs
   * ## License
   */
  it("How to license? – see [LICENSE](./LICENSE)", async () => {
    const text = await fs.loadDocument("LICENSE");
    assert.ok(String(text).includes("ISC"));
  });
}

describe("ProvenDocs: @nan0web/<package-name>", testReadme);

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
});
```

---

## ✅ Як використовувати шаблон

Українська мова у шаблоні використовується як інструкція, англійська як те, що має потрапити у згенеровану версію, в залежності від контексту. Українська не потрапляє у генерацію.

Якщо документ `src/README.md.js` існує — перевір чи він вже повноцінний, чи є що додати.

Скоріше за все, вже існуючий документ, якщо помилки відсутні, лише доповнювати.

1. На основі джерела коду, тестів, типів і пісочниці згенеруй код і збережи у `src/README.md.js`
2. Заміни `<package-name>` на назву пакета.
3. Заміни імпорти та приклади на реальні.
4. Додай приклади з:
   - `playground/` — реальні сценарії
   - `data/` — локалізація
   - `src/` - код і тести
   - `types/` — API
   - `__tests__/` — окремі складні випадки
5. Будь уважним до коментарів `//import ` вони дуже важливі як приклад код без //. Користувач і розробник мають відкрити приклад і він має працювати.

Приклад доброго використання `README.md.js`:

- [](./packages/types/src/README.md.js)
