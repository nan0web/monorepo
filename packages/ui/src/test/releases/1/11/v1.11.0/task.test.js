import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as Intents from '../../../../../core/Intent.js'
import Model from '../../../../../Model/index.js'

describe('Release v1.11.0 Contract', () => {
	it('Exports ask, progress, result, show, render as standard functions', () => {
		assert.strictEqual(typeof Intents.ask, 'function')
		assert.strictEqual(typeof Intents.progress, 'function')
		assert.strictEqual(typeof Intents.result, 'function')
		assert.strictEqual(typeof Intents.show, 'function')
		assert.strictEqual(typeof Intents.render, 'function')
		// Ensure they are truly functions and not instantiated block objects or undefined
	})

	it('show() creates a valid show intent with fallback level "info"', () => {
		const intent = Intents.show('Standard message')
		assert.deepEqual(intent, {
			type: 'show',
			level: 'info',
			message: 'Standard message'
		})
	})

	it('show() accepts custom levels and data payloads', () => {
		const intent = Intents.show('Database connected', 'success', { db: 'nan0' })
		assert.deepEqual(intent, {
			type: 'show',
			level: 'success',
			message: 'Database connected',
			db: 'nan0'
		})
	})

	it('Model central index officially exports Business Critical Models', () => {
		assert.ok(Model.EmptyStateModel, 'EmptyStateModel is missing from central Model')
		assert.ok(Model.BannerModel, 'BannerModel is missing from central Model')
		assert.ok(Model.ProfileDropdownModel, 'ProfileDropdownModel is missing from central Model')
	})
})
