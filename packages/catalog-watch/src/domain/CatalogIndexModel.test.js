import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { CatalogIndexModel } from './CatalogIndexModel.js'

// ─── Test Helpers ───

const SAMPLE_FILES = [
	'cards/visa-gold.yaml',
	'cards/visa-classic.yaml',
	'cards/mastercard-standard.yaml',
]

const SAMPLE_INDEX_TXT = `# @catalog cards uk
# version: 42
# hash: abc123def
# items: 3
# updated: 2026-03-16T16:00:00Z
cards/visa-gold.yaml
cards/visa-classic.yaml
cards/mastercard-standard.yaml
`

/** @param {Partial<{files: string[], hash: string, version: number}>} [overrides] */
function createEnv(overrides = {}) {
	return {
		listFiles: async () => overrides.files ?? SAMPLE_FILES,
		hash: async () => overrides.hash ?? 'abc123def',
		readVersion: overrides.version !== undefined
			? async () => overrides.version
			: undefined,
	}
}

/** Drains generator collecting all intents and the final return */
async function drain(gen, responses = []) {
	const intents = []
	let step = await gen.next()
	let i = 0
	while (!step.done) {
		intents.push(step.value)
		step = await gen.next(responses[i++])
	}
	return { intents, result: step.value }
}

// ═══════════════════════════════════════════════
// CatalogIndexModel — Serialization Tests
// ═══════════════════════════════════════════════

describe('CatalogIndexModel: Serialization', () => {
	it('toString() generates valid .index.txt format with all headers', () => {
		const model = new CatalogIndexModel({
			catalog: 'cards',
			locale: 'uk',
			version: 42,
			hash: 'abc123def',
			itemCount: 3,
			updatedAt: '2026-03-16T16:00:00Z',
			files: SAMPLE_FILES,
		})
		const output = model.toString()

		assert.ok(output.startsWith('# @catalog cards uk'))
		assert.ok(output.includes('# version: 42'))
		assert.ok(output.includes('# hash: abc123def'))
		assert.ok(output.includes('# items: 3'))
		assert.ok(output.includes('# updated: 2026-03-16T16:00:00Z'))
		assert.ok(output.includes('cards/visa-gold.yaml'))
		assert.ok(output.includes('cards/mastercard-standard.yaml'))
		assert.ok(output.endsWith('\n'))
	})

	it('toString() with zero files produces headers only', () => {
		const model = new CatalogIndexModel({ catalog: 'empty', locale: 'en' })
		const output = model.toString()
		const lines = output.trim().split('\n')

		assert.equal(lines.length, 5) // 5 header lines, no file lines
		assert.ok(lines.every(l => l.startsWith('#')))
	})

	it('parse() reconstructs model from valid .index.txt', () => {
		const parsed = CatalogIndexModel.parse(SAMPLE_INDEX_TXT)

		assert.equal(parsed.catalog, 'cards')
		assert.equal(parsed.locale, 'uk')
		assert.equal(parsed.version, 42)
		assert.equal(parsed.hash, 'abc123def')
		assert.equal(parsed.itemCount, 3)
		assert.equal(parsed.updatedAt, '2026-03-16T16:00:00Z')
		assert.deepEqual(parsed.files, SAMPLE_FILES)
	})

	it('parse() handles missing locale — defaults to en', () => {
		const text = '# @catalog branches\n# version: 1\n# hash: x\n# items: 0\n# updated: now\n'
		const parsed = CatalogIndexModel.parse(text)

		assert.equal(parsed.catalog, 'branches')
		assert.equal(parsed.locale, 'en')
	})

	it('parse() ignores unknown comment lines', () => {
		const text = SAMPLE_INDEX_TXT + '# custom: metadata\n'
		const parsed = CatalogIndexModel.parse(text)

		assert.equal(parsed.files.length, 3) // custom comment not in files
	})

	it('parse() handles empty input gracefully', () => {
		const parsed = CatalogIndexModel.parse('')

		assert.equal(parsed.catalog, '')
		assert.equal(parsed.files.length, 0)
	})

	it('toString → parse roundtrip preserves all data', () => {
		const original = new CatalogIndexModel({
			catalog: 'metals',
			locale: 'de',
			version: 7,
			hash: 'zzz999',
			itemCount: 2,
			updatedAt: '2026-01-01T00:00:00Z',
			files: ['gold.yaml', 'silver.yaml'],
		})

		const roundtripped = CatalogIndexModel.parse(original.toString())

		assert.equal(roundtripped.catalog, original.catalog)
		assert.equal(roundtripped.locale, original.locale)
		assert.equal(roundtripped.version, original.version)
		assert.equal(roundtripped.hash, original.hash)
		assert.equal(roundtripped.itemCount, original.itemCount)
		assert.equal(roundtripped.updatedAt, original.updatedAt)
		assert.deepEqual(roundtripped.files, original.files)
	})
})

