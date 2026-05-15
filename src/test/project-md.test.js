import test from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { validateProjectMD } from '../../bin/project-validator.js'

test('Architecture: packages/ui-cli/project.md validation', async () => {
	const projectPath = path.resolve(process.cwd(), 'packages/ui-cli/project.md')
	const errors = await validateProjectMD(projectPath)
	
	assert.strictEqual(errors.length, 0, `Project documentation should be valid. Errors: ${errors.join(', ')}`)
})

test('Architecture: detect invalid project.md', async () => {
    // Create a temporary invalid file in memory or via mock
    // For simplicity, we just test that the validator works on an empty file (which is invalid)
    const errors = await validateProjectMD(path.resolve(process.cwd(), 'package.json')) // definitely not a valid project.md
    assert.ok(errors.length > 0, 'Validator should detect invalid project.md structure')
})
