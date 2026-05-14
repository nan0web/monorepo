import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SpecRunner } from '../../../../../testing/SpecRunner.js'

describe('v1.12.2 SpecRunner executeFile Helper', () => {
	it('should expose static async executeFile method', () => {
		assert.equal(typeof SpecRunner.executeFile, 'function', 'executeFile must be a function')
	})
})
