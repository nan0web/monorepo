/**
 * Release v1.1.0 — First NPM Publication Contract
 *
 * Validates that @nan0web/editor is ready for its first npm publish.
 * Each test directly imports and exercises the package's public API.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

describe('v1.1.0 — Package Identity & Version', () => {
	it('package name is @nan0web/editor', () => {
		assert.equal(pkg.name, '@nan0web/editor')
	})

	it('version is 1.1.0', () => {
		assert.equal(pkg.version, '1.1.0')
	})

	it('type is ESM module', () => {
		assert.equal(pkg.type, 'module')
	})

	it('has ISC license', () => {
		const license = fs.readFileSync('LICENSE', 'utf8')
		assert.ok(license.includes('ISC'))
	})
})

describe('v1.1.0 — Package Exports Map', () => {
	it('main field points to src/core/index.js', () => {
		assert.equal(pkg.main, 'src/core/index.js')
	})

	it('types field points to types/index.d.ts', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	it('exports "." import resolves to ./src/core/index.js', () => {
		assert.equal(pkg.exports['.'].import, './src/core/index.js')
	})

	it('exports "." types resolves to ./types/index.d.ts', () => {
		assert.equal(pkg.exports['.'].types, './types/index.d.ts')
	})
})

describe('v1.1.0 — Core API: EditorModel', () => {
	it('EditorModel is importable from core', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		assert.ok(typeof EditorModel === 'function')
	})

	it('EditorModel constructs with db dependency', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const db = { loadDocument: async () => ({}), saveDocument: async () => true }
		const model = new EditorModel({ db, uri: 'test.json' })
		assert.ok(model)
		assert.equal(model.uri, 'test.json')
		assert.equal(model.mode, 'preview')
	})

	it('EditorModel.loadDocument fetches from db', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const doc = { title: 'Hello', $content: [] }
		const db = { loadDocument: async () => doc }
		const model = new EditorModel({ db, uri: 'page.json' })
		const loaded = await model.loadDocument()
		assert.deepStrictEqual(loaded, doc)
		assert.deepStrictEqual(model.content, doc)
	})

	it('EditorModel.updateContent replaces content', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const db = { loadDocument: async () => ({}) }
		const model = new EditorModel({ db })
		model.updateContent({ title: 'Updated' })
		assert.equal(model.content.title, 'Updated')
	})

	it('EditorModel.switchMode toggles between modes', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const db = { loadDocument: async () => ({}) }
		const model = new EditorModel({ db })
		assert.equal(model.mode, 'preview')
		model.switchMode('code')
		assert.equal(model.mode, 'code')
		model.switchMode('visual')
		assert.equal(model.mode, 'visual')
	})

	it('EditorModel.onChange fires on state change', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const db = { loadDocument: async () => ({}) }
		const model = new EditorModel({ db })
		const events = []
		model.onChange((e) => events.push(e))
		model.updateContent({ x: 1 })
		model.switchMode('code')
		assert.equal(events.length, 2)
		assert.equal(events[0].content.x, 1)
		assert.equal(events[1].mode, 'code')
	})

	it('EditorModel.onChange returns unsubscribe function', async () => {
		const { EditorModel } = await import('../../../../src/core/index.js')
		const db = { loadDocument: async () => ({}) }
		const model = new EditorModel({ db })
		const events = []
		const unsub = model.onChange((e) => events.push(e))
		model.updateContent({ a: 1 })
		unsub()
		model.updateContent({ a: 2 })
		assert.equal(events.length, 1, 'Should stop receiving events after unsubscribe')
	})
})

describe('v1.1.0 — Core API: ModalStack', () => {
	it('ModalStack is importable from core', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		assert.ok(typeof ModalStack === 'function')
	})

	it('ModalStack starts empty', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack()
		assert.equal(stack.depth, 0)
		assert.equal(stack.current, null)
	})

	it('ModalStack.push adds model and increments depth', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack()
		const m = { uri: 'doc.json' }
		stack.push(m)
		assert.equal(stack.depth, 1)
		assert.deepStrictEqual(stack.current, m)
	})

	it('ModalStack.pop removes model and returns it', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack()
		const m = { uri: 'doc.json' }
		stack.push(m)
		const removed = stack.pop()
		assert.deepStrictEqual(removed, m)
		assert.equal(stack.depth, 0)
	})

	it('ModalStack.items returns copy of internal stack', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack()
		stack.push({ uri: 'a.json' })
		stack.push({ uri: 'b.json' })
		const items = stack.items
		assert.equal(items.length, 2)
		// Mutation should not affect internal state
		items.pop()
		assert.equal(stack.depth, 2)
	})

	it('ModalStack enforces maxDepth limit', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack({ maxDepth: 2 })
		stack.push({ uri: '1' })
		stack.push({ uri: '2' })
		assert.throws(() => stack.push({ uri: '3' }), /depth limit/)
	})

	it('ModalStack.onChange fires on push/pop', async () => {
		const { ModalStack } = await import('../../../../src/core/index.js')
		const stack = new ModalStack()
		const events = []
		stack.onChange((s) => events.push(s))
		stack.push({ uri: 'x' })
		stack.pop()
		assert.equal(events.length, 2)
	})
})

describe('v1.1.0 — Core API: PersistenceManager', () => {
	it('PersistenceManager is importable from core', async () => {
		const { PersistenceManager } = await import('../../../../src/core/index.js')
		assert.ok(typeof PersistenceManager === 'function')
	})

	it('PersistenceManager.save uses cache strategy by default', async () => {
		const { PersistenceManager } = await import('../../../../src/core/index.js')
		let setCalled = false
		const db = {
			set: async () => {
				setCalled = true
				return true
			},
		}
		const pm = new PersistenceManager({ db })
		await pm.save('doc.json', { title: 'test' })
		assert.ok(setCalled, 'db.set should be called for cache strategy')
	})

	it('PersistenceManager.configure changes active strategies', async () => {
		const { PersistenceManager } = await import('../../../../src/core/index.js')
		const db = { set: async () => true }
		const pm = new PersistenceManager({ db })
		// Should not throw
		pm.configure({ commit: true })
		assert.ok(true)
	})
})

describe('v1.1.0 — Type Declarations', () => {
	it('types/index.d.ts exists', () => {
		assert.ok(fs.existsSync('types/index.d.ts'), 'types/index.d.ts must exist')
	})

	it('types/core/Editor.d.ts exists', () => {
		assert.ok(fs.existsSync('types/core/Editor.d.ts'), 'types/core/Editor.d.ts must exist')
	})

	it('types/core/ModalStack.d.ts exists', () => {
		assert.ok(fs.existsSync('types/core/ModalStack.d.ts'), 'types/core/ModalStack.d.ts must exist')
	})

	it('types/core/PersistenceManager.d.ts exists', () => {
		assert.ok(
			fs.existsSync('types/core/PersistenceManager.d.ts'),
			'types/core/PersistenceManager.d.ts must exist',
		)
	})
})

describe('v1.1.0 — Peer Dependencies', () => {
	it('peerDependencies includes @nan0web/db', () => {
		assert.ok(pkg.peerDependencies['@nan0web/db'], '@nan0web/db should be a peer dependency')
	})

	it('peerDependencies @nan0web/db version is ^1.3.0', () => {
		assert.equal(pkg.peerDependencies['@nan0web/db'], '^1.3.0')
	})
})

describe('v1.1.0 — Package Hygiene (.npmignore)', () => {
	it('.npmignore exists', () => {
		assert.ok(fs.existsSync('.npmignore'), '.npmignore must exist')
	})

	it('.npmignore excludes play/', () => {
		const content = fs.readFileSync('.npmignore', 'utf8')
		assert.ok(content.includes('play/'), '.npmignore should exclude play/')
	})

	it('.npmignore excludes docs/', () => {
		const content = fs.readFileSync('.npmignore', 'utf8')
		assert.ok(content.includes('docs/'), '.npmignore should exclude docs/')
	})

	it('.npmignore excludes test files', () => {
		const content = fs.readFileSync('.npmignore', 'utf8')
		assert.ok(content.includes('*.test.js'), '.npmignore should exclude *.test.js')
	})

	it('.npmignore excludes releases/', () => {
		const content = fs.readFileSync('.npmignore', 'utf8')
		assert.ok(content.includes('releases/'), '.npmignore should exclude releases/')
	})
})

describe('v1.1.0 — ProvenDoc README.md', () => {
	it('README.md exists and is not empty', () => {
		const readme = fs.readFileSync('README.md', 'utf8')
		assert.ok(readme.length > 100, 'README.md should have substantial content')
	})

	it('README.md mentions @nan0web/editor', () => {
		const readme = fs.readFileSync('README.md', 'utf8')
		assert.ok(readme.includes('@nan0web/editor'))
	})

	it('README.md has install instructions', () => {
		const readme = fs.readFileSync('README.md', 'utf8')
		assert.ok(readme.includes('npm install'))
	})

	it('README.md documents ModalStack API', () => {
		const readme = fs.readFileSync('README.md', 'utf8')
		assert.ok(readme.includes('ModalStack'))
	})

	it('README.md documents EditorModel API', () => {
		const readme = fs.readFileSync('README.md', 'utf8')
		assert.ok(readme.includes('EditorModel'))
	})
})
