import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'

export default class DepsCommand extends ModelAsApp {
	static fix = {
		help: 'Apply fixes automatically',
		default: false,
	}
	static latest = {
		help: 'Update @nan0web packages to the latest available versions',
		default: false,
	}
	static UI = {
		title: 'deps',
		help: 'Dependencies manager',
	}

	/**
	 * @param {Partial<DepsCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Apply fixes automatically */ this.fix
		/** @type {boolean} Update packages to the latest available versions */ this.latest
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = /** @type {any} */ (this._)
		const pkg = await db.loadDocument('package.json', {})
		yield show(t('Loaded package.json, {bytes} bytes', { bytes: JSON.stringify(pkg).length }))

		const deps = {
			devDependencies: pkg?.devDependencies ?? {},
			dependencies: pkg?.dependencies ?? {},
			peerDependencies: pkg?.peerDependencies ?? {},
		}
		const fixes = new Map()
		const fails = new Set()

		const isLocal = (ver) =>
			['workspace:', 'link:'].some((p) => String(ver).toLowerCase().startsWith(p))

		const changes = new Map()

		for (const [group, map] of Object.entries(deps)) {
			yield show(t('{group} ({count} items)', { group, count: Object.keys(map).length }))
			for (const [dep, ver] of Object.entries(map ?? {})) {
				if (isLocal(ver) || this.latest) {
					const resultSpawn = await runSpawn('npm', ['info', dep, '--json'])
					if (resultSpawn.code !== 0) {
						throw new Error(t('Cannot retrieve npm package info'))
					}
					try {
						const data = JSON.parse(resultSpawn.text)
						if (data.version) {
							fixes.set(dep, data.version)
							yield show(t('  {dep}: {ver} → {version}', { dep, ver, version: data.version }), 'warn')
						} else {
							fails.add(dep)
							yield show(t('  {dep}: 404 — not found', { dep }), 'error')
						}
					} catch (err) {
						yield show(String(err), 'error')
					}
				} else {
					yield show(t('  {dep}: {ver}', { dep, ver }), 'success')
				}
			}
		}

		if (fails.size) {
			throw new Error(t('Some dependencies are not yet published on npm: {list}', { list: [...fails].join(', ') }))
		}

		if ((this.fix || this.latest) && fixes.size) {
			for (const [dep, ver] of fixes) {
				const args = ['install']
				if (pkg.devDependencies?.[dep]) {
					pkg.devDependencies[dep] = ver
					args.push('--save-dev')
				}
				if (pkg.dependencies?.[dep]) pkg.dependencies[dep] = ver
				args.push(dep + '@latest')
				if (this.latest) {
					yield show(t('Installing dependency...'))
					await runSpawn('npm', args)
				}
				changes.set(dep, `${dep}: ${ver}`)
				yield show(t('Fixed {dep} → {ver}', { dep, ver }), 'success')
			}
			await db.saveDocument('package.json', pkg)
			yield show(t('Fixes saved ({count} changes)', { count: changes.size }), 'success')
			yield show(t('Dependencies fixed'))
		} else {
			yield show(t('Run with --fix to apply {count} available fixes', { count: fixes.size }))
			yield show(t('Dependencies check completed'))
		}
		return result({})
	}
}
