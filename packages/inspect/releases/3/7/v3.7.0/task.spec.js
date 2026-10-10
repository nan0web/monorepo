import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { Model, ModelError } from '@nan0web/types'
import { InspectConfig } from '../../../../src/domain/config/InspectConfig.js'
import { ArchitectureAuditor } from '../../../../src/domain/app/ArchitectureAuditor.js'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'

describe('Release v3.7.0: Typed InspectConfig Model & Cascading Configuration Resolution', () => {
	describe('§1 InspectConfig Model-as-Schema v2 Contract', () => {
		it('extends Model from @nan0web/types', () => {
			const config = new InspectConfig()
			assert.ok(config instanceof Model)
			assert.ok(config instanceof InspectConfig)
		})

		it('has default values for skip, theming, snapshots and rules', () => {
			const config = new InspectConfig()
			assert.deepEqual(config.skip, [])
			assert.deepEqual(config.theming, { ignorePatterns: [], ignoreDirs: [] })
			assert.deepEqual(config.snapshots, { optional: false, allowEmpty: false, dir: 'snapshots/core' })
			assert.deepEqual(config.rules, {})
		})

		it('initializes with custom parameters', () => {
			const config = new InspectConfig({
				skip: ['snapshots', 'phase'],
				theming: {
					ignoreDirs: ['dist', 'custom-build'],
					ignorePatterns: ['/custom-comp/'],
				},
				snapshots: {
					optional: true,
					allowEmpty: true,
					dir: 'custom/snaps',
				},
				rules: {
					exportDefault: false,
					requirePrebuild: false,
				},
			})

			assert.deepEqual(config.skip, ['snapshots', 'phase'])
			assert.equal(config.theming.ignoreDirs.includes('custom-build'), true)
			assert.equal(config.snapshots.optional, true)
			assert.equal(config.snapshots.dir, 'custom/snaps')
			assert.equal(config.rules.exportDefault, false)
		})

		it('validates schema using Model.prototype.validate()', () => {
			const validConfig = new InspectConfig({
				skip: ['snapshots'],
				theming: { ignoreDirs: ['temp'] },
			})
			assert.equal(validConfig.validate(), true)

			const invalidConfig = new InspectConfig({
				skip: 'not-an-array',
			})
			assert.throws(() => invalidConfig.validate(), ModelError)
		})
	})

	describe('§2 Cascading Configuration Resolution (InspectConfig.load via DB)', () => {
		it('returns default config when no config files exist', async () => {
			const db = new DB({ predefined: [] })
			await db.connect()

			const config = await InspectConfig.load(db, 'apps/demo')
			assert.ok(config instanceof InspectConfig)
			assert.deepEqual(config.skip, [])
			assert.deepEqual(config.rules, {})
		})

		it('loads project-level inspect.config.nan0', async () => {
			const db = new DB({
				predefined: [
					[
						'apps/my-app/inspect.config.nan0',
						`skip:
  - snapshots
snapshots:
  optional: true
rules:
  exportDefault: false
`,
					],
				],
			})
			await db.connect()

			const config = await InspectConfig.load(db, 'apps/my-app')
			assert.ok(config instanceof InspectConfig)
			assert.deepEqual(config.skip, ['snapshots'])
			assert.equal(config.snapshots.optional, true)
			assert.equal(config.rules.exportDefault, false)
		})

		it('cascades and deep-merges global -> root -> project configurations', async () => {
			const db = new DB({
				predefined: [
					// 1. Global config (~/.nan0web/inspect/config.nan0)
					[
						'~/.nan0web/inspect/config.nan0',
						`skip:
  - hygiene
theming:
  ignoreDirs:
    - .cache
rules:
  exportDefault: true
`,
					],
					// 2. Repo root config (<repo_root>/inspect.config.nan0)
					[
						'inspect.config.nan0',
						`skip:
  - phase
theming:
  ignoreDirs:
    - coverage
rules:
  exportDefault: false
  requirePrebuild: true
`,
					],
					// 3. Project config (<target_dir>/inspect.config.nan0)
					[
						'apps/bank/cms/inspect.config.nan0',
						`skip:
  - snapshots
theming:
  ignorePatterns:
    - /admin/
snapshots:
  optional: true
`,
					],
				],
			})
			await db.connect()

			const config = await InspectConfig.load(db, 'apps/bank/cms')

			// Array skip merged (hygiene, phase, snapshots)
			assert.ok(config.skip.includes('hygiene'))
			assert.ok(config.skip.includes('phase'))
			assert.ok(config.skip.includes('snapshots'))

			// Object theming deep merged
			assert.ok(config.theming.ignoreDirs.includes('.cache'))
			assert.ok(config.theming.ignoreDirs.includes('coverage'))
			assert.ok(config.theming.ignorePatterns.includes('/admin/'))

			// Rules overridden by project/root
			assert.equal(config.rules.exportDefault, false)
			assert.equal(config.rules.requirePrebuild, true)
			assert.equal(config.snapshots.optional, true)
		})

		it('supports .yaml and .js extensions for config files', async () => {
			const db = new DB({
				predefined: [
					[
						'inspect.config.yaml',
						`skip:
  - verification
`,
					],
					[
						'apps/sub/inspect.config.js',
						`export default {
  snapshots: {
    optional: true
  }
}
`,
					],
				],
			})
			await db.connect()

			const config = await InspectConfig.load(db, 'apps/sub')
			assert.ok(config.skip.includes('verification'))
			assert.equal(config.snapshots.optional, true)
		})
	})

	describe('§3 Integration in ArchitectureAuditor & InspectorApp', () => {
		it('ArchitectureAuditor respects config.skip and injects auditor options', async () => {
			const db = new DB({
				predefined: [
					['package.json', { name: 'test-app', version: '1.0.0' }],
					[
						'inspect.config.nan0',
						`skip:
  - snapshots
  - phase
snapshots:
  optional: true
`,
					],
				],
			})
			await db.connect()

			const auditor = new ArchitectureAuditor({ dir: '.' }, { db })
			// Test config loading and auditor filtering
			const config = await InspectConfig.load(db, '.')
			auditor.config = config

			assert.ok(auditor.config.skip.includes('snapshots'))
			assert.ok(auditor.config.skip.includes('phase'))
		})

		it('InspectorApp loads InspectConfig automatically in init()', async () => {
			const db = new DB({
				predefined: [
					['package.json', { name: 'test-pkg', version: '1.0.0' }],
					[
						'apps/test-pkg/inspect.config.nan0',
						`skip:
  - snapshots
`,
					],
				],
			})
			await db.connect()

			const app = new InspectorApp({ dir: 'apps/test-pkg' }, { db })
			await app.init()

			assert.ok(app.config instanceof InspectConfig)
			assert.ok(app.config.skip.includes('snapshots'))
		})
	})

	describe('§4 include whitelist & modules configuration', () => {
		it('supports include whitelist and modules schema on InspectConfig', () => {
			const config = new InspectConfig({
				include: ['domain', 'circular', 'theming'],
				modules: {
					exports: { exportDefault: false },
					theming: { ignoreDirs: ['.next'] },
					snapshots: { optional: true, dir: 'snapshots/core' },
				},
			})

			assert.deepEqual(config.include, ['domain', 'circular', 'theming'])
			assert.equal(config.modules.exports.exportDefault, false)
			assert.deepEqual(config.modules.theming.ignoreDirs, ['.next'])
			assert.equal(config.modules.snapshots.optional, true)
		})

		it('filters auditors strictly by config.include if specified', async () => {
			const db = new DB({
				predefined: [
					['package.json', { name: 'include-app', version: '1.0.0' }],
					[
						'inspect.config.nan0',
						`include:
  - domain
  - circular
`,
					],
				],
			})
			await db.connect()

			const auditor = new ArchitectureAuditor({ dir: '.' }, { db })
			const config = await InspectConfig.load(db, '.')
			auditor.config = config

			assert.deepEqual(auditor.config.include, ['domain', 'circular'])

			const gen = auditor.run()
			let last = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					last = step.value
					break
				}
			}

			// ArchitectureAuditor returns individual auditor scores in data
			const data = last?.data || {}
			assert.ok('domain' in data)
			assert.ok('circular' in data)
			assert.ok(!('hygiene' in data))
			assert.ok(!('exports' in data))
		})
	})

	describe('§5 Test Style Audit & Performance Anti-Pattern Scanning', () => {
		it('detects flat test() calls and enforces describe/it in JsVerificationAuditor', async () => {
			const { JsVerificationAuditor } = await import('../../../../src/domain/app/js/JsVerificationAuditor.js')
			const db = new DB({
				predefined: [
					['play/.gitkeep', ''],
					['src/README.md.js', ''],
					[
						'src/bad.test.js',
						`import test from 'node:test'
test('flat test without describe', () => {})
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsVerificationAuditor({ dir: '.' }, { db })
			const gen = auditor.run()
			let res = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					res = step.value
					break
				}
			}

			const errors = res?.data?.errors || []
			const testStyleError = errors.find((e) => e.check === 'test_style')
			assert.ok(testStyleError, 'Should report test_style error for flat test()')
		})

		it('flags RegExp replaces inside string transformations in JsDomainAuditor', async () => {
			const { JsDomainAuditor } = await import('../../../../src/domain/app/js/JsDomainAuditor.js')
			const db = new DB({
				predefined: [
					[
						'src/domain/Transformer.js',
						`export class Transformer {
	parse(lines) {
		return lines.map(l => l.replace(/^#\\s?/, ''))
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db })
			const errors = []
			const gen = auditor.checkPlatformDomain(errors, (k) => k)
			while (true) {
				const step = await gen.next()
				if (step.done) break
			}

			const regexSmell = errors.find((e) => e.check === 'regex_in_loop')
			assert.ok(regexSmell, 'Should detect regex in loop anti-pattern')
		})
	})
})
