import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ProjectModel } from '../../domain/ProjectModel.js'

describe('ProjectModel', () => {
	it('should initialize with default status and phases', () => {
		const model = new ProjectModel({
			mission: 'Test Mission',
			intent: 'Seed intent phase',
		})

		// Basic meta validation
		assert.equal(model.type, 'feature')
		assert.equal(model.status, 'planning')
		assert.deepEqual(model.models, [])

		// Check required custom inputs
		assert.equal(model.mission, 'Test Mission')
		assert.equal(model.intent, 'Seed intent phase')

		// Array phases should initialize as empty arrays if not provided
		assert.deepEqual(model.contract, [])
		assert.deepEqual(model.ui_chat, [])
	})

	it('static phases should match OLMUI 9-phase architecture', () => {
		const expectedPhases = [
			'seed',
			'model',
			'contract',
			'adapter',
			'ui_cli',
			'ui_chat',
			'ui_web',
			'ui_mobile',
			'qa',
		]
		assert.deepEqual(ProjectModel.phases, expectedPhases)
	})
})
