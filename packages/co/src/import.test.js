import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isConstructible } from '@nan0web/types'
import { Message } from './index.js'

suite('Import package test', () => {
	describe('Message', () => {
		it('should be defined', () => {
			assert.ok(Message)
			assert.ok(isConstructible(Message))
		})
	})
})
