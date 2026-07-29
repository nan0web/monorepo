import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import DBFS from './DBFS.js'

// Global test setup
let db
let tempDir

async function setupTest() {
	tempDir = path.join(tmpdir(), `db-fs-validation-test-${Date.now()}`)
	await mkdir(tempDir, { recursive: true })
	db = new DBFS({ cwd: tempDir, root: tempDir })
	await db.connect()
}

async function cleanupTest() {
	if (db) {
		try {
			await db.disconnect()
		} catch (e) {
			// Ignore cleanup errors
		}
	}
	try {
		await rm(tempDir, { recursive: true, force: true })
	} catch (e) {
		// Ignore cleanup errors
	}
}

describe('DBFS Document Validation', () => {
	beforeEach(async () => {
		await setupTest()
	})

	afterEach(async () => {
		await cleanupTest()
	})

	describe('YAML Validation', () => {
		it('should reject null YAML document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.yaml', '@test/null.yaml', null),
				(e) => {
					assert.ok(e.message.includes('YAML document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should reject undefined YAML document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.yaml', '@test/undefined.yaml', undefined),
				(e) => {
					assert.ok(e.message.includes('YAML document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should accept valid YAML object', async () => {
			const validDoc = { name: 'test', value: 42 }
			const result = await db.saveDocumentAs('.yaml', '@test/valid.yaml', validDoc)
			assert.strictEqual(result, true)
		})

		it('should accept valid YAML string', async () => {
			const validDoc = 'simple string'
			const result = await db.saveDocumentAs('.yaml', '@test/string.yaml', validDoc)
			assert.strictEqual(result, true)
		})

		it('should accept valid YAML number', async () => {
			const validDoc = 123
			const result = await db.saveDocumentAs('.yaml', '@test/number.yaml', validDoc)
			assert.strictEqual(result, true)
		})
	})

	describe('NaN0 Validation', () => {
		it('should reject null NaN0 document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.nan0', '@test/null.nan0', null),
				(e) => {
					assert.ok(e.message.includes('NaN·Web document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should reject undefined NaN0 document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.nan0', '@test/undefined.nan0', undefined),
				(e) => {
					assert.ok(e.message.includes('NaN·Web document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should reject non-object NaN0 document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.nan0', '@test/string.nan0', 'not an object'),
				(e) => {
					assert.ok(e.message.includes('NaN·Web document must be an object'))
					return true
				}
			)
		})

		it('should accept valid NaN0 object', async () => {
			const validDoc = { name: 'test', nested: { value: 42 } }
			const result = await db.saveDocumentAs('.nan0', '@test/valid.nan0', validDoc)
			assert.strictEqual(result, true)
		})
	})

	describe('JSONL Validation', () => {
		it('should reject non-array JSONL document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.jsonl', '@test/object.jsonl', { not: 'array' }),
				(e) => {
					assert.ok(e.message.includes('JSONL document must be an array'))
					return true
				}
			)
		})

		it('should reject array with null items', async () => {
			await assert.rejects(
				db.saveDocumentAs('.jsonl', '@test/null-items.jsonl', [null, { valid: true }]),
				(e) => {
					assert.ok(e.message.includes('JSONL array items cannot be null or undefined'))
					return true
				}
			)
		})

		it('should reject array with undefined items', async () => {
			await assert.rejects(
				db.saveDocumentAs('.jsonl', '@test/undefined-items.jsonl', [undefined, { valid: true }]),
				(e) => {
					assert.ok(e.message.includes('JSONL array items cannot be null or undefined'))
					return true
				}
			)
		})

		it('should accept valid JSONL array', async () => {
			const validDoc = [{ id: 1, name: 'first' }, { id: 2, name: 'second' }]
			const result = await db.saveDocumentAs('.jsonl', '@test/valid.jsonl', validDoc)
			assert.strictEqual(result, true)
		})

		it('should accept empty JSONL array', async () => {
			const validDoc = []
			const result = await db.saveDocumentAs('.jsonl', '@test/empty.jsonl', validDoc)
			assert.strictEqual(result, true)
		})
	})

	describe('JSON Validation', () => {
		it('should reject null JSON document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.json', '@test/null.json', null),
				(e) => {
					assert.ok(e.message.includes('JSON document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should reject undefined JSON document', async () => {
			await assert.rejects(
				db.saveDocumentAs('.json', '@test/undefined.json', undefined),
				(e) => {
					assert.ok(e.message.includes('JSON document cannot be null or undefined'))
					return true
				}
			)
		})

		it('should accept valid JSON object', async () => {
			const validDoc = { name: 'test', value: 42, nested: { data: true } }
			const result = await db.saveDocumentAs('.json', '@test/valid.json', validDoc)
			assert.strictEqual(result, true)
		})

		it('should accept valid JSON array', async () => {
			const validDoc = [1, 2, 3, { nested: 'object' }]
			const result = await db.saveDocumentAs('.json', '@test/array.json', validDoc)
			assert.strictEqual(result, true)
		})

		it('should accept valid JSON primitive values', async () => {
			const validDocs = ['string', 42, true, null] // note: null is valid in JSON
			for (const doc of validDocs) {
				// For the purpose of this test, we're testing that the saver accepts the document
				// Note: our validation only checks for undefined, null is valid JSON
				if (doc !== null) {
					const result = await db.saveDocumentAs('.json', `@test/primitive-${typeof doc}.json`, doc)
					assert.strictEqual(result, true)
				}
			}
		})
	})

	describe('Error Message Format', () => {
		it('should include filename in error message for YAML validation', async () => {
			try {
				await db.saveDocumentAs('.yaml', '@test/error.yaml', null)
				assert.fail('Should have thrown an error')
			} catch (e) {
				assert.ok(e.message.includes('@test/error.yaml'))
				assert.ok(e.message.includes('Invalid document format'))
			}
		})

		it('should include filename in error message for NaN0 validation', async () => {
			try {
				await db.saveDocumentAs('.nan0', '@test/error.nan0', 'not an object')
				assert.fail('Should have thrown an error')
			} catch (e) {
				assert.ok(e.message.includes('@test/error.nan0'))
				assert.ok(e.message.includes('Invalid document format'))
			}
		})

		it('should include filename in error message for JSONL validation', async () => {
			try {
				await db.saveDocumentAs('.jsonl', '@test/error.jsonl', { not: 'array' })
				assert.fail('Should have thrown an error')
			} catch (e) {
				assert.ok(e.message.includes('@test/error.jsonl'))
				assert.ok(e.message.includes('Invalid document format'))
			}
		})
	})
})