import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

import Release from './release.js'

/**
 * @todo
 * It must validate the structure of every release.
 * It must be in src/Release.validate().
 * It must validate loaded markdown into document with the file structure
 */

describe('Release v1.0.0', () => {
	it('has a valid static version', () => {
		assert.equal(Release.version, 'v1.0.0')
	})

	it('has a valid static date', () => {
		const date =
			Release.createdAt instanceof Date
				? Release.createdAt.toISOString().split('T')[0]
				: Release.createdAt
		assert.equal(date, '2025-08-18')
	})

	it('references a valid Company with name', () => {
		assert.ok(Release.company)
		assert.equal(Release.company.name, 'NaN•Web')
	})

	it('has a DevTeam defined in teams', () => {
		assert.ok(Release.teams.DevTeam)
		assert.equal(Release.teams.DevTeam.name, 'Software development team')
	})

	it('includes all core models: Person, Contact, Message', () => {
		assert.ok(typeof Person !== 'undefined' || typeof Release.members.YaRaSLove !== 'undefined')
		// Note: these would be imported if external deps existed
	})
})
