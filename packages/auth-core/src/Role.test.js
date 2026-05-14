import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Role from './Role.js'

suite('Role', () => {
	describe('Static ROLES', () => {
		it('should contain expected role identifiers', () => {
			assert.deepEqual(Role.ROLES, {
				admin: 'a',
				author: 'r',
				moderator: 'm',
				user: 'u',
			})
		})
	})

	describe('from()', () => {
		it('should return same instance when given a Role', () => {
			const role = new Role({ value: 'admin' })
			assert.equal(Role.from(role), role)
		})

		it('should create Role from string name', () => {
			const role = Role.from('admin')
			assert.ok(role instanceof Role)
			assert.equal(role.toString(), 'a')
		})

		it('should create Role from string value', () => {
			const role = Role.from('m')
			assert.ok(role instanceof Role)
			assert.equal(role.toString(), 'm')
		})
	})

	describe('validateRoles()', () => {
		it('should throw if duplicate values exist', () => {
			class BadRole extends Role {
				static ROLES = {
					...Role.ROLES,
					duplicate: 'a',
				}
			}
			assert.throws(() => new BadRole({ value: 'admin' }), TypeError)
		})

		it('should throw if a role value contains a comma', () => {
			class CommaRole extends Role {
				static ROLES = {
					...Role.ROLES,
					bad: 'bad,role',
				}
			}
			assert.throws(() => new CommaRole({ value: 'bad' }), TypeError)
		})
	})
})
