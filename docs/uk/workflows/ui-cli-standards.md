---
description: Стандарти використання UI-CLI компонентів для вводу та виводу інформації
---

# 📐 Ворклоу: UI-CLI Component Standards (OLMUI Intents)

Цей workflow описує стандарти взаємодії між логікою доменних моделей та консольним інтерфейсом (CLI). В архітектурі **NaN•Web (OLMUI)** доменна логіка повністю ізольована від конкретного представлення.

---

## 1. Головне правило: Повна ізоляція UI (Total UI Isolation)

* **❌ ЗАБОРОНЕНО**: Імпортувати та використовувати візуальні компоненти (`select`, `input`, `Table`, `Alert` тощо) напряму з `@nan0web/ui-cli` або будь-якої іншої бібліотеки представлення всередині доменних моделей (`src/domain/`).
* **✅ ОБОВ'ЯЗКОВО**: Взаємодія з користувачем або середовищем повинна відбуватися **виключно** через відправку декларативних повідомлень — інтентів (`yield Intent`).
* **Чому**: Це дозволяє запускати одну й ту саму доменну модель в будь-якому адаптері (термінал, веб-браузер, чат-інтерфейс Telegram, тестовий фреймворк) без зміни коду моделі.

---

## 2. Шаблон взаємодії: Ввід та Вивід через інтенти

### Вивід інформації (Output)
Замість `console.log` або виклику віджетів, модель генерує інтент `show` або `progress`:
* `yield show('Message text', 'info' | 'success' | 'warn' | 'error')`
* `yield progress('Status message')`

### Ввід інформації (Input)
Замість ручного очікування на стрім вводу (`readline`), модель запитує дані через інтент `ask`:
* `const response = yield ask('propertyName', SchemaModel)`

---

## 3. Еталонна реалізація (Declarative Input/Output)

```javascript
import { Model } from '@nan0web/types'
import { ask, show, progress } from '@nan0web/ui'

/**
 * DirectoryActionModel - Declarative input model for directory conflicts.
 */
export class DirectoryActionModel extends Model {
	static alias = 'directory-conflict'

	static UI = {
		question: 'Directory already exists. What should we do?',
		statusProcessing: 'Processing selected action: {$action}...',
		statusDone: 'Action completed successfully.',
	}

	static action = {
		help: 'Conflict resolution strategy',
		type: 'string',
		default: 'merge',
		options: [
			{ label: 'Overwrite (replace everything)', value: 'overwrite' },
			{ label: 'Merge (add missing files only)', value: 'merge' },
		],
	}

	/**
	 * @param {Partial<DirectoryActionModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Selected action */ this.action
	}

	/**
	 * Run the interactive decision logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, {status: string}, any>}
	 */
	async *run() {
		const { t } = this._

		// 1. Ask user for input declaratively using options schema
		const res = yield ask('action', {
			...DirectoryActionModel.action,
			help: t(DirectoryActionModel.UI.question),
		})

		const selectedAction = res.value

		// 2. Report progress and action back to the UI adapter
		yield progress(t(DirectoryActionModel.UI.statusProcessing, { action: selectedAction }))

		// ... perform filesystem operation based on selectedAction ...

		// 3. Output final success message
		yield show(t(DirectoryActionModel.UI.statusDone), 'success')

		return { status: 'ok' }
	}
}
```
