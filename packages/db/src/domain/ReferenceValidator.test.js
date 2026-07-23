import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import BaseDB from '../index.js'
import ReferenceValidator from './ReferenceValidator.js'
import { NoConsole } from '@nan0web/log'

suite('ReferenceValidator', () => {
	describe('extractReferences', () => {
		it('should extract $ref and href keys', () => {
			const data = {
				a: { $ref: 'doc1.json' },
				b: { href: 'doc2.json' },
				$ref: 'doc3.json',
				href: 'doc4.json',
				c: { $href: 'doc5.json' },
				ignore: 'text',
			}
			const extracted = ReferenceValidator.extractReferences(data)
			assert.deepEqual(extracted, [
				{ path: '$ref', ref: 'doc3.json' },
				{ path: 'a/$ref', ref: 'doc1.json' },
				{ path: 'b/href', ref: 'doc2.json' },
				{ path: 'c/$href', ref: 'doc5.json' },
				{ path: 'href', ref: 'doc4.json' },
			])
		})

		it('should handle $ref: prefixes and fragments', () => {
			const data = {
				link1: { $ref: '$ref:other.json#prop' },
				link2: { href: 'file.md#section' },
			}
			const extracted = ReferenceValidator.extractReferences(data)
			assert.deepEqual(extracted, [
				{ path: 'link1/$ref', ref: 'other.json' },
				{ path: 'link2/href', ref: 'file.md' },
			])
		})

		it('should handle non-object inputs safely', () => {
			assert.deepEqual(ReferenceValidator.extractReferences(null), [])
			assert.deepEqual(ReferenceValidator.extractReferences('string'), [])
			assert.deepEqual(ReferenceValidator.extractReferences(123), [])
		})

		it('should ignore empty string references', () => {
			const data = { $ref: '   ', href: '' }
			assert.deepEqual(ReferenceValidator.extractReferences(data), [])
		})
	})

	describe('Database Integration', () => {
		it('should validate references inside a document', async () => {
			const predefined = [
				['good.json', { value: 'ok' }],
				['doc.json', { 
					goodLink: { $ref: 'good.json' },
					badLink: { $ref: 'missing.json' }
				}]
			]
			const db = new BaseDB({ predefined, console: new NoConsole() })
			await db.connect()
			
			const validator = new ReferenceValidator(db)
			const broken = await validator.validateDocument('doc.json')
			
			assert.strictEqual(broken.length, 1)
			assert.strictEqual(broken[0].path, 'badLink/$ref')
			assert.strictEqual(broken[0].ref, 'missing.json')
			assert.strictEqual(broken[0].resolvedUri, 'missing.json')
		})

		it('should validate relative references correctly', async () => {
			const predefined = [
				['folder/target.json', { value: 'ok' }],
				['folder/doc.json', { 
					relative: { $ref: 'target.json' },
					parent: { $ref: '../target.json' }, // missing because it resolves to root/target.json
					root: { $ref: '/folder/target.json' }
				}]
			]
			const db = new BaseDB({ predefined, console: new NoConsole() })
			await db.connect()
			
			const validator = new ReferenceValidator(db)
			const broken = await validator.validateDocument('folder/doc.json')
			
			// parent is broken because it resolves to /target.json which doesn't exist
			assert.strictEqual(broken.length, 1)
			assert.strictEqual(broken[0].path, 'parent/$ref')
		})

		it('should validate all documents in the database', async () => {
			const predefined = [
				['a.json', { $ref: 'b.json' }], // OK
				['b.json', { href: 'c.json' }], // Broken
				['dir/c.json', { $ref: '../a.json' }], // OK
				['dir/d.json', { $href: 'e.json' }], // Broken (dir/e.json missing)
			]
			const db = new BaseDB({ predefined, console: new NoConsole() })
			await db.connect()
			
			const validator = new ReferenceValidator(db)
			const allBroken = await validator.validateAll()
			
			const keys = Object.keys(allBroken).sort()
			assert.deepEqual(keys, ['b.json', 'dir/d.json'])
			
			assert.strictEqual(allBroken['b.json'][0].ref, 'c.json')
			assert.strictEqual(allBroken['dir/d.json'][0].ref, 'e.json')
			assert.strictEqual(allBroken['dir/d.json'][0].resolvedUri, 'dir/e.json')
		})
	})
})
