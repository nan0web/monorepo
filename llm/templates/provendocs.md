- [](./packages/$pkgDir/bin/**)
- [](./packages/$pkgDir/docs/**)
- [](./packages/$pkgDir/package.json)
- [](./packages/$pkgDir/play/**)
- [](./packages/$pkgDir/scripts/**)
- [](./packages/$pkgDir/src/**)
- [](./packages/$pkgDir/tsconfig.json)

---

## Задача

Створи `./packages/$pkgDir/src/README.md.js` або вдоскональ той що є за шаблоном (дотримуйся правил nan0coder стосовно табуляції і відсутніх ; наприкинці рядків).

Оскільки README.md.js генерує документацію для реального використання розробниками, вона має працювати 1:1 як описана без mock-ів і різної тестувальної інформації.

Для перевірки використовуємо `console.info`, `assert.equal(console.output()[*][1])` або `assert.deepStrictEqual(console.output(), [...])`.

Іноді потрібно написати клас обгортку щоб імітувати реальну поведінку.

---

# 📄 Шаблон: `README.md.js` — **ProvenDoc Manifest**

> 🧠 Це не просто тест.  
> Це — **сценарій життя твого пакету**,  
> записаний як приклади, покриті асертом.

1. Використовуй питання у тестах: `it("How to ...?")` це потрібно для генерації datasets.
1. Використовуй `//import doSomething from "current-package"` у кожному блоці щоб цей приклад працював на 100%.
1. Використовуй `console.output()[0][1]` для перевірки значень де `output() => Array<Array<level: string, value: any>>`.

```js
import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser, // use for .datasets with it("How to ...?"
	DocsParser, // use for .md with it("How to ...?"
	runSpawn, // use for running commands
} from "@nan0web/test"
import {
	Chat,
	Command,
	CommandError,
	CommandMessage,
	Contact,
	Language,
	Message
} from "./index.js"

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach((info) => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/co
	 *
	 * Communication starts here with a simple Message.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/co` package provides a minimal yet powerful foundation for message-based communication systems and contact handling.
	 * Core classes:
	 *
	 * - `Message` — a base class for representing generic messages with timestamps.
	 * - `Chat` — represents chat messages and chains.
	 * - `Contact` — parses and represents contact information with specific URI schemes.
	 * - `Language` — handles localization data including name, icon, code, and locale.
	 * - `Command` — a class for defining CLI commands with options and arguments.
	 * - `CommandMessage` — an extension of `Message`, designed for handling command-line-style messages.
	 * - `CommandOption` — represents individual options or arguments for a command.
	 * - `CommandError` — custom error class for command-related errors.
	 *
	 * These classes are perfect for building parsers,
	 * CLI tools, communication protocols, message validation layers,
	 * and contact or language data management.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/co")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/co")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/co")
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Message
	 *
	 * Messages contain body and time when they were created
	 */
	it("How to create a Message instance from string?", () => {
		//import { Message } from '@nan0web/co'
		const msg = Message.from("Hello world")
		console.info(String(msg)) // 2023-04-01T10:00:00 Hello world
		assert.deepStrictEqual(console.output(), [
			["info", msg.time.toISOString() + " Hello world"]
		])
	})
	/**
	 * @docs
	 */
	it("How to create a Message instance from object?", () => {
		//import { Message } from '@nan0web/co'
		const msg = Message.from({ body: "Hello 2000", time: new Date("2000-01-01") })
		console.info(String(msg)) // 2000-01-01T00:00:00.000Z Hello 2000
		assert.deepStrictEqual(console.output(), [
			["info", "2000-01-01T00:00:00.000Z Hello 2000"]
		])
	})

	/**
	 * @docs
	 * ### Chat Messages
	 *
	 * Chat creates a message chain with authors
	 */
	it("How to create a message chain with authors in a chat?", () => {
		const alice = Contact.from("alice@example.com")
		const bob = Contact.from("bob@example.com")

		const chat = new Chat({
			author: alice,
			body: "Hi Bob!",
			next: new Chat({
				author: bob,
				body: "Hello Alice!"
			})
		})

		const str = String(chat)
		console.info(str)
		assert.ok(console.output()[0][1].includes("Hi Bob!"))
		assert.ok(console.output()[0][1].includes("Hello Alice!"))
		assert.ok(console.output()[0][1].includes("---"))
	})

	/**
	 * @docs
	 * ### Contact Handling
	 *
	 * Contact handles different URIs and string inputs properly
	 */
	it("How to create contact with different URIs and string inputs properly?", () => {
		// Create direct instances
		const email = new Contact({ type: Contact.EMAIL, value: "test@example.com" })
		const phone = Contact.from("+123456") // Auto-detected as telephone
		const address = Contact.parse("123 Main St")  // Auto-detected as address

		// Parse types
		console.info(email.toString()) // "mailto:test@example.com"
		console.info(phone.toString()) // "tel:+123456"
		console.info(address.toString()) // "address:123 Main St"

		// Auto-detect from strings
		const website = Contact.parse("https://example.com") // Auto-detected as URL
		console.info(website) // "https://example.com"
		assert.strictEqual(console.output()[0][1].toString(), "mailto:test@example.com")
		assert.strictEqual(console.output()[1][1].toString(), "tel:+123456")
		assert.strictEqual(console.output()[2][1].toString(), "address:123 Main St")
		assert.strictEqual(console.output()[3][1].type, Contact.URL)
		assert.strictEqual(console.output()[3][1].value, "https://example.com")
	})

	/**
	 * @docs
	 * ### Language Handling
	 *
	 * Language handles ISO codes and string conversion
	 */
	it("How to create a Language instance?", () => {
		const lang = new Language({
			name: "English",
			icon: "🇬🇧",
			code: "en",
			locale: "en-US"
		})

		console.info(String(lang))
		assert.ok(String(console.output()[0][1]).includes("English"))
		assert.ok(String(console.output()[0][1]).includes("🇬🇧"))
	})

	/**
	 * @docs
	 * ### Command with Options and Arguments
	 *
	 * Command can be configured with options and arguments
	 */
	it("How to create a Command configured with options and arguments?", () => {
		const cmd = new Command({
			name: "example",
			help: "An example command",
			options: {
				verbose: [Boolean, false, "Enable verbose output", "v"],
				file: [String, "input.txt", "Input file path", "f"]
			},
			arguments: {
				name: [String, "", "Name of the item to process"],
				"*": [String, "Additional items"]
			}
		})

		const parsed = cmd.parse(["--verbose", "--file", "config.json", "item1", "item2"])
		console.info(parsed.opts.verbose)
		console.info(parsed.opts.file)
		console.info(parsed.args)

		assert.ok(parsed instanceof CommandMessage)
		assert.strictEqual(console.output()[0][1], true)
		assert.strictEqual(console.output()[1][1], "config.json")
		assert.deepStrictEqual(console.output()[2][1], ["item1", "item2"])
	})

	/**
	 * @docs
	 * ### Subcommands
	 *
	 * Command supports subcommands
	 */
	it("How to add sub-commands to main Command instance?", () => {
		const initCmd = new Command({
			name: "init",
			help: "Initialize a new project"
		})
		initCmd.addOption("version", Boolean, false, "Show version", "V")

		const mainCmd = new Command({
			name: "mycli",
			help: "My CLI tool",
			subcommands: [initCmd]
		})

		const msg = mainCmd.parse(["init", "-V"])
		console.info(msg.subCommandMessage.opts.version)
		console.info(msg.subCommandMessage.args)

		assert.strictEqual(console.output()[0][1], true)
		assert.deepStrictEqual(console.output()[1][1], [])
	})

	/**
	 * @docs
	 * ### Errors
	 *
	 * CommandError provides detailed error messages for command validation
	 */
	it("How to handle errors in Commands?", () => {
		try {
			const cmd = new Command({
				name: "example",
				options: {
					count: [Number, 0, "Count value"]
				}
			})
			const msg = cmd.parse(["example", "--count", "invalid"])
			console.info(String(msg)) // ← no output because of thrown error
		} catch (err) {
			if (err instanceof CommandError) {
				console.error(err.message) // ← Invalid number for count: invalid
				console.error(JSON.stringify(err.data)) // ← {"providedValue":"invalid"}
			//}
		//}
				assert.ok(err.message.includes("Invalid number"))
			}
		}
		assert.deepEqual(console.output(), [
			["error", "Invalid number for count: invalid"],
			["error", `{"providedValue":"invalid"}`],
		])
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### Message
	 *
	 * * **Properties**
	 *   * `body` – the actual content of the message.
	 *   * `time` – timestamp of creation.
	 *
	 * * **Methods**
	 *   * `toObject()` – returns `{ body, time }`.
	 *   * `toString()` – formats timestamp and body as a string.
	 *   * `static from(input)` – instantiates from string or object.
	 *
	 * ### Chat
	 *
	 * Extends `Message`.
	 *
	 * * **Properties**
	 *   * `author` – the contact object representing the message sender.
	 *   * `next` – the next chat message in the chain (nullable).
	 *
	 * * **Methods**
	 *   * `get size` – returns the chain length.
	 *   * `get recent` – returns the last chat message in the chain.
	 *   * `toString()` – formats the entire chat chain.
	 *   * `static from(input)` – builds a chat chain from array-like input.
	 *
	 * ### Contact
	 *
	 * * **Static URI prefixes**
	 *   * `Contact.ADDRESS` – `"address:"`
	 *   * `Contact.EMAIL` – `"mailto:"`
	 *   * `Contact.TELEPHONE` – `"tel:"`
	 *   * `Contact.URL` – `"//"`
	 *   * Social links: FACEBOOK, INSTAGRAM, LINKEDIN, SIGNAL, SKYPE, TELEGRAM, VIBER, WHATSAPP, X
	 *
	 * * **Methods**
	 *   * `toString()` – converts to a URI string.
	 *   * `static parse(string)` – detects a URI scheme or uses heuristics to deduce the type.
	 *   * `static from(input)` – returns a Contact instance if one already exists or creates a new one.
	 *
	 * ### Language
	 *
	 * * **Properties**
	 *   * `name` – language name in its native form.
	 *   * `icon` – flag emoji.
	 *   * `code` – ISO 639-1 language code.
	 *   * `locale` – specific locale identifier.
	 *
	 * * **Methods**
	 *   * `toString()` – combines `name` and `icon`.
	 *   * `static from(input)` – creates or returns a Language instance.
	 *
	 * ### Command
	 *
	 * * **Properties**
	 *   * `name` – command name for usage.
	 *   * `help` – command description.
	 *   * `options` – map of command options.
	 *   * `arguments` – map of expected arguments.
	 *   * `subcommands` – nested commands map.
	 *   * `aliases` – shortcut aliases for flags.
	 *
	 * * **Methods**
	 *   * `addOption(name, type, def, help?, alias?)` – adds a command option.
	 *   * `addArgument(name, type, def, help?, required?)` – adds a command argument.
	 *   * `addSubcommand(subcommand)` – adds a subcommand.
	 *   * `parse(argv)` – parses input args and returns CommandMessage.
	 *   * `runHelp()` – generates and returns help output.
	 *   * `generateHelp()` – returns formatted help text.
	 *
	 * ### CommandMessage
	 *
	 * Extends `Message`.
	 *
	 * * **Properties**
	 *   * `name` – used by subcommands.
	 *   * `args` – command arguments.
	 *   * `opts` – parsed flag values.
	 *   * `children` – nested subcommand messages.
	 *
	 * * **Methods**
	 *   * `get subCommand` – returns the name of the first subcommand, if any.
	 *   * `add(message)` – appends a child message.
	 *   * `toString()` – rebuilds full command input string.
	 *   * `static parse(args)` – parses args into a CommandMessage.
	 *   * `static from(input)` – returns unchanged or creates new instance.
	 *
	 * ### CommandOption
	 *
	 * * **Properties**
	 *   * `name` – option identifier.
	 *   * `type` – expected value type (Number, String, Boolean, Array or Class).
	 *   * `def` – default value if not provided.
	 *   * `help` – documentation text.
	 *   * `alias` – short flag alias.
	 *   * `required` – if true, the argument is mandatory.
	 *
	 * * **Methods**
	 *   * `getDefault()` – returns `def`.
	 *   * `isOptional()` – returns true if default is set or required is false.
	 *   * `toObject()` – formats option into a readable object for help generation.
	 *   * `static from()` – accepts raw config in multiple formats and creates an instance.
	 *
	 * ### CommandError
	 *
	 * Extends `Error`.
	 *
	 * * **Properties**
	 *   * `message` – error description.
	 *   * `data` – additional error context for programmatic analysis.
	 *
	 * * **Methods**
	 *   * `toString()` – returns formatted error with message and JSON data.
	 */
	it("All exported classes should pass basic test to ensure API examples work", () => {
		assert.ok(Chat)
		assert.ok(Command)
		assert.ok(CommandError)
		assert.ok(CommandMessage)
		assert.ok(Contact)
		assert.ok(Language)
		assert.ok(Message)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` files for autocompletion", () => {
		assert.equal(pkg.types, "./types/index.d.ts")
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 */
	it("How to run playground script?", async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/co.git
		 * cd i18n
		 * npm install
		 * npm run playground
		 * ```
		 */
		assert.ok(String(pkg.scripts?.playground))
		const response = await runSpawn("git", ["remote", "get-url", "origin"])
		assert.ok(response.code === 0, "git command fails (e.g., not in a git repo)")
		assert.ok(response.text.trim().endsWith(":nan0web/co.git"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license ISC? - [check here](./LICENSE)", async () => {
		/** @docs */
		const text = await fs.loadDocument("LICENSE")
		assert.ok(String(text).includes("ISC"))
	})
}

describe("README.md testing", testRender)

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
})
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

- [](./packages/co/src/README.md.js)
- [](./packages/xml/src/README.md.js)
