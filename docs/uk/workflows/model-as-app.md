---
description: Формалізація Model-as-App архітектури (OLMUI додатки та підкоманди)
---

# 🚀 Ворклоу: Model-as-App (Консольні додатки OLMUI)

Цей workflow формалізує правила побудови та проектування консольних утиліт (CLI) на базі архітектури **Model-as-App** в екосистемі `NaN•Web`. Дотримання цього стандарту гарантує відсутність циклічних імпортів, чистоту типізації та безпомилкову поведінку інтерфейсу.

---

## 1. Точка входу (Bootstrap)

Точка входу (`bin/app.js`) має містити лише мінімальний код для ініціалізації зовнішніх ресурсів та запуску додатку через `bootstrapApp`. Будь-який парсинг чи логіка розгалуження тут заборонені.

```javascript
#!/usr/bin/env node
/**
 * @file Entry point for the CLI application.
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import { MyApp } from '../src/domain/app/MyApp.js'
import { AI } from '@nan0web/ai'

const ai = new AI()
try {
	await ai.refreshModels()
} catch (e) {
	// Silent fail for offline capability
}

// Automatically bootstraps the app and catches top-level initialization errors
bootstrapApp(MyApp, { ai }).catch((err) => {
	console.error(err)
	process.exit(1)
})
```

---

## 2. Головний контролер додатку (App Controller)

Клас додатку успадковує `ModelAsApp`. Він реєструє всі підкоманди у статичному полі `command` і передає їм керування.

```javascript
import { ModelAsApp } from '@nan0web/ui-cli'
import { SetupModel } from '../SetupModel.js'
import { RunModel } from '../RunModel.js'

/**
 * MyApp - Main application controller.
 */
export class MyApp extends ModelAsApp {
	static alias = 'myapp'

	static UI = {
		title: 'My Awesome CLI Application',
	}

	static command = {
		help: 'Command to execute',
		options: [
			SetupModel,
			RunModel,
		],
		positional: true,
		default: SetupModel,
	}

	/**
	 * @param {Partial<MyApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Injected subcommand instance */ this.command
	}

	/**
	 * Run the main controller logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}
```

---

## 3. Модель підкоманди (Subcommand Model)

Модель підкоманди наслідує базовий клас `Model`. Опції та аргументи визначаються декларативно, а взаємодія з інтерфейсом відбувається через функції-шорткати.

```javascript
import { Model } from '@nan0web/types'
import { show, progress, ask } from '@nan0web/ui'

/**
 * SetupModel - Subcommand to initialize environment.
 */
export class SetupModel extends Model {
	static alias = 'setup'

	static UI = {
		init: 'Initializing configuration at {$path}...',
		done: 'Configuration successfully written to {$path}',
	}

	static force = {
		help: 'Force overwrite existing configuration',
		type: 'boolean',
		default: false,
		alias: 'f',
	}

	static path = {
		help: 'Path to config destination',
		default: './config',
		positional: true,
	}

	/**
	 * @param {Partial<SetupModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Force overwrite option */ this.force
		/** @type {string} Destination path */ this.path
		/** @type {string[] | undefined} System CLI arguments */ this._argv
	}

	/**
	 * Run the setup subcommand logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, {status: string}, any>}
	 */
	async *run() {
		// Destructure translation function from the injected options context
		const { t } = this._

		// 1. Emit progress using standard shortcut function
		yield progress(t(SetupModel.UI.init, { path: this.path }))

		// ... perform filesystem initialization operations ...

		// 2. Emit success status message
		yield show(t(SetupModel.UI.done, { path: this.path }), 'success')

		return { status: 'ok' }
	}
}
```

---

## 4. Правила та запобігання пасткам (Anti-patterns)

### ⚠️ Робота з прогресом та TTY-інтерфейсами
Якщо підкоманда вступає в інтерактивний діалог із користувачем (наприклад, через `prompts`, `autocomplete` або інші блокуючі TTY-компоненти):
* **Заборонено**: Залишати запущеним фоновий спінер прогресу фреймворку (`yield progress(...)`), оскільки він буде постійно перезаписувати потік вводу.
* **Рішення**: Не ініціюйте фоновий прогрес для інтерактивних етапів або гасіть його перед початком діалогу:
  ```javascript
  yield progress('Operation name', 0, { stop: 'success' })
  ```

### ⚠️ Запобігання циклічним імпортам (Circular Dependency)
При підключенні підкоманд до головного класу `MyApp` виникає ризик створити замкнене коло залежностей через barrel-файли (`index.js`).
* **Рішення**: Всередині файлів підкоманд (наприклад, `SetupModel.js`) **ніколи** не імпортуйте сутності з сусідніх `index.js`, які ре-експортують ці самі команди. Завжди імпортуйте файли напряму з їхніх фізичних шляхів.

### ⚠️ Типізація та уникнення type casting
Для уникнення примусового приведення типів (`any`):
1. **Локалізація**: Отримуйте функцію перекладу через `const { t } = this._`. Для цього достатньо правильно вказати тип `options` у конструкторі: `import('@nan0web/types').ModelOptions`.
2. **Аргументи**: Якщо вам потрібен доступ до системних властивостей (наприклад, `this._argv`), просто оголосіть їх у конструкторі вашого класу (`/** @type {string[] | undefined} */ this._argv`).
