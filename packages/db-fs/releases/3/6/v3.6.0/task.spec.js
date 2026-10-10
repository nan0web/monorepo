import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import DBFS, { DBFSPath } from '../../../../src/index.js'

describe('Release v3.6.0 Contract: Base36 Transparent Sharding & Safe URI Mapping (@nan0web/db-fs)', () => {
	const tmpDir = path.resolve('.', '.tmp-test-3.6.0')

	before(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
		fs.mkdirSync(tmpDir, { recursive: true })
	})

	after(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	describe('§1 resolveShardedSegment Contract & Base36 Hash Determinism', () => {
		it('1.1 resolves segments without colon directly without sharding', () => {
			assert.equal(DBFSPath.resolveShardedSegment('regular'), 'regular')
			assert.equal(DBFSPath.resolveShardedSegment('answers'), 'answers')
			assert.equal(DBFSPath.resolveShardedSegment('test-1'), 'test-1')
		})

		it('1.2 safely maps colons ":" to "~"', () => {
			const sharded = DBFSPath.resolveShardedSegment('did:nano:student1')
			assert.ok(!sharded.includes(':'), 'Sharded path must never contain colons')
			assert.ok(sharded.includes('~'), 'Sharded path must map colons to tildes')
			assert.ok(sharded.endsWith('did~nano~student1'))
		})

		it('1.3 generates deterministic 2-character Base36 prefix (1296 buckets)', () => {
			const sharded1 = DBFSPath.resolveShardedSegment('did:nano:student1')
			const sharded2 = DBFSPath.resolveShardedSegment('did:nano:student1')
			assert.equal(sharded1, sharded2, 'Sharded segment must be 100% deterministic')

			const parts = sharded1.split('/')
			assert.equal(parts.length, 2, 'Must have prefix folder and sanitized name')
			const [bucket, name] = parts
			assert.equal(bucket.length, 2, 'Bucket prefix must be exactly 2 characters')
			assert.match(bucket, /^[a-z0-9]{2}$/, 'Bucket prefix must be lowercase alphanumeric Base36')
			assert.equal(name, 'did~nano~student1')
		})

		it('1.4 provides instance method on db or inherits from DBFSPath', () => {
			const db = new DBFS({ root: tmpDir })
			assert.equal(typeof db.resolveShardedSegment, 'function')
			assert.equal(db.resolveShardedSegment('did:nano:test'), DBFSPath.resolveShardedSegment('did:nano:test'))
		})
	})

	describe('§2 Transparent DBFS Sharding (saveDocument, loadDocument, statDocument)', () => {
		it('2.1 saves and loads document transparently using logical URI with DID', async () => {
			const db = new DBFS({ root: tmpDir })
			const logicalUri = 'students/did:nano:student1/answers/test-1.nan0'
			const payload = { score: 95, passed: true, student: 'did:nano:student1' }

			await db.saveDocument(logicalUri, payload)

			// Load using logical URI
			const loaded = await db.loadDocument(logicalUri)
			assert.deepEqual(loaded, payload)

			// Stat using logical URI
			const stat = await db.statDocument(logicalUri)
			assert.ok(stat.exists, 'Document must exist')
			assert.ok(stat.isFile, 'Must be a file')

			// Physical inspection on disk
			const bucket = DBFSPath.resolveShardedSegment('did:nano:student1').split('/')[0]
			const expectedPhysicalPath = path.join(
				tmpDir,
				'students',
				bucket,
				'did~nano~student1',
				'answers',
				'test-1.nan0'
			)
			assert.ok(fs.existsSync(expectedPhysicalPath), `Physical file must exist at ${expectedPhysicalPath}`)
		})

		it('2.2 supports saveFile, loadDocumentAs and dropDocument with sharded paths', async () => {
			const db = new DBFS({ root: tmpDir })
			const logicalUri = 'members/did:key:z6MkhaX/profile.txt'
			const content = 'Public DID Profile Content'

			await db.saveFile(logicalUri, content)

			const loaded = await db.loadDocumentAs('.txt', logicalUri)
			assert.equal(loaded, content)

			const dropped = await db.dropDocument(logicalUri)
			assert.ok(dropped)

			const afterStat = await db.statDocument(logicalUri)
			assert.equal(afterStat.exists, false)
		})
	})

	describe('§3 Directory Traversal & findStream Transparency', () => {
		it('3.1 listDir transparently unmasks sharded directories to logical URI segments', async () => {
			const db = new DBFS({ root: tmpDir })
			await db.saveDocument('students/did:nano:alpha/profile.json', { name: 'Alpha' })
			await db.saveDocument('students/did:nano:beta/profile.json', { name: 'Beta' })

			const entries = await db.listDir('students')
			const names = entries.map((e) => e.name)
			assert.ok(names.includes('did:nano:alpha'), 'listDir must present logical DID names')
			assert.ok(names.includes('did:nano:beta'), 'listDir must present logical DID names')
			assert.ok(!names.some((n) => n.includes('~')), 'listDir must not expose sanitized ~')
		})

		it('3.2 findStream transparently unmasks paths and locates sharded files', async () => {
			const db = new DBFS({ root: tmpDir })
			await db.saveDocument('registry/did:nano:node1/status.json', { active: true })

			const results = []
			for await (const entry of db.findStream('registry')) {
				results.push(entry.file.path)
			}

			assert.ok(
				results.some((p) => p.includes('registry/did:nano:node1/status.json')),
				'findStream must yield logical URI paths'
			)
		})
	})
})
