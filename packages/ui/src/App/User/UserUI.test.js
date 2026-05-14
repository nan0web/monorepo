import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UserApp from './UserApp.js'
import UserUI from './UserUI.js'
import View from '../../View/View.js'

describe('UserUI', () => {
	it.skip('should convert input with user.name to commands', () => {
		// @todo there could not be args, opts in UI, it must be moved to UI-CLI
		const app = new UserApp()
		const view = new View()
		const ui = new UserUI(app, view)

		const commands = ui.convertInput('setUser --user Bob welcome')
		assert.equal(commands.length, 1)
		assert.equal(commands[0].args[0], 'setUser')
		assert.equal(commands[0].args[1], 'welcome')
		assert.equal(commands[0].opts.user, 'Bob')
	})

	it.skip('should convert input without user.name to askUserName command', () => {
		const app = new UserApp()
		const view = new View()
		const ui = new UserUI(app, view)

		const commands = ui.convertInput('')
		assert.equal(commands.length, 1)
		// @todo there could not be args, opts in UI, it must be moved to UI-CLI
		assert.equal(commands[0].args.length, 0)
		assert.equal(commands[0].opts.user, '')
	})
})
