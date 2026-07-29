import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import DBFS from '../../../../src/index.js'
import fs from 'node:fs'

describe('v3.2.1 DBFS Path Resolution Bugfix', () => {
	it('should correctly resolve location when root is a physical directory', () => {
		// Create a temporary directory to act as root
		const tempDir = path.resolve(process.cwd(), '.test-dbfs-root')
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true })
		}

		// Initialize DBFS with the absolute path to this directory
		const db = new DBFS({ root: tempDir })
		const docLocation = db.location('test.nan0')

		// Ensure that the location does NOT get mangled (it should remain an absolute path
		// pointing inside our tempDir).
		assert.equal(docLocation, path.resolve(tempDir, 'test.nan0'))
		
		// Clean up
		fs.rmdirSync(tempDir)
	})
})
