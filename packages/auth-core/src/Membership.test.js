import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Membership from './Membership.js'
import Role from './Role.js'

suite('Membership', () => {
	describe('join() and can()', () => {
		it('should allow joining a group with permissions', () => {
			const mem = new Membership()
			mem.join('teamX', 'moderator', new Set(['r', 'w']), {})
			assert.ok(mem.can('teamX', 'r'))
			assert.ok(mem.can('teamX', 'w'))
			assert.equal(mem.can('teamX', 'd'), false)
		})

		it('admin role bypasses permission checks', () => {
			const mem = new Membership()
			mem.join('admins', 'admin', new Set(), {})
			assert.ok(mem.can('admins', '*'))
		})
	})

	describe('mintDailyCoins()', () => {
		it('should add dailyCoins to wallet when config provides it', () => {
			const mem = new Membership()
			mem.join('gamers', 'user', new Set(['r']), { dailyCoins: 25 })
			mem.mintDailyCoins('gamers')
			const inner = mem.memberships.get('gamers')
			assert.equal(inner?.config.wallet, 25n)

			// Mint again accumulates
			mem.mintDailyCoins('gamers')
			assert.equal(inner?.config.wallet, 50n)
		})

		it('should do nothing if dailyCoins not defined', () => {
			const mem = new Membership()
			mem.join('free', 'user', new Set(['r']), {})
			mem.mintDailyCoins('free')
			const inner = mem.memberships.get('free')
			assert.equal(inner?.config.wallet, undefined)
		})
	})

	describe('toObject()', () => {
		it('should serialize memberships array correctly', () => {
			const mem = new Membership()
			mem.join('group1', 'moderator', new Set(['r']), { dailyCoins: 5 })
			const obj = mem.toObject()
			assert.ok(Array.isArray(obj.memberships))
			const grp = obj.memberships.find((m) => m.key === 'group1')
			assert.ok(grp)
			assert.equal(grp.role.value, Role.ROLES.moderator)
			assert.deepEqual(Array.from(grp.perms), ['r'])
			assert.deepEqual(grp.config, { dailyCoins: 5 })
		})
	})
})
