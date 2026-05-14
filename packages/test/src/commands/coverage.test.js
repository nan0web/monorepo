import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import CoverageCommand from './coverage.js'
const Coverage = CoverageCommand.Message

describe('CoverageCommand', () => {
	it('should parse Coverage with default options', () => {
		const msg = new Coverage({})
		assert.equal(msg.body.help, false)
	})

	it('should parse Coverage with custom options', () => {
		const msg = new Coverage({ body: { help: 'true' } })
		assert.equal(msg.body.help, true)
	})
})
