import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { EditorModel } from './EditorModel.js'
import { EditorConfig } from './EditorConfig.js'
import { EditorPermissions } from './EditorPermissions.js'
import DB from '@nan0web/db'

/**
 * Consume all yields from a generator and return the final value.
 * (In-Memory runner, no external dependencies.)
 * @template T
 * @param {AsyncGenerator<T>} gen
 * @returns {Promise<T>}
 */
async function consumeGenerator(gen) {
	let result
	while (true) {
		const { value, done } = await gen.next()
		if (done) {
			result = value
			break
		}
		if (value && value.type === 'ask') {
			const final = await gen.next('exit')
			result = final.value
			if (final.done) break
		}
	}
	return result
}

/**
 * Collect all yielded events from a generator into an array.
 * @template T
 * @param {AsyncGenerator<T>} gen
 * @returns {Promise<T[]>}
 */
async function collectEvents(gen) {
	const events = []
	while (true) {
		const { value, done } = await gen.next()
		if (done) break
		events.push(value)
		if (value && value.type === 'ask') {
			await gen.next('exit')
			break
		}
	}
	return events
}

// ─────────────────────────────────────────────
// EditorConfig — Unit Tests
// ─────────────────────────────────────────────
describe('EditorConfig', () => {
	it('1. defaults to host mode (bundled=false, publicWrite=false)', () => {
		const config = new EditorConfig()
		assert.equal(config.bundled, false)
		assert.equal(config.publicWrite, false)
		assert.equal(config.defaultExport, 'incremental')
		assert.equal(config.diffPreview, true)
		assert.equal(config.importEnabled, true)
		assert.equal(config.resolveAccessMode({ hasAuth: false }), 'host')
	})

	it('2. resolves to host mode when bundled=false (regardless of auth)', () => {
		const config = new EditorConfig({ bundled: false })
		assert.equal(config.resolveAccessMode({ hasAuth: false }), 'host')
		assert.equal(config.resolveAccessMode({ hasAuth: true }), 'host')
	})

	it('3. resolves to authenticated mode when bundled=true and hasAuth=true', () => {
		const config = new EditorConfig({ bundled: true, publicWrite: false })
		assert.equal(config.resolveAccessMode({ hasAuth: true }), 'authenticated')
	})

	it('4. resolves to wiki mode when bundled=true, hasAuth=false, publicWrite=true', () => {
		const config = new EditorConfig({ bundled: true, publicWrite: true })
		assert.equal(config.resolveAccessMode({ hasAuth: false }), 'wiki')
	})

	it('5. resolves to sandbox mode when bundled=true, hasAuth=false, publicWrite=false', () => {
		const config = new EditorConfig({ bundled: true, publicWrite: false })
		assert.equal(config.resolveAccessMode({ hasAuth: false }), 'sandbox')
	})

	it('6. defaultExport options are valid enumerations', () => {
		const config = new EditorConfig()
		const valid = ['incremental', 'partial', 'full']
		assert.ok(valid.includes(config.defaultExport))
	})

	it('7. EditorConfig.from() returns EditorConfig instance from plain object', () => {
		const config = EditorConfig.from({ bundled: true, publicWrite: true })
		assert.ok(config instanceof EditorConfig)
		assert.equal(config.bundled, true)
		assert.equal(config.publicWrite, true)
	})

	it('8. EditorConfig.from() returns same instance if already EditorConfig', () => {
		const original = new EditorConfig({ bundled: true })
		const result = EditorConfig.from(original)
		assert.strictEqual(result, original)
	})

	it('9. EditorConfig.from() returns default instance on null/undefined', () => {
		const fromNull = EditorConfig.from(null)
		const fromUndefined = EditorConfig.from(undefined)
		assert.ok(fromNull instanceof EditorConfig)
		assert.ok(fromUndefined instanceof EditorConfig)
		assert.equal(fromNull.bundled, false)
	})
})

// ─────────────────────────────────────────────
// EditorPermissions — Unit Tests
// ─────────────────────────────────────────────
describe('EditorPermissions', () => {
	it('10. defaults: isAuthenticated=false, canEdit=true, canDelete=false, canManageUsers=false, canCommit=false', () => {
		const p = new EditorPermissions()
		assert.equal(p.isAuthenticated, false)
		assert.equal(p.canEdit, true)
		assert.equal(p.canDelete, false)
		assert.equal(p.canManageUsers, false)
		assert.equal(p.canCommit, false)
	})

	it('11. fullAccess() grants all permissions', () => {
		const p = EditorPermissions.fullAccess()
		assert.equal(p.isAuthenticated, true)
		assert.equal(p.canEdit, true)
		assert.equal(p.canDelete, true)
		assert.equal(p.canManageUsers, true)
		assert.equal(p.canCommit, true)
	})

	it('12. allows() method works for standard operations', () => {
		const p = new EditorPermissions({ canEdit: true, canDelete: false })
		assert.equal(p.allows('edit'), true)
		assert.equal(p.allows('delete'), false)
		assert.equal(p.allows('manageUsers'), false)
	})

	it('13. allows() returns false for unknown operations', () => {
		const p = new EditorPermissions({ canEdit: true })
		assert.equal(p.allows('unknownOp'), false)
	})
})

