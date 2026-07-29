import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import DBFS from '../../../../../DBFS.js'

describe('DBFS Core Expansion (v3.2.0)', () => {
	const tmpDir = path.resolve('.', '.tmp-test-3.2.0')

	before(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
		fs.mkdirSync(tmpDir, { recursive: true })
		fs.writeFileSync(path.join(tmpDir, 'file.txt'), 'hello')
		fs.symlinkSync('file.txt', path.join(tmpDir, 'file-link.txt'))
	})

	after(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	it('listDir() preserves isSymbolicLink using lstat', async () => {
		const db = new DBFS({ root: tmpDir })
		
		const entries = await db.listDir('')
		const linkEntry = entries.find(e => e.name === 'file-link.txt')
		
		assert.ok(linkEntry, 'Symlink entry should be found')
		assert.strictEqual(linkEntry.stat.isSymbolicLink, true, 'isSymbolicLink should be true')
	})

	it('realpath() resolves symbolic links back to relative URIs', async () => {
		const db = new DBFS({ root: tmpDir })
		
		// The symlink 'file-link.txt' points to 'file.txt' which is inside tmpDir.
		// realpathSync should resolve it to the absolute path of file.txt,
		// and DBFS.realpath should map it back to the relative URI 'file.txt'.
		const resolved = db.realpath('file-link.txt')
		assert.strictEqual(resolved, 'file.txt')
	})

	it('getVolumes() returns an array including root', async () => {
		const db = new DBFS({ root: tmpDir })
		const volumes = await db.getVolumes()
		
		assert.ok(Array.isArray(volumes), 'getVolumes should return an array')
		assert.ok(volumes.length > 0, 'Should have at least one volume')
		assert.ok(volumes.includes('/'), 'Should include root volume')
	})
})