// ═══════════════════════════════════════════════
// CatalogIndexModel — Schema Tests
// ═══════════════════════════════════════════════

describe('CatalogIndexModel: Schema', () => {
	it('constructor applies defaults for missing fields', () => {
		const model = new CatalogIndexModel()

		assert.equal(model.catalog, '')
		assert.equal(model.locale, 'en')
		assert.equal(model.version, 0)
		assert.equal(model.hash, '')
		assert.equal(model.itemCount, 0)
		assert.equal(model.updatedAt, '')
		assert.deepEqual(model.files, [])
	})

	it('constructor accepts partial data', () => {
		const model = new CatalogIndexModel({ catalog: 'cards', locale: 'uk' })

		assert.equal(model.catalog, 'cards')
		assert.equal(model.locale, 'uk')
		assert.equal(model.version, 0) // default
	})

	it('static UI contains all required i18n keys', () => {
		const keys = Object.keys(CatalogIndexModel.UI)

		assert.ok(keys.includes('progress_scanning'))
		assert.ok(keys.includes('progress_hashing'))
		assert.ok(keys.includes('progress_writing'))
		assert.ok(keys.includes('log_generated'))
		assert.ok(keys.includes('log_empty'))
		assert.ok(keys.includes('error_no_catalog'))
	})

	it('all static schema fields have help and default', () => {
		const schemaFields = ['catalog', 'locale', 'version', 'hash', 'itemCount', 'updatedAt']
		for (const field of schemaFields) {
			assert.ok(CatalogIndexModel[field].help, `${field} missing help`)
			assert.ok('default' in CatalogIndexModel[field], `${field} missing default`)
		}
	})
})

// ═══════════════════════════════════════════════
// CatalogIndexModel — Generator (async *run) Tests
// ═══════════════════════════════════════════════

