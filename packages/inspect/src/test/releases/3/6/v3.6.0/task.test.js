import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { ModuleRegistry } from '../../../../../domain/modules/ModuleRegistry.js'
import { ModuleItem } from '../../../../../domain/modules/ModuleItem.js'

describe('Release v3.6.0: Module Registry, Canonical UI Tags & Fluent Batch Updates', () => {
	describe('§1 Canonical UI Tags Determination (m.ui)', () => {
		it('identifies ui tags strictly from package.json exports', () => {
			const pkgReact = {
				name: '@scope/any-widget',
				exports: {
					'.': './src/index.js',
					'./ui/react': './src/ui/react/index.jsx',
				},
			}
			const modReact = new ModuleItem({ dir: 'packages/widget', pkg: pkgReact })
			assert.deepEqual(modReact.ui, ['ui-react'])

			const pkgMulti = {
				name: '@scope/multi-component',
				exports: {
					'.': './src/index.js',
					'./ui/lit': './src/ui/lit/index.js',
					'./ui/cli': './src/ui/cli/index.js',
				},
			}
			const modMulti = new ModuleItem({ dir: 'packages/multi', pkg: pkgMulti })
			assert.ok(modMulti.ui.includes('ui-lit'))
			assert.ok(modMulti.ui.includes('ui-cli'))
			assert.equal(modMulti.ui.length, 2)
		})

		it('identifies ui tag from canonical package name fallback (@nan0web/ui-*)', () => {
			const pkg = {
				name: '@nan0web/ui-react',
				exports: {
					'.': './src/index.js',
				},
			}
			const mod = new ModuleItem({ dir: 'packages/ui-react', pkg })
			assert.deepEqual(mod.ui, ['ui-react'])
		})

		it('returns empty ui array if no exports or canonical name matches, warning if deps exist', () => {
			const pkg = {
				name: '@nan0web/some-lib',
				dependencies: { react: '^18.0.0' },
				exports: {
					'.': './src/index.js',
				},
			}
			const mod = new ModuleItem({ dir: 'packages/some-lib', pkg })
			assert.deepEqual(mod.ui, [])
			assert.ok(mod.warnings.some((w) => w.includes("lacks canonical './ui/react' export")))
		})
	})

	describe('§2 ModuleRegistry Scanning via In-Memory DB', () => {
		it('scans specified zones (packages, apps, apps/3rdparty) and creates registry', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/core/package.json',
						{
							name: '@nan0web/core',
							version: '1.0.0',
							exports: { '.': './src/index.js' },
						},
					],
					[
						'packages/ui-web/package.json',
						{
							name: '@nan0web/ui-web',
							version: '1.1.0',
							exports: { '.': './src/index.js', './ui/web': './src/web.js' },
						},
					],
					[
						'apps/web-app/package.json',
						{
							name: 'web-app',
							version: '0.1.0',
							exports: { './ui/react': './src/App.jsx' },
						},
					],
					[
						'apps/3rdparty/partner/package.json',
						{
							name: 'partner-app',
							version: '2.0.0',
							exports: { './ui/lit': './src/element.js' },
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({
				db,
				zones: ['packages', 'apps', 'apps/3rdparty'],
			})
			assert.equal(registry.items.length, 4)

			const pkgs = registry.byZone('packages')
			assert.equal(pkgs.length, 2)
			assert.equal(pkgs[0].name, '@nan0web/core')

			const apps = registry.byZone('apps')
			assert.equal(apps.length, 1)
			assert.equal(apps[0].name, 'web-app')

			const thirdParty = registry.byZone('apps/3rdparty')
			assert.equal(thirdParty.length, 1)
			assert.equal(thirdParty[0].name, 'partner-app')
		})
	})

	describe('§3 Fluent API Batch Manipulations (updatePackage, replaceValue, etc.)', () => {
		it('filters modules and applies updatePackage on scripts', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/react-box/package.json',
						{
							name: '@nan0web/react-box',
							version: '1.0.0',
							exports: { './ui/react': './src/Box.jsx' },
							scripts: { test: 'node --test' },
						},
					],
					[
						'packages/core/package.json',
						{
							name: '@nan0web/core',
							version: '1.0.0',
							exports: { '.': './src/index.js' },
							scripts: { test: 'node --test' },
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({ db, zones: ['packages'] })
			const reactMods = registry.filter((m) => m.ui.includes('ui-react'))

			assert.equal(reactMods.items.length, 1)
			assert.equal(reactMods.items[0].name, '@nan0web/react-box')

			reactMods.updatePackage('scripts', (scripts) => ({
				...scripts,
				'build:types': 'tsc -p tsconfig.json --emitDeclarationOnly',
			}))

			// Before save, internal state changed
			assert.equal(
				reactMods.items[0].pkg.scripts['build:types'],
				'tsc -p tsconfig.json --emitDeclarationOnly'
			)

			// Save to DB
			await reactMods.save()

			const savedPkg = await db.loadDocument('packages/react-box/package.json')
			assert.equal(savedPkg.scripts['build:types'], 'tsc -p tsconfig.json --emitDeclarationOnly')
			assert.equal(savedPkg.scripts.test, 'node --test')

			// Untouched module unchanged
			const corePkg = await db.loadDocument('packages/core/package.json')
			assert.equal(corePkg.scripts['build:types'], undefined)
		})

		it('applies replaceValue with dot-notation path', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/mod/package.json',
						{
							name: '@nan0web/mod',
							version: '1.0.0',
							engines: { node: '>=18.0.0' },
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({ db, zones: ['packages'] })
			registry.replaceValue('engines.node', '>=20.0.0')
			await registry.save()

			const saved = await db.loadDocument('packages/mod/package.json')
			assert.equal(saved.engines.node, '>=20.0.0')
		})

		it('applies setPackage and deleteKey', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/mod/package.json',
						{
							name: '@nan0web/mod',
							version: '1.0.0',
							legacyField: 'delete-me',
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({ db, zones: ['packages'] })
			registry.setPackage({ license: 'ISC' })
			registry.deleteKey('legacyField')
			await registry.save()

			const saved = await db.loadDocument('packages/mod/package.json')
			assert.equal(saved.license, 'ISC')
			assert.equal(saved.legacyField, undefined)
		})
	})

	describe('§4 Index Generation (modules.csv/csv0 and index.md)', () => {
		it('generates compact CSV0 format with FrontMatter and 0/1 boolean representation', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/ui-cli/package.json',
						{
							name: '@nan0web/ui-cli',
							version: '1.2.0',
							exports: { './ui/cli': './src/index.js' },
							private: false,
						},
					],
					[
						'packages/internal/package.json',
						{
							name: '@nan0web/internal',
							version: '0.1.0',
							exports: { '.': './src/index.js' },
							private: true,
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({ db, zones: ['packages'] })
			const csv0 = registry.toCsv0('packages')

			assert.ok(csv0.includes('---'))
			assert.ok(csv0.includes('columns:'))
			assert.ok(csv0.includes('private: boolean'))
			assert.ok(csv0.includes('version: @nan0web/version'))
			assert.ok(csv0.includes('name,dir,version,ui,profile,private'))
			assert.ok(csv0.includes('@nan0web/ui-cli,packages/ui-cli,1.2.0,ui-cli,node,0'))
			assert.ok(csv0.includes('@nan0web/internal,packages/internal,0.1.0,,node,1'))
		})

		it('generates structured Markdown index and writes to disk via DB', async () => {
			const db = new DB({
				predefined: [
					[
						'packages/ui-cli/package.json',
						{
							name: '@nan0web/ui-cli',
							version: '1.2.0',
							exports: { './ui/cli': './src/index.js' },
						},
					],
				],
			})
			await db.connect()

			const registry = await ModuleRegistry.create({ db, zones: ['packages'] })
			const md = registry.toMarkdown('packages')

			assert.ok(md.includes('# Packages Index'))
			assert.ok(
				md.includes('| `@nan0web/ui-cli` | `packages/ui-cli` | `1.2.0` | `ui-cli` | `node` |')
			)

			await registry.writeIndexes()

			const writtenMd = await db.loadDocument('packages/index.md')
			assert.ok(writtenMd.includes('# Packages Index'))

			const writtenCsv = await db.loadDocument('packages/modules.csv')
			assert.ok(writtenCsv.includes('@nan0web/ui-cli'))
		})
	})
})
