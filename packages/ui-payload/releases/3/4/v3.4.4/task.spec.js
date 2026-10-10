import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fromNan0Html, toNan0Html, FORMAT, inventoryNan0Html } from '../../../../src/richtext/index.js'
import { PayloadCollectionTemplate } from '../../../../src/templates/PayloadCollectionTemplate.js'
import { CodeTemplate } from '@nan0web/ui'

describe('Release v3.4.4: Pure Named Exports & CodeTemplate Inheritance in @nan0web/ui-payload', () => {
	it('1.1 exports pure named functions from richtext index', () => {
		assert.equal(typeof fromNan0Html, 'function')
		assert.equal(typeof toNan0Html, 'function')
		assert.equal(typeof inventoryNan0Html, 'function')
		assert.ok(FORMAT)
	})

	it('1.2 PayloadCollectionTemplate inherits from CodeTemplate', () => {
		const template = new PayloadCollectionTemplate()
		assert.ok(template instanceof CodeTemplate, 'Must inherit from CodeTemplate')
	})
})