// ─────────────────────────────────────────────
// EditorModel — Integration / Contract Tests
// ─────────────────────────────────────────────
describe('EditorModel (Integration)', { timeout: 3000 }, () => {
	it('14. yields progress intent as first event', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) }, { db })
		const events = await collectEvents(model.run())
		const first = events[0]
		assert.equal(first.type, 'progress')
		assert.equal(first.message, EditorModel.UI.initializing)
	})

	it('15. yields info log about auth skipped when auth.app absent', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) }, { db })
		const events = await collectEvents(model.run())
		const authLog = events.find((e) => e.type === 'log' && e.level === 'info')
		assert.ok(authLog)
		assert.ok(
			authLog.message === EditorModel.UI.authSkipped ||
			authLog.message === EditorModel.UI.authLoaded
		)
	})

	it('16. returns status=ok for host mode', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) }, { db })
		const result = await consumeGenerator(model.run())
		assert.equal(result.status, 'ok')
	})

	it('17. returns status=ok for sandbox mode', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: true, publicWrite: false }) }, { db })
		const result = await consumeGenerator(model.run())
		assert.equal(result.status, 'ok')
	})

	it('18. returns status=ok for wiki mode', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: true, publicWrite: true }) }, { db })
		const result = await consumeGenerator(model.run())
		assert.equal(result.status, 'ok')
	})

	it('19. result.data contains session, permissions, mode, config, initialContent', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const config = new EditorConfig({ bundled: false })
		const model = new EditorModel({ config }, { db })
		const result = await consumeGenerator(model.run())
		assert.ok(result.data)
		assert.ok('session' in result.data)
		assert.ok('permissions' in result.data)
		assert.ok('mode' in result.data)
		assert.ok('config' in result.data)
		assert.ok('initialContent' in result.data)
	})

	it('20. result.data.mode matches config.resolveAccessMode()', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const modes = [
			{ bundled: false, publicWrite: false, expected: 'host' },
			{ bundled: true, publicWrite: false, expected: 'sandbox' },
			{ bundled: true, publicWrite: true, expected: 'wiki' },
		]

		for (const { bundled, publicWrite, expected } of modes) {
			const config = new EditorConfig({ bundled, publicWrite })
			const model = new EditorModel({ config }, { db })
			const result = await consumeGenerator(model.run())
			assert.equal(result.data.mode, expected, `bundled=${bundled} publicWrite=${publicWrite}`)
		}
	})

	it('21. host mode grants full permissions (canEdit, canDelete, canManageUsers)', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const config = new EditorConfig({ bundled: false })
		const model = new EditorModel({ config }, { db })
		const result = await consumeGenerator(model.run())
		assert.ok(result.data.permissions, 'Permissions should exist')
		assert.equal(result.data.permissions.canEdit, true, 'canEdit should be true in host mode')
		assert.equal(result.data.permissions.canDelete, true, 'canDelete should be true in host mode')
		assert.equal(result.data.permissions.canManageUsers, true, 'canManageUsers should be true in host mode')
	})

	it('22. sandbox mode denies edit/delete/manage to unauthenticated user', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: true, publicWrite: false }) }, { db })
		const result = await consumeGenerator(model.run())
		assert.equal(result.data.permissions.canEdit, false)
		assert.equal(result.data.permissions.canDelete, false)
		assert.equal(result.data.permissions.canManageUsers, false)
	})

	it('23. wiki mode allows edit but denies delete/manage', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: true, publicWrite: true }) }, { db })
		const result = await consumeGenerator(model.run())
		assert.equal(result.data.permissions.canEdit, true)
		assert.equal(result.data.permissions.canDelete, false)
		assert.equal(result.data.permissions.canManageUsers, false)
	})

	it('24. yields success log when editor is ready', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) }, { db })
		const events = await collectEvents(model.run())
		const successLog = events.find((e) => e.type === 'log' && e.level === 'success')
		assert.ok(successLog)
		assert.equal(successLog.message, EditorModel.UI.ready)
	})

	it('25. yields exactly 5 events for standalone mode (progress + log(info) + log(success) + show + ask)', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) }, { db })
		const events = await collectEvents(model.run())
		assert.equal(events.length, 5)
	})

	it('26. result.data.config is same instance as input config', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const config = new EditorConfig({ bundled: false, diffPreview: false })
		const model = new EditorModel({ config }, { db })
		const result = await consumeGenerator(model.run())
		assert.strictEqual(result.data.config, config)
		assert.equal(result.data.config.diffPreview, false)
	})

	it('27. initialContent is preserved in result', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const initialContent = { title: 'Hello', body: 'World' }
		const model = new EditorModel({ config: new EditorConfig(), initialContent }, { db })
		const result = await consumeGenerator(model.run())
		assert.deepStrictEqual(result.data.initialContent, initialContent)
	})

	it('28. session is set even when auth.app is absent (isAuthenticated=false)', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()
		const model = new EditorModel({ config: new EditorConfig() }, { db })
		const result = await consumeGenerator(model.run())
		assert.ok(result.data.session)
		assert.equal(result.data.session.isAuthenticated, false)
	})

	it('29. editor works without explicit options.db (no crash)', async () => {
		const model = new EditorModel({ config: new EditorConfig({ bundled: false }) })
		const result = await consumeGenerator(model.run())
		assert.equal(result.status, 'ok')
	})

	it('30. resolvePermissions: editor+moderator role gets canEdit but not canDelete', () => {
		const config = new EditorConfig({ bundled: true })
		const p = config.resolvePermissions({ isAuthenticated: true, roles: ['editor', 'moderator'] })
		assert.equal(p.canEdit, true)
		assert.equal(p.canDelete, false)
		assert.equal(p.canManageUsers, false)
	})

	it('31. resolvePermissions: empty roles gets no permissions in authenticated mode', () => {
		const config = new EditorConfig({ bundled: true, publicWrite: false })
		const p = config.resolvePermissions({ isAuthenticated: true, roles: [] })
		assert.equal(p.canEdit, false)
		assert.equal(p.canDelete, false)
	})
})
