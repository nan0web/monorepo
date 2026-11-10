import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { JsDomainAuditor } from './js/JsDomainAuditor.js'
import { DomainAuditor } from './DomainAuditor.js'
import { DB } from '@nan0web/db'

async function drainGenerator(gen) {
	const intents = []
	let last = null
	while (true) {
		const step = await gen.next()
		if (step.done) {
			last = step.value
			break
		}
		intents.push(step.value)
	}
	return { intents, result: last }
}

describe('DomainAuditor', () => {
	it('detects extends Model outside src/domain/', async () => {
		const db = new DB({
			predefined: [
				[
					'src/SomeUtil.js',
					'import { Model } from "@nan0web/types"\nexport class SomeUtil extends Model {}\n',
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(
			result.data.errors.some((e) =>
				e.error.startsWith(DomainAuditor.UI.violation_found.split('{')[0])
			)
		)
	})

	it('allows extends Model inside src/domain/', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/MyModel.js',
					'import { Model } from "@nan0web/types"\nexport class MyModel extends Model {}\n',
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})

	it('detects class field declarations outside constructor as error', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/MyModel.js',
					'export class MyModel {\n\tname = "test"\n\tconstructor() {}\n}\n',
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'class_field'))
	})

	it('detects direct fs import in domain as error', async () => {
		const db = new DB({
			predefined: [
				['src/domain/MyService.js', 'import fs from "node:fs"\nexport class MyService {}\n'],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'raw_fs'))
	})

	it('detects direct path import in domain as error', async () => {
		const db = new DB({
			predefined: [
				['src/domain/MyService.js', 'import path from "node:path"\nexport class MyService {}\n'],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'raw_path'))
	})

	it('detects explicit file extension in saveDocument / loadDocument in domain files', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/MyService.js',
					'export class MyService {\n\tasync save(db) {\n\t\tawait db.saveDocument("users/1.nan0", { name: "test" })\n\t}\n}\n',
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.ok(result.data.errors.some((e) => e.check === 'explicit_db_extension'))
	})

	it('warns about redundant manual assignment and suggests JSDoc with field help', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/MyModel.js',
					`import { Model } from "@nan0web/types"
export class MyModel extends Model {
	static dryRun = {
		help: 'Do not modify files',
		default: false,
	}
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} */ this.dryRun
		this.dryRun = Boolean(data.dryRun)
	}
}
`,
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { intents, result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		const warnIntent = intents.find((intent) => {
			const str = JSON.stringify(intent)
			return str.includes("Consider using '/** @type {...} Do not modify files */ this.dryRun'")
		})
		assert.ok(
			warnIntent,
			`Warning with field help description in JSDoc should be emitted. Got: ${JSON.stringify(intents)}`
		)
	})

	it('passes when no src/ directory exists', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
	})
})
