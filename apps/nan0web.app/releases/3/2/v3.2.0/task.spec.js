import test from 'node:test'
import assert from 'node:assert/strict'
import { AppRunner, NaN0WebConfig } from '../../../../src/runner.js'
import { DB } from '@nan0web/db'
import { ShellModel } from '@nan0web/ui'

test('Release v3.2.0: AppRunner works with @nan0web/db v3.4.0', async () => {
	const db = new DB({
		data: new Map([
			['nan0web.nan0', {
				name: 'MVP Test App',
				locale: 'uk',
				dsn: 'data/',
			}],
			['data/index.yaml', {
				pages: [
					{ slug: 'about', title: 'Про нас', layout: 'page' },
				],
			}],
		]),
	})

	const runner = new AppRunner({ db })
	const msgs = []
	for await (const msg of runner.run()) {
		msgs.push(msg)
	}

	assert.ok(msgs.some(m => m.includes('Engine Ready')), 'Runner should yield Engine Ready')
	assert.ok(runner.config instanceof NaN0WebConfig, 'Config should be typed NaN0WebConfig instance')
	assert.equal(runner.config.appName, 'MVP Test App', 'App name should match config')

	// Page resolution test
	const result = await runner.renderPage('/about')
	assert.ok(result.page !== null, 'Should resolve about page')
	assert.ok(Array.isArray(result.blocks), 'Should return content blocks array')

	await runner.stop()
})

test('Release v3.2.0: ShellModel configuration and options', () => {
	assert.ok(ShellModel.command, 'ShellModel should define command schema')
	assert.ok(Array.isArray(ShellModel.command.options), 'Options should be an array')
	
	const values = ShellModel.command.options.map(o => o.value)
	assert.ok(values.includes('run'), 'Should support run command')
	assert.ok(values.includes('build'), 'Should support build command')
	assert.ok(values.includes('cli'), 'Should support cli command')
})
