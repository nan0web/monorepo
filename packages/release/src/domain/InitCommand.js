import { ModelAsApp, result, show } from '@nan0web/ui'

export default class InitCommand extends ModelAsApp {
	/** @type {string} Release version */
	version = ''

	static version = {
		help: 'Release version',
		default: '',
		errorRequired: 'Version is required (e.g. --version=1.0.0 or --version=v1.0.0)',
	}
	static UI = {
		title: 'init',
		help: 'Initialize a new release structure',
	}

	/**
	 * @param {Partial<InitCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.version = String(data.version || (options && 'version' in options ? /** @type {any} */ (options).version : ''))
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = this._
		if (!db) {
			throw new Error('Database instance ({ db }) is required in InitCommand')
		}
		if (!this.version) {
			throw new Error(t ? t(InitCommand.version.errorRequired) : InitCommand.version.errorRequired)
		}
		const v = this.version.startsWith('v') ? this.version : `v${this.version}`

		const parts = v.replace('v', '').split('.')
		const major = parts[0] || '0'
		const minor = parts[1] || '0'
		const cleanVer = v.replace(/^v/, '')

		const relDir = `releases/${major}/${minor}/${v}`
		const taskPath = `${relDir}/task.md`
		const taskContent = `---
version: ${cleanVer}
type: minor
status: active
locale: uk
models: []
---

# 🚀 Mission: Release ${v}

## 🏁 Overview (Огляд)
Опис завдань та мети релізу.

## 👥 User Stories (Сценарії)
- **Story 1:** Як розробник, я хочу...

## 🎯 Target Files
- \`src/index.js\`

## 📋 Завдання (Tasks)
- [ ] [task-1] Реалізувати первинну логіку
- [ ] [task-2] Написати контрактні тести

## ⚖️ Критерії Прийнятності (Acceptance Criteria)
1. Усі задачі виконано.
2. Тести task.spec.js проходять успішно.
`
		await db.saveDocument(taskPath, taskContent)

		const userPath = `${relDir}/user.md`
		const userContent = `---
hours: 0.5
iterations: 1
rrs: 330
status: active
---

# Журнал Розробника та Метрики: Реліз ${v}

## Метрики Виконання
- **Час роботи (Hours):** 0.5
- **Ітерацій (Iterations):** 1
- **RRS (Release Readiness Score):** 330

## Лог Ітерацій та Відгуків (Append-Only)
- **${new Date().toISOString().slice(0, 10)} [Ітерація 1]:** Створення релізу ${v}.
`
		await db.saveDocument(userPath, userContent)

		const specPath = `${relDir}/task.spec.js`
		const specContent = `import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Release ${v} Specification', () => {
	it('should validate contract', () => {
		assert.ok(true)
	})
})
`
		await db.saveDocument(specPath, specContent)

		yield show(`✅ Initialized release ${v} in ${relDir}`, 'success')

		return result({
			version: v,
			taskPath,
			userPath,
			specPath,
		})
	}
}
