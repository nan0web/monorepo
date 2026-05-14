import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import AppTheme from './AppTheme.js'

describe('AppTheme', () => {
	it('should be an abstract class', () => {
		assert.throws(() => new AppTheme(), {
			message: 'AppTheme is not a constructor',
		})
	})
})
