import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { SpecRunner } from '../testing/index.js'
import { ModelAsApp, ask, show, result } from '../index.js'

const db = new DB({ root: 'tests/uk' })

async function loadStory(name) {
	const doc = await db.loadDocument(`${name}.nan0`)
	return doc
}

describe('Workflow Story: Shopping Cart Purchase', () => {
	class ShoppingCartApp extends ModelAsApp {
		async *run() {
			const { value: product } = yield ask('product', { help: 'Select product' })
			if (product === 'laptop') {
				yield show('Good choice!')
			}
			const { value: confirm } = yield ask('confirm', { help: 'Confirm purchase?' })
			return result({ product: product, confirm: confirm })
		}
	}

	it('should successfully buy a laptop and show a message via SpecRunner', async () => {
		const doc = await loadStory('shopping.story')
		assert.ok(Array.isArray(doc.story), 'Story must be an array')

		await assert.doesNotReject(() => SpecRunner.execute(doc.story, { ShoppingCartApp }))
	})
})

describe('Workflow Story: Validated Input Form', () => {
	class ValidatedApp extends ModelAsApp {
		async *run() {
			const { value: code } = yield ask('code', { help: 'Enter code', required: true })
			if (!code) throw new Error('Code is mandatory')
			return result({ code: code })
		}
	}

	it('should successfully process a valid code via SpecRunner', async () => {
		const doc = await loadStory('validated.story')
		assert.ok(Array.isArray(doc.story), 'Story must be an array')

		await assert.doesNotReject(() => SpecRunner.execute(doc.story, { ValidatedApp }))
	})

	it('should fail if user provides empty input (Node.js Test)', async () => {
		// Testing error conditions are better suited as explicit scenarios or node:test
		const stream = [{ ValidatedApp: {} }, { ask: 'code', $value: '' }]

		await assert.rejects(SpecRunner.execute(stream, { ValidatedApp }), /Code is mandatory/)
	})
})
