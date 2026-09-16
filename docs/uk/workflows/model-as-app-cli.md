# Рецепт: Model-as-App CLI (Golden Reference)

> **Призначення:** Швидкий еталон для створення OLMUI CLI-додатків та підкоманд без зайвого дослідження вихідного коду ядра фреймворку.  
> **Статус:** Golden Standard v1.0  
> **Стек:** `@nan0web/ui-cli`, `@nan0web/ui`, `@nan0web/types`, `@nan0web/db`

---

## 1. Головний Додаток-Контролер (App Controller)

**Файл-зразок:** [`apps/share.app/src/index.js`](apps/share.app/src/index.js)

```javascript
import { ModelAsApp } from '@nan0web/ui-cli'
import { DownloadWhisperCommand } from './domain/commands/DownloadWhisperCommand.js'
import { DriveIndexCommand } from './domain/commands/DriveIndexCommand.js'
import { ToolCheckerPort } from './ports/ToolCheckerPort.js'

/**
 * @typedef {Object} ShareAppExtraOptions
 * @property {typeof ToolCheckerPort} [toolChecker]
 *
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & ShareAppExtraOptions} ShareAppOptions
 */

export class ShareAppCLI extends ModelAsApp {
	static alias = 'share'
	static UI = {
		title: 'Sovereign Media Pipeline CLI',
	}

	// Реєстрація підкоманд та вибір за замовчуванням
	static command = {
		help: 'Commands for managing storage and pipelines.',
		options: [DownloadWhisperCommand, DriveIndexCommand],
		positional: true,
		default: DriveIndexCommand,
	}

	/**
	 * @param {Partial<ShareAppCLI>} [data]
	 * @param {Partial<ShareAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {import('@nan0web/ui').ModelAsApp} Subcommand instance */
		this.command
		/** @type {typeof ToolCheckerPort | undefined} CLI tools validator */
		this.toolChecker = options?.toolChecker
	}

	/**
	 * Delegates execution to the subcommand or default model.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (this.help) {
			return yield* super.run()
		}
		if (this.command && typeof this.command.run === 'function') {
			return yield* this.command.run()
		}
		return yield* super.run()
	}
}
```

---

## 2. Модель Підкоманди (Subcommand Model)

**Файл-зразок:** [`DriveIndexCommand.js`](apps/share.app/src/domain/commands/DriveIndexCommand.js)

```javascript
import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, ask, result } from '@nan0web/ui'

export class DriveIndexCommand extends ModelAsApp {
	static alias = 'drive:index'

	static UI = {
		title: 'Storage Drive & Backup Offline Indexer',
		notFound: 'Drive path not found.',
		success: 'Drive indexed successfully.',
	}

	// Схема аргументів/опцій
	static mountPoint = {
		type: 'string',
		required: true,
		help: 'Drive path or directory to index',
	}

	static _name = {
		alias: 'name',
		type: 'string',
		required: false,
		help: 'Custom label for the drive catalog',
	}

	/**
	 * @param {Partial<DriveIndexCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Drive path or directory to index */ this.mountPoint
		/** @type {string} Custom label for the drive catalog */ this._name
	}

	/**
	 * Defines the CLI behavior for the `drive:index` model.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._

		// Check if mountPoint is provided, otherwise ask for it
		const mountPoint = this.mountPoint || (yield ask('mountPoint', DriveIndexCommand.mountPoint))
		if (!mountPoint) {
			yield show(t(DriveIndexCommand.UI.notFound), 'warning')
			return result({ success: false })
		}

		// Show progress bar
		yield progress(`Indexing drive at ${mountPoint}...`, 50)

		// Show success message
		yield show(t(DriveIndexCommand.UI.success), 'success')

		// Must return result
		return result({ success: true, mountPoint })
	}
}
```

---

## 3. Сценарний тест TDD (`*.story.js`)

**Файл-зразок:** [`SpecRunner.js`](/packages/ui/src/testing/SpecRunner.js) та [`SpecRunner.test.js`](/packages/ui/src/testing/SpecRunner.test.js)

Для тестування OLMUI-сценаріїв використовується декларативний `SpecRunner`, який автоматично валідує потік інтентів (`ask`, `show`, `result`):

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SpecRunner } from '@nan0web/ui'
import { DriveIndexCommand } from './DriveIndexCommand.js'

describe('DriveIndexCommand SpecRunner Scenario', () => {
	it('should ask for mountPoint and return result', async () => {
		const stream = [
			{ DriveIndexCommand: {} },
			{ ask: 'mountPoint', $value: '/mnt/storage' },
			{ progress: 'Indexing drive at /mnt/storage...' },
			{ show: 'Drive indexed successfully.' },
			{ result: { success: true, mountPoint: '/mnt/storage' } },
		]

		await assert.doesNotReject(SpecRunner.execute(stream, { DriveIndexCommand }))
	})
})
```

Альтернативно, для ручного низькорівневого тесту генератора:

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { runGenerator } from '@nan0web/ui'
import { DriveIndexCommand } from './DriveIndexCommand.js'

describe('DriveIndexCommand Manual Scenario', () => {
	it('should ask for mountPoint and return result', async () => {
		const model = new DriveIndexCommand({}, { t: (k) => k })
		const answers = { mountPoint: '/mnt/storage' }
		const handlers = {
			ask: async (prop) => answers[prop] || '',
			show: () => {},
			progress: () => {},
		}

		const res = await runGenerator(model.run(), handlers)
		assert.deepStrictEqual(res, {
			success: true,
			mountPoint: '/mnt/storage',
		})
	})
})
```

> ⚠️ **Контракт `runGenerator`**: `handlers` обов'язково повинен містити щонайменше функцію `ask: async () => ({})`, інакше адаптер кине помилку `IntentErrorModel`.

---

## 4. Точка входу CLI (Binary Bootstrap)

**Файл-зразок:** [`share.js`](/apps/share.app/bin/share.js)

У `bootstrapApp(AppClass, config)` другим аргументом передається об'єкт конфігурації. Усі його властивості потрапляють у `options` конструктора додатка. Це дозволяє легко інжектувати реальні системні порти або сервіси:

```javascript
#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { ShareAppCLI } from '../src/index.js'
import { ToolCheckerPort } from '../src/ports/ToolCheckerPort.js'

// Інжектуємо реальний ToolCheckerPort у додаток (доступний через options.toolChecker)
bootstrapApp(ShareAppCLI, {
	toolChecker: ToolCheckerPort,
}).catch((err) => {
	console.error(err)
	process.exit(1)
})
```

---

## 5. Чек-лист перевірки якості (Definition of Done)

- [ ] Всі посилання у документації відносні до кореня воркспейсу (наприклад, `apps/...`, без схеми `file://`).
- [ ] Файл відформатовано табами, без крапок з комою (`no-semi`).
- [ ] Опції та моделі мають JSDoc типи.
- [ ] Повідомлення проходять через `this._.t` або `t(Model.UI.key)`.
- [ ] Підкоманда обов'язково повертає `return result({ ... })`.
- [ ] Тести запускаються безпосередньо через `node --test` у відповідному пакеті:
  ```bash
  pnpm --filter <app-name> exec node --test src/domain/<Name>.story.js
  ```
  f
