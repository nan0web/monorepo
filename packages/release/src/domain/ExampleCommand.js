import { ModelAsApp, result, show } from '@nan0web/ui'

/**
 * ExampleCommand - Display or generate canonical release template files
 */
export default class ExampleCommand extends ModelAsApp {
	static alias = 'example'

	static UI = {
		title: 'example',
		help: 'Display or generate canonical release template files (task.md, user.md, task.spec.js)',
	}

	static version = {
		help: 'Sample version string (defaults to v0.1.0)',
		default: 'v0.1.0',
	}

	static file = {
		help: 'Specific template file to view: task | user | spec | all',
		default: 'all',
	}

	/**
	 * @param {Partial<ExampleCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.version = String(data.version || 'v0.1.0')
		/** @type {'all' | 'task' | 'user' | 'spec'} */ this.file = data.file || 'all'
	}

	/**
	 * Build canonical release template strings
	 * @param {string} [ver]
	 */
	getTemplate(ver = 'v0.1.0') {
		const v = ver.startsWith('v') ? ver : `v${ver}`
		const cleanVer = v.replace(/^v/, '')
		const parts = cleanVer.split('.')
		const major = parts[0] || '0'
		const minor = parts[1] || '1'

		const taskMd = `---
version: ${cleanVer}
type: minor
status: active
locale: uk
models: ['ReleaseModel']
---

# 🚀 Mission: Core Feature & Specifications (${v})

## 🏁 Overview (Огляд)
Короткий опис цілей та архітектурного наміру даного релізу.

## 👥 User Stories (Сценарії)
- **Story 1:** Як розробник, я хочу мати чіткий контракт релізу, щоб виконувати завдання за TDD.

## 🎯 Target Files
- \`src/domain/Feature.js\`

## 📋 Завдання (Tasks)
- [ ] [task-1] Створити доменну модель Feature.js
- [ ] [task-2] Реалізувати логіку обробки подій
- [ ] [task-3] Покрити контрактними тестами

## ⚖️ Критерії Прийнятності (Acceptance Criteria)
1. Усі задачі відмічено як виконані [x].
2. Контрактні тести task.spec.js проходять без помилок (100% pass).
`

		const userMd = `---
hours: 1.5
iterations: 3
rrs: 330
status: active
---

# Журнал Розробника та Метрики: Реліз ${v}

## Метрики Виконання
- **Час роботи (Hours):** 1.5
- **Ітерацій (Iterations):** 3
- **RRS (Release Readiness Score):** 330

## Лог Ітерацій та Відгуків (Append-Only)
- **${new Date().toISOString().slice(0, 10)} [Ітерація 1]:** Ініціалізація релізу та створення специфікацій.
`

		const taskSpecJs = `import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Release ${v} Specification', () => {
	it('should validate contract', () => {
		assert.ok(true)
	})
})
`

		return {
			version: v,
			major,
			minor,
			taskMd,
			userMd,
			taskSpecJs,
		}
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const tpl = this.getTemplate(this.version)

		if (this.file === 'task') {
			yield show(tpl.taskMd)
		} else if (this.file === 'user') {
			yield show(tpl.userMd)
		} else if (this.file === 'spec') {
			yield show(tpl.taskSpecJs)
		} else {
			yield show(`=== 📄 releases/${tpl.major}/${tpl.minor}/${tpl.version}/task.md ===\n${tpl.taskMd}`)
			yield show(`=== 📄 releases/${tpl.major}/${tpl.minor}/${tpl.version}/user.md ===\n${tpl.userMd}`)
			yield show(`=== 📄 releases/${tpl.major}/${tpl.minor}/${tpl.version}/task.spec.js ===\n${tpl.taskSpecJs}`)
		}

		return result(tpl)
	}
}
