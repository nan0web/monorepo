## Playground (пісочниця)

Гарний приклад реалізовано тут:

#### `packages/ui/playground/User.js`
```js
import FormInput from "../src/core/Form/Input.js"

/**
 * Simple domain model representing a user.
 *
 * The static `formFields` property defines the UI fields that should be
 * displayed when generating a form for this model.
 *
 * Each field is described using `FormInput`, which the UI core library
 * understands.  The `required` flag, `type`, and other properties are
 * respected by the validation routine inside `UIForm`.
 */
export default class User {
	/**
	 * Constructs a new User instance.
	 *
	 * @param {Object} data - Initial data.
	 * @param {string} data.name
	 * @param {string} data.email
	 * @param {number} data.age
	 */
	constructor({ name = "", email = "", age = null } = {}) {
		this.name = String(name)
		this.email = String(email)
		this.age = age !== null ? Number(age) : null
	}

	/** @type {FormInput[]} UI fields for the User model */
	static formFields = [
		new FormInput({
			name: "name",
			label: "Name",
			type: FormInput.TYPES.TEXT,
			required: true,
			placeholder: "Enter full name",
		}),
		new FormInput({
			name: "email",
			label: "Email",
			type: FormInput.TYPES.EMAIL,
			required: true,
			placeholder: "example@domain.com",
		}),
		new FormInput({
			name: "age",
			label: "Age",
			type: FormInput.TYPES.NUMBER,
			required: false,
			placeholder: "Optional",
		}),
	]
}
```
#### `packages/ui/playground/currency.exchange.js`
```js
/**
 * Simple currency exchange console tool.
 *
 * Prompts for:
 *   - From currency (options)
 *   - To currency (options)
 *   - Amount (number)
 *
 * Controls:
 *   - Input "0" on any prompt to cancel.
 *   - Empty input on final confirmation submits.
 */

import { CancelError, select } from "@nan0web/ui-cli"

const rates = {
	USD: 1,
	EUR: 0.9,
	UAH: 27,
	GBP: 0.8,
}

/** Main exchange flow */
export async function runExchange(t, ask, console, prompt, invalidPrompt) {
	/** Choose a currency from available list */
	async function chooseCurrency(title, selected = []) {
		const input = await select({
			title,
			prompt, invalidPrompt, console,
			options: Object.keys(rates).filter(c => !selected.includes(c))
		})
		return input.value
	}

	console.info("\n=== " + t("Currency Exchange") + " ===")
	const from = await chooseCurrency(t("From Currency"))
	if (!from) throw new CancelError()
	const to = await chooseCurrency(t("To Currency"), [from])
	if (!to) throw new CancelError()
	const input = await ask(
		t("Amount") + ": ",
		input => isNaN(input) || Number(input) <= 0,
		t("Invalid amount.") + ": ",
	)
	const amount = Number(input)
	const result = (amount / rates[from]) * rates[to]
	console.success(`\n${amount} ${from} = ${result.toFixed(2)} ${to}\n`)
}

```
#### `packages/ui/playground/language.form.js`
```js
/**
 * Simple currency exchange console tool.
 *
 * Prompts for:
 *   - From currency (options)
 *   - To currency (options)
 *   - Amount (number)
 *
 * Controls:
 *   - Input "0" on any prompt to cancel.
 *   - Empty input on final confirmation submits.
 */
import { localesMap } from "./i18n/index.js"
import { select } from "@nan0web/ui-cli"

/** Main exchange flow */
export async function runLanguage(t, ask, console, prompt, invalidPrompt) {
	const lang = await select({
		title: "\n=== " + t("Language Selector") + " ===",
		prompt, invalidPrompt, console,
		options: Array.from(localesMap.keys()),
	})
	console.success(`\n${lang.value}\n`)
	return lang.value
}

```
#### `packages/ui/playground/main.js`
```js
/**
 * Playground entry point.
 *
 * Choose which demo to run:
 *   1) Select a language
 *   2) Registration Form
 *   3) Currency Exchange
 *   4) Top‑up Telephone
 *
 * Type 0 to exit.
 */
import { argv } from "node:process"
import Logger from "@nan0web/log"
import { runLanguage } from "./language.form.js"
import { runRegistration } from "./registration.form.js"
import { runExchange } from "./currency.exchange.js"
import { runTopup } from "./topup.telephone.js"
import createT, { detectLocale } from "./i18n/index.js"
import createInput, { CancelError, select } from "./ui/index.js"

const console = new Logger(Logger.detectLevel(argv))
let t = createT(detectLocale(argv))
const ask = createInput(["0"])
const menuOptions = [
	"Select a language", // t("Select a language")
	"Registration Form", // t("Registration Form")
	"Currency Exchange", // t("Currency Exchange")
	"Top‑up Telephone", // t("Top‑up Telephone")
]

async function main() {
	console.info(Logger.style(Logger.LOGO, { color: "magenta" }))

	while (true) {
		try {
			const prompt = t("[me]") + ": "
			const invalidPrompt = Logger.style(t("[me invalid]", t("[me]")), { bgColor: "yellow" }) + ": "
			const choice = await select({
				title: t("Select demo:"),
				prompt: t("[me]") + ": ",
				invalidPrompt: Logger.style(t("[me]"), { bgColor: "yellow" }) + ": ",
				options: menuOptions.map(t),
				console,
			})
			switch (choice.index) {
				case 0:
					const lang = await runLanguage(t, ask, console, prompt, invalidPrompt)
					t = createT(lang)
					break
				case 1:
					await runRegistration(t, ask, console, prompt, invalidPrompt)
					break
				case 2:
					await runExchange(t, ask, console, prompt, invalidPrompt)
					break
				case 3:
					await runTopup(t, ask, console, prompt, invalidPrompt)
					break
				default:
					console.warn(t("! Invalid choice."))
			}
		} catch (err) {
			if (err instanceof CancelError) {
				console.warn("\n" + t("⨉ Cancelled."))
				continue
			}
			throw err
		}
	}
}

main()

```
#### `packages/ui/playground/registration.form.js`
```js
/**
 * Simple registration form using stdin.
 *
 * Fields: username, password, confirm, emailOrTel
 *
 * Controls:
 *   - Input "0" -> cancel (onCancel)
 *   - Empty input on final prompt -> submit (onSubmit)
 */
import { CancelError } from "@nan0web/ui-cli"

/**
 * Main registration flow
 * @todo add proper jsdoc to make autocomplete work for input as result of ask, console, t.
 */
export async function runRegistration(t, ask, console) {
	console.info("\n=== " + t("Registration Form") + " ===")
	const data = {}

	// username
	{
		const input = await ask(t("Username") + ": ", true)
		if (input.cancelled) throw new CancelError()
		data.username = input.value
	}
	// password
	{
		const input = await ask(
			t("Password (min 4 chars)") + ": ",
			(input) => input.value.length < 4,
			t("! Password must be at least 4 characters") + ": "
		)
		if (input.cancelled) throw new CancelError()
		data.password = input.value
	}
	// confirm password
	{
		await ask(t("Confirm Password") + ": ", (input) => {
			if (input.value !== data.password) {
				console.error(t("Passwords do not match. Try again."))
				return true
			}
			return false
		})
	}
	// email or telephone
	{
		const input = await ask(t("Email or Telephone") + ": ", true)
		if (input.cancelled) throw new CancelError()
		data.emailOrTel = input.value
	}
	// final confirmation – empty line submits, "0" cancels
	{
		await ask(t("Press ENTER to submit, type 0 to cancel") + ": ", i => "" != i.value)
	}
	console.success("\n" + t("Form submitted successfully!"))
	console.info(JSON.stringify({ ...data, password: "****" }, null, 2))
}

```
#### `packages/ui/playground/topup.telephone.js`
```js
/**
 * Simple telephone top‑up form.
 *
 * Fields: number, amount, currency
 *
 * Controls:
 *   - Input "0" on any prompt to cancel.
 *   - Empty input on final confirmation submits.
 *
 * Validation:
 *   - Phone number must contain only digits and be 7‑15 characters long.
 */
import { CancelError } from "@nan0web/ui-cli"

const rates = {
	USD: 1,
	EUR: 0.9,
	UAH: 27,
}

/** Main top‑up flow */
export async function runTopup(t, ask, console) {
	/** Choose currency */
	async function chooseCurrency(t) {
		const list = Object.keys(rates)
		console.info(t("Currency options:"))
		list.forEach((c, i) => console.info(` ${i + 1}) ${c}`))
		const input = await ask(
			`${t("Select currency")} (1-${list.length}): `,
			input => {
				input.idx = Number(input.value) - 1
				return ! (input.idx >= 0 && input.idx < list.length)
			},
			[t("Invalid choice."), t("Try again") + ":", ""].join(" ")
		)
		return list[input.idx] ?? null
	}

	/** Validate phone number */
	function isValidPhone(number) {
		return /^[0-9]{7,15}$/.test(number)
	}

	console.info("\n=== " + t("Top‑up Telephone") + " ===")
	const numberInp = await ask(
		t("Phone Number") + ": ",
		input => !isValidPhone(input.value),
		t("Invalid phone number. Use digits only, 7‑15 characters.") + ": "
	)
	if (numberInp.cancelled) throw new CancelError()
	const number = numberInp.value
	const amountInp = await ask(
		t("Top‑up Amount") + ": ",
		input => isNaN(input.value) || Number(input.value) <= 0 || Number(input.value) > 1_000_000,
		t("Amount must be a positive number below 1 million.") + ": "
	)
	if (amountInp.cancelled) throw new CancelError()
	const amount = Number(amountInp.value)
	const currency = await chooseCurrency(t)
	if (!currency) throw new CancelError()
	console.success(`\n${t("Top‑up of")} ${amount} ${currency} ${t("to")} ${number} ${t("scheduled.")}\n`)
}

```
#### `packages/ui/playground/i18n/index.js`
```js
import i18n, { createT } from "@nan0web/i18n"
import uk from "./uk.js"

const getVocab = i18n({ uk })

export function detectLocale(argv = []) {
	// Detect language from CLI argument or environment variable
	const langArg = argv.find(a => a.startsWith("--lang="))
	let locale = "en"
	if (langArg) {
		locale = langArg.split("=")[1]
	}
	return locale
}

export const localesMap = new Map([
	["en", "English"],
	["uk", "Українська"],
])

export default (locale) => createT(getVocab(locale))

```
#### `packages/ui/playground/i18n/uk.js`
```js
/**
 * Ukrainian translations for the playground.
 *
 * The object keys are English identifiers, the values are Ukrainian strings.
 *
 * Example usage:
 *   import vocabMap from "./i18n/index.js"
 *   const vocab = vocabMap("uk")
 *   const t = createT(vocab)
 *   console.log(t("Registration Form")) // → "Форма реєстрації"
 *   console.log(vocab["Registration Form"]) // → "Форма реєстрації"
 */
export default {
	"Select demo:": "Оберіть демонстрацію:",
	"Registration Form": "Форма реєстрації",
	"Currency Exchange": "Обмін валют",
	"Top‑up Telephone": "Поповнення телефону",
	"Enter number (or 0 to quit):": "Введіть номер (або 0 для виходу):",
	"Good‑bye.": "До побачення.",
	"Invalid choice.": "Невірний вибір.",
	"Username": "Ім'я користувача",
	"Password": "Пароль",
	"Confirm Password": "Підтвердження пароля",
	"Email or Telephone": "Електронна пошта або телефон",
	"Press ENTER to submit, type 0 to cancel": "Натисніть ENTER для відправки, введіть 0 для скасування",
	"Cancelled.": "Скасовано.",
	"Form submitted successfully!": "Форма успішно надіслана!",
	"Phone Number": "Номер телефону",
	"Top‑up Amount": "Сума поповнення",
	"Select currency": "Виберіть валюту",
	"Currency options:": "Валютні опції:",
	"Invalid choice.": "Неправильний вибір.",
	"Phone number is required.": "Необхідно вказати номер телефону.",
	"Invalid phone number. Use digits only, 7‑15 characters.": "Неправильний номер телефону. Використовуйте лише цифри, 7-15 символів.",
	"Invalid amount.": "Неправильна сума.",
	"Top‑up of": "Поповнення на",
	"to": "до",
	"scheduled.": "заплановано.",
	"options:": "опції:",
	"Select": "Зробіть вибір",
	"From Currency": "З якої валюти міняємо",
	"To Currency": "У яку валюту",
	"Amount": "Сума",
	"Invalid choice, try again.": "Неправильний вибір, спробуйте знову.",
	"Password (min 4 chars)": "Пароль (мінімум 4 символи)",
	"Passwords do not match. Try again.": "Паролі не збігаються. Спробуйте знову.",
	"[me]": "[Я]",
	"[me invalid]": "[Я помилився]",
	"! Invalid choice.": "! Неправильний вибір.",
	"⨉ Cancelled.": "⨉ Скасовано.",
	"Select a language": "Виберіть мову",
	"Language Selector": "Вибір мови",
}

```