describe('CatalogIndexModel: async *run()', () => {
	it('happy path: scans, hashes, versions, generates index', async () => {
		const model = new CatalogIndexModel({ catalog: 'cards', locale: 'uk' })
		const env = createEnv({ version: 41 })
		const { intents, result: final } = await drain(model.run(env))

		// Intent sequence: progress(scan) → progress(hash) → progress(write) → log(generated)
		assert.equal(intents[0].type, 'progress')
		assert.equal(intents[0].message, CatalogIndexModel.UI.progress_scanning)

		assert.equal(intents[1].type, 'progress')
		assert.equal(intents[1].message, CatalogIndexModel.UI.progress_hashing)

		assert.equal(intents[2].type, 'progress')
		assert.equal(intents[2].message, CatalogIndexModel.UI.progress_writing)

		assert.equal(intents[3].type, 'log')
		assert.equal(intents[3].level, 'success')

		// Final result
		assert.equal(final.type, 'result')
		assert.equal(final.data.success, true)
		assert.equal(final.data.catalog, 'cards')
		assert.equal(final.data.locale, 'uk')
		assert.equal(final.data.version, 42) // 41 + 1
		assert.equal(final.data.hash, 'abc123def')
		assert.equal(final.data.itemCount, 3)
		assert.ok(final.data.content.includes('# @catalog cards uk'))
	})

	it('happy path without readVersion defaults to version 1', async () => {
		const model = new CatalogIndexModel({ catalog: 'branches', locale: 'en' })
		const env = createEnv()
		delete env.readVersion

		const { result: final } = await drain(model.run(env))

		assert.equal(final.data.version, 1)
	})

	it('mutates model state: files, itemCount, hash, version, updatedAt', async () => {
		const model = new CatalogIndexModel({ catalog: 'cards', locale: 'uk' })

		assert.equal(model.files.length, 0) // Before
		assert.equal(model.hash, '')

		const env = createEnv({ version: 10 })
		await drain(model.run(env))

		assert.equal(model.files.length, 3) // After
		assert.equal(model.hash, 'abc123def')
		assert.equal(model.version, 11)
		assert.equal(model.itemCount, 3)
		assert.ok(model.updatedAt.length > 0)
	})

	it('error: missing catalog name yields log(error) and returns failure', async () => {
		const model = new CatalogIndexModel({ catalog: '' })
		const env = createEnv()
		const { intents, result: final } = await drain(model.run(env))

		assert.equal(intents[0].type, 'log')
		assert.equal(intents[0].level, 'error')
		assert.equal(intents[0].message, CatalogIndexModel.UI.error_no_catalog)

		assert.equal(final.data.success, false)
	})

	it('edge: empty catalog directory yields log(warn) and returns empty reason', async () => {
		const model = new CatalogIndexModel({ catalog: 'empty', locale: 'en' })
		const env = createEnv({ files: [] })
		const { intents, result: final } = await drain(model.run(env))

		// progress(scan) → log(empty)
		assert.equal(intents[0].type, 'progress')
		assert.equal(intents[1].type, 'log')
		assert.equal(intents[1].level, 'warn')
		assert.equal(intents[1].message, CatalogIndexModel.UI.log_empty)

		assert.equal(final.data.success, false)
		assert.equal(final.data.reason, 'empty')
	})

	it('passes correct directory path to env.listFiles', async () => {
		let calledWith = ''
		const model = new CatalogIndexModel({ catalog: 'metals', locale: 'de' })
		const env = {
			listFiles: async (path) => { calledWith = path; return ['a.yaml'] },
			hash: async () => 'h1',
		}
		await drain(model.run(env))

		assert.equal(calledWith, 'de/metals')
	})

	it('passes file list to env.hash', async () => {
		let hashedFiles = []
		const model = new CatalogIndexModel({ catalog: 'cards', locale: 'uk' })
		const env = {
			listFiles: async () => ['a.yaml', 'b.yaml'],
			hash: async (files) => { hashedFiles = files; return 'h' },
		}
		await drain(model.run(env))

		assert.deepEqual(hashedFiles, ['a.yaml', 'b.yaml'])
	})

	it('content field in result is valid .index.txt parseable back', async () => {
		const model = new CatalogIndexModel({ catalog: 'cards', locale: 'uk' })
		const env = createEnv({ version: 0 })
		const { result: final } = await drain(model.run(env))

		const reparsed = CatalogIndexModel.parse(final.data.content)
		assert.equal(reparsed.catalog, 'cards')
		assert.equal(reparsed.locale, 'uk')
		assert.equal(reparsed.itemCount, 3)
		assert.deepEqual(reparsed.files, SAMPLE_FILES)
	})

	it('yields exactly 4 intents in happy path', async () => {
		const model = new CatalogIndexModel({ catalog: 'x', locale: 'en' })
		const env = createEnv()
		const { intents } = await drain(model.run(env))

		assert.equal(intents.length, 4)
	})

	it('yields exactly 1 intent when catalog name is missing', async () => {
		const model = new CatalogIndexModel()
		const env = createEnv()
		const { intents } = await drain(model.run(env))

		assert.equal(intents.length, 1) // only the error log
	})

	it('yields exactly 2 intents when catalog is empty', async () => {
		const model = new CatalogIndexModel({ catalog: 'x' })
		const env = createEnv({ files: [] })
		const { intents } = await drain(model.run(env))

		assert.equal(intents.length, 2) // progress(scan) + log(empty)
	})
})
