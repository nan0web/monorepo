import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Release v1.1.0 Contract Tests (TDD Red)
 * Специфікація моделей Model-as-Schema, генерації команд nan0host,
 * CaddyServerAdapter та TrayBarAdapter (SwiftBar / Argos).
 */
describe('Release v1.1.0: nan0host Modular Config & TrayBar Contracts', () => {
	it('HostingConfig (Model-as-Schema) валідує та надає дефолти для hosting.nan0', async () => {
		const { HostingConfig } = await import('../../../../src/domain/HostingConfig.js')
		const cfg = new HostingConfig({
			server: { adapter: 'caddy', localSnippet: 'local_dev' },
			dns: { provider: 'dnsmasq' },
		})
		assert.equal(cfg.server.adapter, 'caddy')
		assert.equal(cfg.server.localSnippet, 'local_dev')
		assert.equal(cfg.paths.sitesAvailable, 'sites-available')
		assert.equal(cfg.paths.sitesEnabled, 'sites-enabled')
	})

	it('SiteConfig (Model-as-Schema) резолвить docker.dir та scripts без хардкоду', async () => {
		const { SiteConfig } = await import('../../../../src/domain/SiteConfig.js')
		const site = new SiteConfig({
			domain: 'admin.industrialbank.test',
			port: 4004,
			type: 'Payload CMS',
			dir: '/Users/i/src/nan.web/apps/3rdparty/industrialbank/cms',
			ssl: 'local',
			docker: {
				dir: '/Users/i/src/nan.web/apps/3rdparty/industrialbank',
				services: ['postgres'],
			},
			scripts: { dev: 'dev', start: 'start', build: 'build' },
		})

		assert.equal(site.domain, 'admin.industrialbank.test')
		assert.equal(site.port, 4004)
		assert.equal(site.dockerDir, '/Users/i/src/nan.web/apps/3rdparty/industrialbank')
		assert.deepEqual(site.dockerServices, ['postgres'])
		assert.equal(site.getScript('dev'), 'dev')
	})

	it('TrayBarAdapter генерує валідні команди nan0host та захищає рядки від зайвих "|"', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const output = TrayBarAdapter.render({
			envDir: '/Users/i/env',
			caddyRunning: true,
			dnsOk: true,
			sites: [
				{
					domain: 'admin.industrialbank.test',
					port: 4004,
					online: false,
					hasDocker: true,
					scripts: { dev: 'dev', start: 'start', build: 'build' },
				},
			],
		})

		const lines = output.trim().split('\n')
		for (const line of lines) {
			if (/^(-+\s+)?---$/.test(line)) continue
			const parts = line.split('|')
			assert.ok(parts.length <= 2, `Рядок містить більше одного "|": ${line}`)
		}

		assert.ok(
			output.includes('bash=nan0host param1=app param2=start-dev param3=4004 param4=--dir=/Users/i/env'),
			'Має генерувати виклик nan0host app start-dev',
		)
		assert.ok(
			output.includes('bash=nan0host param1=app param2=docker-up param3=4004 param4=--dir=/Users/i/env'),
			'Має генерувати виклик nan0host app docker-up',
		)

		const ukOutput = TrayBarAdapter.render(
			{ envDir: '/Users/i/env', caddyRunning: false, dnsOk: true, sites: [] },
			(tpl) => (tpl === TrayBarAdapter.UI.startProxy ? '▶ Запустити проксі' : tpl),
		)
		assert.ok(ukOutput.includes('▶ Запустити проксі'), 'Має підтримувати i18n функцію t()')
	})

	it('CaddyServerAdapter генерує _registry.caddy з local_dev для ssl: local', async () => {
		const { CaddyServerAdapter } = await import('../../../../src/adapters/CaddyServerAdapter.js')
		const adapter = new CaddyServerAdapter()
		const block = adapter.generateConfigBlock({
			domain: 'admin.industrialbank.test',
			proxy_port: 4004,
			ssl_provider: 'local',
			localSnippet: 'local_dev',
		})

		assert.ok(block.includes('import local_dev'))
		assert.ok(block.includes('reverse_proxy 127.0.0.1:4004'))
	})

	it('CaddyServerAdapter пропускає домени з ручних .caddy файлів при генерації _registry.caddy', async () => {
		const { CaddyServerAdapter } = await import('../../../../src/adapters/CaddyServerAdapter.js')
		const adapter = new CaddyServerAdapter()
		const output = adapter.generateRegistry(
			[
				{ domain: 'ipnews.test', port: 4001, ssl: 'local' },
				{ domain: 'industrialbank.test', port: 4003, ssl: 'local' },
			],
			{ manualContents: ['ipnews.test {\n\treverse_proxy 127.0.0.1:4001\n}'] },
		)

		assert.ok(!output.includes('ipnews.test {'))
		assert.ok(output.includes('industrialbank.test {'))
	})

	it('SystemAdapter ініціалізується для darwin та linux без хардкоду', async () => {
		const { SystemAdapter } = await import('../../../../src/adapters/SystemAdapter.js')
		const mac = new SystemAdapter({ platform: 'darwin' })
		const linux = new SystemAdapter({ platform: 'linux' })
		assert.equal(mac.platform, 'darwin')
		assert.equal(linux.platform, 'linux')
		assert.equal(mac.isPidAlive(process.pid), true)
		assert.equal(mac.isPidAlive(-1), false)
	})

	it('HostingApp підкоманди site, proxy sync та tray працюють на In-Memory @nan0web/db', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { SiteCommand } = await import('../../../../src/domain/commands/SiteCommand.js')
		const { ProxyCommand } = await import('../../../../src/domain/commands/ProxyCommand.js')
		const { TrayCommand } = await import('../../../../src/domain/commands/TrayCommand.js')

		const db = new DB({
			predefined: [
				['hosting.nan0', { server: { adapter: 'caddy', localSnippet: 'local_dev' } }],
				['sites-enabled/industrialbank.test.nan0', { domain: 'industrialbank.test', port: 4003, ssl: 'local', dir: '/tmp/bank' }],
			],
		})
		await db.connect()

		const mockSystem = {
			isPidAlive: () => false,
			getCaddyPids: async () => ['1234'],
			isDnsOk: async () => true,
			getPortPids: async () => [],
			refreshTray: () => {},
		}

		const runGen = async (cmd) => {
			const gen = cmd.run()
			let step = await gen.next()
			while (!step.done) step = await gen.next()
			return step.value?.data || step.value
		}

		const siteRes = await runGen(new SiteCommand({ action: 'list' }, { db }))
		assert.equal(siteRes.ok, true)
		assert.equal(siteRes.sites.length, 1)

		const syncRes = await runGen(new ProxyCommand({ action: 'sync' }, { db, system: mockSystem }))
		assert.equal(syncRes.ok, true)
		assert.equal(syncRes.count, 1)

		const trayRes = await runGen(new TrayCommand({ dir: '/Users/i/env', binMode: 'bin' }, { db, system: mockSystem }))
		assert.equal(trayRes.ok, true)
		assert.ok(trayRes.output.includes('industrialbank.test'))
		assert.ok(trayRes.output.includes('bash=nan0host param1=app param2=start-dev param3=4003 param4=--dir=/Users/i/env'))
	})

	it('resolves --dir correctly even when process cwd is / (SwiftBar context)', async () => {
		const { mkdtempSync, mkdirSync, rmSync } = await import('node:fs')
		const { spawnSync } = await import('node:child_process')
		const { resolve } = await import('node:path')
		const tmpDir = mkdtempSync('/tmp/nan0host-cwd-')
		try {
			mkdirSync(`${tmpDir}/sites-enabled`, { recursive: true })
			const binPath = resolve('bin/hosting.js')
			const res = spawnSync(process.execPath, [binPath, 'tray', `--dir=${tmpDir}`], {
				cwd: '/',
				encoding: 'utf8',
			})
			assert.equal(res.status, 0, res.stderr)
			assert.ok(res.stdout.includes('Active Domains:'), res.stdout)
		} finally {
			rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	it('ProxyCommand резолвить абсолютний шлях Caddyfile та передає cwd у caddy', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { ProxyCommand } = await import('../../../../src/domain/commands/ProxyCommand.js')

		const db = new DB({
			predefined: [
				['hosting.nan0', { server: { adapter: 'caddy', caddyfile: 'caddy/Caddyfile', sitesDir: 'caddy/sites' } }],
				['sites-enabled/app.test.nan0', { domain: 'app.test', port: 4001, ssl: 'local' }],
			],
		})
		await db.connect()

		const execCalls = []
		const mockSystem = {
			getCaddyPids: async () => [],
			exec: async (cmd, args, opts) => {
				execCalls.push({ cmd, args, opts })
				return { ok: true, stdout: '', stderr: '' }
			},
			refreshTray: () => {},
		}

		const cmd = new ProxyCommand({ action: 'start', dir: '/Users/i/env/api/sites' }, { db, system: mockSystem })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()

		assert.equal(step.value?.data?.ok ?? step.value?.ok, true)
		const validateCall = execCalls.find((c) => c.args[0] === 'validate')
		const startCall = execCalls.find((c) => c.args[0] === 'start')
		assert.equal(validateCall.args[2], '/Users/i/env/api/sites/caddy/Caddyfile')
		assert.equal(validateCall.opts?.cwd, '/Users/i/env/api/sites')
		assert.equal(startCall.args[2], '/Users/i/env/api/sites/caddy/Caddyfile')
		assert.equal(startCall.opts?.cwd, '/Users/i/env/api/sites')
	})

	it('ProxyCommand не дублює абсолютний шлях, якщо cfg.server.caddyfile вже абсолютний', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { ProxyCommand } = await import('../../../../src/domain/commands/ProxyCommand.js')

		const db = new DB({
			predefined: [
				['hosting.nan0', { server: { adapter: 'caddy', caddyfile: '/Users/i/env/api/sites/caddy/Caddyfile', sitesDir: 'caddy/sites' } }],
			],
		})
		await db.connect()

		const execCalls = []
		const mockSystem = {
			getCaddyPids: async () => [],
			exec: async (cmd, args, opts) => {
				execCalls.push({ cmd, args, opts })
				return { ok: true, stdout: '', stderr: '' }
			},
			refreshTray: () => {},
		}

		const cmd = new ProxyCommand({ action: 'validate', dir: '/Users/i/env/api/sites' }, { db, system: mockSystem })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()

		const validateCall = execCalls.find((c) => c.args[0] === 'validate')
		assert.equal(validateCall.args[2], '/Users/i/env/api/sites/caddy/Caddyfile')
		assert.equal(validateCall.opts?.cwd, '/Users/i/env/api/sites')
	})

	it('TrayBarAdapter підтримує binMode=bin та binMode=node з абсолютними шляхами', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const binOut = TrayBarAdapter.render({
			envDir: '/Users/i/env/api/sites',
			binPath: '/usr/local/bin/nan0host',
			binMode: 'bin',
			caddyRunning: false,
			dnsOk: true,
			sites: [],
		})
		assert.ok(binOut.includes('bash=/usr/local/bin/nan0host param1=proxy param2=start param3=--dir=/Users/i/env/api/sites'))

		const nodeOut = TrayBarAdapter.render({
			envDir: '/Users/i/env/api/sites',
			binPath: '/app/bin/hosting.js',
			nodePath: '/usr/local/bin/node',
			binMode: 'node',
			caddyRunning: false,
			dnsOk: true,
			sites: [],
		})
		assert.ok(nodeOut.includes('bash=/usr/local/bin/node param1=/app/bin/hosting.js param2=proxy param3=start param4=--dir=/Users/i/env/api/sites'))
	})

	it('TrayBarAdapter показує статус OrbStack (📡), помилки сайтів та View Logs', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const out = TrayBarAdapter.render({
			envDir: '/Users/i/env/api/sites',
			binPath: '/usr/local/bin/nan0host',
			caddyRunning: true,
			dnsOk: true,
			dockerRunning: false,
			logsDir: '/Users/i/env/api/sites/data/logs',
			proxyLog: '/Users/i/env/api/sites/data/logs/caddy-error.log',
			sites: [
				{
					domain: 'api.test',
					port: 4004,
					online: false,
					hasDocker: true,
					hasError: true,
					errorLog: '/Users/i/env/api/sites/data/logs/port-4004-error.log',
				},
			],
		})

		assert.ok(out.includes('🔴 OrbStack / Docker не запущений'))
		assert.ok(out.includes('📡 Запустити OrbStack | bash=/usr/bin/open param1=-a param2=OrbStack terminal=false refresh=true'))
		assert.ok(out.includes('❌ Error (див. логи)'))
		assert.ok(out.includes('-- 📄 View Logs | bash=/usr/bin/open param1=/Users/i/env/api/sites/data/logs/port-4004-error.log'))
		assert.ok(out.includes('📄 View Logs | bash=/usr/bin/open param1=/Users/i/env/api/sites/data/logs/caddy-error.log'))
	})

	it('AppCommand (docker-up) записує lock (⏳ Starting...), миттєво оновлює SwiftBar і прибирає lock після завершення', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { AppCommand } = await import('../../../../src/domain/commands/AppCommand.js')

		const db = new DB({
			predefined: [
				['hosting.nan0', { paths: { locks: 'data/locks', logs: 'data/logs', sitesEnabled: 'sites-enabled' } }],
				['sites-enabled/api.test.nan0', { domain: 'api.test', port: 4004, dir: '/tmp/api', docker: { dir: '/tmp/api', services: ['postgres'] } }],
				['/tmp/api/docker-compose.yml', 'services:\n  postgres:\n    image: postgres:16\n'],
			],
		})
		await db.connect()

		const events = []
		let lockDuringDocker = null
		const mockSystem = {
			ensureDocker: async () => {
				lockDuringDocker = await db.loadDocument('data/locks/port-4004.state', null)
				events.push('ensureDocker')
				return { ok: true }
			},
			notify: () => {},
			refreshTray: () => {
				events.push('refreshTray')
			},
		}

		const cmd = new AppCommand({ action: 'docker-up', target: '4004' }, { db, system: mockSystem })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()

		assert.equal(step.value?.data?.ok ?? step.value?.ok, true)
		assert.deepEqual(lockDuringDocker, {
			pid: process.pid,
			action: 'docker-up',
			step: 'docker',
			detail: 'Starting Docker...',
		})
		assert.equal(await db.loadDocument('data/locks/port-4004.state', null), null)
		assert.deepEqual(events, ['refreshTray', 'ensureDocker', 'refreshTray'])
	})

	it('AppCommand (start-dev / start-prod) записує lock (⏳ Starting...) та миттєво оновлює SwiftBar до запуску сервера', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { AppCommand } = await import('../../../../src/domain/commands/AppCommand.js')

		for (const action of ['start-dev', 'start-prod']) {
			const db = new DB({
				predefined: [
					['hosting.nan0', { paths: { locks: 'data/locks', logs: 'data/logs', sitesEnabled: 'sites-enabled' } }],
					['sites-enabled/api.test.nan0', { domain: 'api.test', port: 4004, dir: '/tmp/api' }],
				],
			})
			await db.connect()

			const events = []
			let lockDuringSpawn = null
			const mockSystem = {
				ensureDocker: async () => ({ ok: true }),
				stopPort: async () => {
					events.push('stopPort')
				},
				spawnDetached: async () => {
					lockDuringSpawn = await db.loadDocument('data/locks/port-4004.state', null)
					events.push('spawnDetached')
					return 9999
				},
				waitForPort: async () => true,
				notify: () => {},
				refreshTray: () => {
					events.push('refreshTray')
				},
			}

			const cmd = new AppCommand({ action, target: '4004' }, { db, system: mockSystem })
			const gen = cmd.run()
			let step = await gen.next()
			while (!step.done) step = await gen.next()

			assert.equal(step.value?.data?.ok ?? step.value?.ok, true)
			assert.deepEqual(lockDuringSpawn, {
				pid: process.pid,
				action,
				step: 'boot',
				detail: 'Starting server...',
			})
			assert.equal(await db.loadDocument('data/locks/port-4004.state', null), null, `${action}: lock має прибиратися`)
			assert.equal(events[0], 'refreshTray', `${action}: перший виклик має бути миттєвий refreshTray()`)
			assert.equal(events[events.length - 1], 'refreshTray', `${action}: фінальний виклик має бути refreshTray()`)
		}
	})

	it('TrayBarAdapter блокує кнопки запуску при isBusy, показує статус Docker та підтримує i18n', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const out = TrayBarAdapter.render(
			{
				envDir: '/Users/i/env',
				caddyRunning: true,
				dnsOk: true,
				sites: [
					{
						domain: 'api.test',
						port: 4004,
						online: false,
						hasDocker: true,
						dockerUp: true,
						isBusy: true,
						activeAction: 'start-prod',
						activeStep: 'boot',
						lockLabel: 'Starting server...',
					},
				],
			},
			(tpl) => (tpl === TrayBarAdapter.UI.inProgress ? '(в процесі...)' : tpl),
		)

		assert.ok(out.includes('🟡 api.test (: 4004) [⏳ Starting server...] | color=#f59e0b'))
		assert.ok(out.includes('-- 🐳 Docker: Running | color=#22c55e'))
		assert.ok(out.includes('-- 🚀 Start Prod Mode (в процесі...) | color=#888888'))
		assert.ok(!out.includes('bash=nan0host param1=app param2=start-prod'), 'Кнопка start-prod має бути неактивною під час isBusy')
		assert.ok(!out.includes('bash=nan0host param1=app param2=docker-up'), 'Кнопка docker-up має бути неактивною під час isBusy')
	})

	it('TrayBarAdapter рендерить окремий пункт для кожного лог-файлу з site.logFiles', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const out = TrayBarAdapter.render({
			envDir: '/Users/i/env/api/sites',
			caddyRunning: true,
			dnsOk: true,
			logsDir: '/Users/i/env/api/data/logs',
			sites: [
				{
					domain: 'admin.industrialbank.test',
					port: 4004,
					online: false,
					logFiles: [
						{ name: 'prod-4004.log', path: '/Users/i/env/api/data/logs/prod-4004.log' },
						{ name: 'dev-4004.log', path: '/Users/i/env/api/data/logs/dev-4004.log' },
					],
				},
			],
		})

		assert.ok(out.includes('-- 📄 View Logs (prod-4004.log) | bash=/usr/bin/open param1=/Users/i/env/api/data/logs/prod-4004.log terminal=false'))
		assert.ok(out.includes('-- 📄 View Logs (dev-4004.log) | bash=/usr/bin/open param1=/Users/i/env/api/data/logs/dev-4004.log terminal=false'))
	})

	it('TrayBarAdapter показує Docker Compose Down коли dockerUp=true', async () => {
		const { TrayBarAdapter } = await import('../../../../src/adapters/TrayBarAdapter.js')
		const out = TrayBarAdapter.render({
			envDir: '/Users/i/env/api/sites',
			caddyRunning: true,
			dnsOk: true,
			sites: [
				{
					domain: 'admin.industrialbank.test',
					port: 4004,
					online: false,
					hasDocker: true,
					dockerUp: true,
				},
			],
		})

		assert.ok(out.includes('-- 🐳 Docker: Running | color=#22c55e'))
		assert.ok(out.includes('-- 🐳 Docker Compose Down |'))
		assert.ok(out.includes('param2=docker-down'))
		assert.ok(!out.includes('-- 🐳 Docker Compose Up'))
	})

	it('AppCommand.startBackground передає абсолютний logFile відносно --dir незалежно від process.cwd()', async () => {
		const { default: DB } = await import('@nan0web/db')
		const { AppCommand } = await import('../../../../src/domain/commands/AppCommand.js')

		const db = new DB({
			predefined: [
				['hosting.nan0', { paths: { locks: 'data/locks', logs: 'data/logs', sitesEnabled: 'sites-enabled' } }],
				['sites-enabled/api.test.nan0', { domain: 'api.test', port: 4004, dir: '/tmp/api' }],
			],
		})
		await db.connect()
		// Simulate DBFS.resolveSync returning a relative URI instead of an absolute path
		db.resolveSync = (...parts) => parts.filter(Boolean).pop() || ''

		let capturedLogFile = ''
		const mockSystem = {
			ensureDocker: async () => ({ ok: true }),
			stopPort: async () => {},
			spawnDetached: async (_cmd, _args, opts) => {
				capturedLogFile = opts.logFile
				return 9999
			},
			waitForPort: async () => true,
			notify: () => {},
			refreshTray: () => {},
		}

		const cmd = new AppCommand({ action: 'start-prod', target: '4004', dir: '/Users/i/env/api/sites' }, { db, system: mockSystem })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()

		assert.equal(capturedLogFile, '/Users/i/env/api/sites/data/logs/prod-4004.log')
	})

	it('SystemAdapter.exec передає розширений PATH з ~/Library/pnpm та ~/homebrew/bin при мінімальному PATH', async () => {
		const { homedir } = await import('node:os')
		const { join } = await import('node:path')
		const { SystemAdapter } = await import('../../../../src/adapters/SystemAdapter.js')

		const sys = new SystemAdapter()
		const res = await sys.exec(process.execPath, ['-e', 'process.stdout.write(process.env.PATH || "")'], {
			env: { PATH: '/usr/bin:/bin:/usr/sbin:/sbin' },
		})

		assert.equal(res.ok, true)
		const parts = res.stdout.split(':')
		assert.ok(parts.includes(join(homedir(), 'Library/pnpm')), 'PATH має містити ~/Library/pnpm')
		assert.ok(parts.includes(join(homedir(), 'homebrew/bin')), 'PATH має містити ~/homebrew/bin')
		assert.ok(parts.includes(join(homedir(), '.orbstack/bin')), 'PATH має містити ~/.orbstack/bin')
	})
})
