- [](./docs/**)
- [](./package.json)
- [](./playground/**)
- [](./scripts/**)
- [](./src/**)
- [](./tsconfig.json)
- [](./types/**)

---

## Задача

Створи README.md.test.js або вдоскональ той що є за шаблоном (дотримуйся правил nan0coder стосовно табуляції і відсутніх ; наприкинці рядків)

---

# 📄 Шаблон: `README.md.test.js` — **ProvenDoc Manifest**

> 🧠 Це не просто тест.  
> Це — **сценарій життя твого пакету**,  
> записаний як приклади, покриті асертом.

```js
// src/README.md.test.js

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
 */
function testReadme() {
  /**
   * @docs
   * # @nan0web/<package-name>
   *
   * <Короткий опис призначення пакету в одному абзаці.
   *   Чому він існує? Яку потребу задовольняє?>
   */
  it("## Install", () => {
    /**
     * ```bash
     * npm install @nan0web/<package-name>
     * ```
     */
    assert.equal(pkg.name, "@nan0web/<package-name>");
  });

  /**
   * @docs
   * ## Quick Start
   */
  it("Get started in seconds with minimal setup:", () => {
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
  it("Use in real apps — handle localization, async flow, etc.:", () => {
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
  it("Supports database-backed dictionaries with hierarchical fallback:", async () => {
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
  it("Test API function: functionName", () => {
    // реальний виклик
    const out = functionName("test")
    console.info(out) // ← "result"
    assert.equal(console.output(), [["info", "result"]])
  });

  /**
   * @docs
   * ## Java•Script types & Autocomplete
   */
  it("Uses `d.ts` for full TypeScript support and hints.", () => {
    assert.equal(pkg.types, "types/index.d.ts");
  });

  /**
   * @docs
   * ## Contributing
   */
  it("Want to improve? Check [CONTRIBUTING.md](./CONTRIBUTING.md)", async () => {
    const text = await fs.loadDocument("CONTRIBUTING.md");
    assert.ok(String(text).includes("# Contributing"));
  });

  /**
   * @docs
   * ## License
   */
  it("ISC – see [LICENSE](./LICENSE)", async () => {
    const text = await fs.loadDocument("LICENSE");
    assert.ok(String(text).includes("ISC"));
  });
}

// ✅ Запуск тестів
describe("ProvenDocs: @nan0web/<package-name>", testReadme);

// ✅ Генерація README.md
describe("Rendering README.md", async () => {
  const parser = new DocsParser();
  const text = parser.decode(testReadme);

  await fs.saveDocument("README.md", text);

  it(`README.md rendered [${
    new TextEncoder().encode(text).length
  }b]`, async () => {
    const saved = await fs.loadDocument("README.md");
    assert.ok(saved.includes("## Quick Start"));
  });
});
```

---

## ✅ Як використовувати шаблон

Українська мова у шаблоні використовується як інструкція, англійська як те, що має потрапити у згенеровану версію, в залежності від контексту. Українська не потрапляє у генерацію.

Якщо документ `src/README.md.test.js` існує — перевір чи він вже повноцінний, чи є що додати.

Скоріше за все, вже існуючий документ, якщо помилки відсутні, лише доповнювати.

1. На основі джерела коду, тестів, типів і пісочниці згенеруй код і збережи у `src/README.md.test.js`
2. Заміни `<package-name>` на назву пакета.
3. Заміни імпорти та приклади на реальні.
4. Додай приклади з:
   - `playground/` — реальні сценарії
   - `data/` — локалізація
   - `src/` - код і тести
   - `types/` — API
   - `__tests__/` — окремі складні випадки
