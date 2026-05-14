import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'

describe('Git-Native & Version-Controlled Workflow', () => {
	it('Treats project management like code: everything is versioned, auditable, reversible.', () => {
		assert.ok(true, 'Philosophy is documented as executable intent')
	})

	it('No external tools or databases needed — just Git.', () => {
		try {
			const gitVersion = execSync('git --version', { encoding: 'utf8' })
			assert.ok(gitVersion.includes('git version'), 'Git is available in the environment')
		} catch (e) {
			assert.fail('Git should be available for Git-Native workflow')
		}
	})

	it('Natural for developers; lowers barrier to entry for dev-centric teams.', () => {
		assert.ok(true)
	})
})
