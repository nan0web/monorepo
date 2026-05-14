import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import AccessControl from './AccessControl.js'

const ACCESS = [
	'# Global access rules',
	'*          r    /login',
	'*          r    /register',
	'*          r    /course',
	'*          r    /economy',
	'*          r    /exit',
	'members    r    /dashboard',
	'members    r    /members',
	'members    r    /profile',
	'members    rw   /payment',
	'members    r    /logout',
	'admin      rwd  /admin',
].join('\n')

const GROUPS = ['# Groups', 'admin    sovr', 'members  sovr artem dmytro maria'].join('\n')

suite('AccessControl', () => {
	// ─── Tabular check() tests ──────────────────────

	const cases = [
		// Public access (*)
		['guest', 'r', '/course', true],
		['guest', 'r', '/economy', true],
		['guest', 'r', '/login', true],
		['guest', 'r', '/register', true],
		['guest', 'r', '/exit', true],
		['guest', 'r', '/dashboard', false],
		['guest', 'r', '/admin', false],
		['guest', 'r', '/profile', false],
		['guest', 'w', '/course', false],

		// Member access
		['artem', 'r', '/dashboard', true],
		['artem', 'r', '/members', true],
		['artem', 'r', '/profile', true],
		['artem', 'r', '/payment', true],
		['artem', 'w', '/payment', true],
		['artem', 'r', '/course', true],
		['artem', 'r', '/admin', false],
		['artem', 'w', '/admin', false],

		// Admin access
		['sovr', 'r', '/admin', true],
		['sovr', 'w', '/admin', true],
		['sovr', 'd', '/admin', true],
		['sovr', 'r', '/dashboard', true],
		['sovr', 'r', '/course', true],

		// Unknown user — only global rules
		['nobody', 'r', '/course', true],
		['nobody', 'r', '/dashboard', false],
		['nobody', 'r', '/admin', false],
	]

	describe('check()', () => {
		const ac = new AccessControl()
		ac.load(ACCESS, GROUPS)

		for (const [user, level, path, expected] of cases) {
			it(`${expected ? '✅' : '🚫'} ${user} ${level} ${path}`, () => {
				assert.equal(ac.check(user, path, level), expected)
			})
		}
	})

	// ─── info() ─────────────────────────────────────

	describe('info()', () => {
		it('returns rules and groups for admin user', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const { rules, groups } = ac.info('sovr')
			assert.deepEqual(groups, ['admin', 'members'])
			assert.ok(rules.length > 0)
			assert.ok(rules.some((r) => r.target === '/admin'))
		})

		it('returns rules and groups for member', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const { rules, groups } = ac.info('artem')
			assert.deepEqual(groups, ['members'])
			assert.ok(rules.some((r) => r.target === '/dashboard'))
			assert.ok(!rules.some((r) => r.subject === 'admin'))
		})

		it('returns only global rules for unknown user', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const { rules, groups } = ac.info('nobody')
			assert.deepEqual(groups, [])
			assert.ok(rules.every((r) => r.subject === '*'))
		})
	})

	// ─── filterNav() ────────────────────────────────

	describe('filterNav()', () => {
		const nav = [
			{ path: '/dashboard' },
			{ path: '/members' },
			{ path: '/profile' },
			{ path: '/login', guest: true },
			{ path: '/register', guest: true },
			{ path: '/payment' },
			{ path: '/course' },
			{ path: '/economy' },
			{ path: '/admin' },
			{ path: '/logout' },
			{ path: '/exit' },
		]

		it('guest sees public + guest items, not auth items', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const visible = ac.filterNav(nav, null)
			const paths = visible.map((n) => n.path)
			assert.ok(paths.includes('/course'), 'course visible')
			assert.ok(paths.includes('/economy'), 'economy visible')
			assert.ok(paths.includes('/login'), 'login visible')
			assert.ok(paths.includes('/register'), 'register visible')
			assert.ok(paths.includes('/exit'), 'exit visible')
			assert.ok(!paths.includes('/dashboard'), 'dashboard hidden')
			assert.ok(!paths.includes('/admin'), 'admin hidden')
			assert.ok(!paths.includes('/logout'), 'logout hidden')
		})

		it('member sees member items, not guest/admin items', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const visible = ac.filterNav(nav, 'artem')
			const paths = visible.map((n) => n.path)
			assert.ok(paths.includes('/dashboard'), 'dashboard visible')
			assert.ok(paths.includes('/course'), 'course visible')
			assert.ok(paths.includes('/logout'), 'logout visible')
			assert.ok(!paths.includes('/login'), 'login hidden')
			assert.ok(!paths.includes('/register'), 'register hidden')
			assert.ok(!paths.includes('/admin'), 'admin hidden')
		})

		it('admin sees everything except guest items', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			const visible = ac.filterNav(nav, 'sovr')
			const paths = visible.map((n) => n.path)
			assert.ok(paths.includes('/admin'), 'admin visible')
			assert.ok(paths.includes('/dashboard'), 'dashboard visible')
			assert.ok(paths.includes('/course'), 'course visible')
			assert.ok(!paths.includes('/login'), 'login hidden')
			assert.ok(!paths.includes('/register'), 'register hidden')
		})
	})

	// ─── Edge cases ─────────────────────────────────

	describe('edge cases', () => {
		it('empty input denies all', () => {
			const ac = new AccessControl()
			ac.load('', '')
			assert.equal(ac.check('anyone', '/anything', 'r'), false)
		})

		it('path normalization — adds leading /', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			assert.equal(ac.check('artem', 'dashboard', 'r'), true)
			assert.equal(ac.check('guest', 'course', 'r'), true)
		})

		it('user-specific rules (subject === username)', () => {
			const ac = new AccessControl()
			ac.load('artem r /special\n* r /public', '')
			assert.equal(ac.check('artem', '/special', 'r'), true)
			assert.equal(ac.check('anyone', '/special', 'r'), false)
			assert.equal(ac.check('anyone', '/public', 'r'), true)
		})

		it('trailing slash handling in target', () => {
			const ac = new AccessControl()
			ac.load('* r /admin/', '')
			assert.equal(ac.check('anyone', '/admin', 'r'), true)
			assert.equal(ac.check('anyone', '/admin/', 'r'), true)
			assert.equal(ac.check('anyone', '/admin/foo', 'r'), true)
			assert.equal(ac.check('anyone', '/admin-forbidden', 'r'), false)
		})

		it('prefix matching — /admin matches /admin/users', () => {
			const ac = new AccessControl()
			ac.load(ACCESS, GROUPS)
			assert.equal(ac.check('sovr', '/admin/users', 'r'), true)
			assert.equal(ac.check('artem', '/admin/users', 'r'), false)
		})

		it('ignores comment lines and empty lines', () => {
			const ac = new AccessControl()
			ac.load('# comment\n\n* r /public\n\n', '# groups\n\n')
			assert.equal(ac.check('x', '/public', 'r'), true)
		})

		it('ignores malformed lines', () => {
			const ac = new AccessControl()
			ac.load('onlyone\n* r /ok', '')
			assert.equal(ac.check('x', '/ok', 'r'), true)
		})

		it('static constants are correct', () => {
			assert.equal(AccessControl.ANY, '*')
			assert.equal(AccessControl.READ, 'r')
			assert.equal(AccessControl.WRITE, 'w')
			assert.equal(AccessControl.DELETE, 'd')
		})
	})
})
