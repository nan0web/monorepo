import { HygieneAuditor } from '../HygieneAuditor.js'
import { show, progress, result } from '@nan0web/ui'

/**
 * JS-specific hygiene auditor.
 * Checks package.json scripts and standard JS configs.
 */
export class JsHygieneAuditor extends HygieneAuditor {
	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		if (!this._.db) throw new Error('DB not found in context')
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t
		await this.init()

		yield progress(t(HygieneAuditor.UI.starting, { dir: this.dir }) || `Starting Hygiene Audit in ${this.dir}...`)

		/** @type {import('../../AuditorModel.js').AuditorError[]} */
		const errors = []

		// 1. Script audit
		yield progress(t(HygieneAuditor.UI.checking_scripts, {}) || 'Checking package scripts...')
		const pkgPath = this._.db.resolveSync(this.dir, 'package.json')
		/** @type {Record<string, any>} */
		const pkg = await this._.db.loadDocument(pkgPath).catch(() => ({})) || {}
		const scripts = pkg.scripts || {}
		const devDeps = pkg.devDependencies || {}
		let pkgChanged = false

		const required = [
			'test',
			'test:all',
			'build',
			'knip',
			'play',
			'test:docs',
			'test:release',
			'release:spec',
			'test:coverage',
		]

		/** @type {Record<string, string>} Mapping of scripts to required devDependencies */
		const scriptDeps = {
			knip: 'knip',
			'test:coverage': 'c8',
			build: 'typescript',
		}

		for (const script of required) {
			const fixValue = this._getSuggestedScript(script)
			const errorMsg = t(HygieneAuditor.UI.missing_script, { script }) || `Missing required script: ${script}`
			
			if (!scripts[script]) {
				if (this.fix && fixValue) {
					scripts[script] = fixValue
					pkgChanged = true
					yield show(t(HygieneAuditor.UI.fixing_script, { script }) || `Automatically added script: ${script}`, 'success')
				} else {
					errors.push({
						check: `scripts.${script}`,
						error: errorMsg,
						boundary: ['package.json'],
						context: ['package.json'],
						suggestion: fixValue ? `"${script}": "${fixValue}"` : undefined,
					})
					yield show(errorMsg, 'warn')
				}
			}

			// Dependency check for the script
			const dep = scriptDeps[script]
			if (dep && !devDeps[dep]) {
				const depError = `Missing devDependency: ${dep} (required for npm run ${script})`
				if (this.fix) {
					devDeps[dep] = 'latest'
					pkgChanged = true
					yield show(`Automatically added devDependency: ${dep}`, 'success')
				} else {
					errors.push({
						check: `devDependencies.${dep}`,
						error: depError,
						boundary: ['package.json'],
						context: ['package.json'],
						suggestion: `npm install -D ${dep}`,
					})
					yield show(depError, 'warn')
				}
			}
		}

		// test:all content validation
		if (scripts['test:all']) {
			const s = scripts['test:all']
			const missingParts = []
			if (!s.includes('test')) missingParts.push('test')
			if (!s.includes('build')) missingParts.push('build')
			if (!s.includes('knip')) missingParts.push('knip')

			if (missingParts.length > 0) {
				const errorMsg = t(HygieneAuditor.UI.incomplete_test_all, {
					missing: missingParts.join(', '),
				}) || `Incomplete test:all chain, missing: ${missingParts.join(', ')}`
				errors.push({
					check: 'scripts.test:all',
					error: errorMsg,
					boundary: ['package.json'],
					context: ['package.json'],
				})
				yield show(errorMsg, 'warn')
			}
		}

		const hasPrebuild = scripts.prebuild && scripts.prebuild.includes('rm -rf')
		if (!hasPrebuild) {
			const errorMsg = t(HygieneAuditor.UI.missing_prebuild, {}) || 'Missing prebuild cleanup (rm -rf dist types)'
			if (this.fix) {
				scripts.prebuild = 'rm -rf dist types'
				pkgChanged = true
				yield show('Automatically added prebuild script', 'success')
			} else {
				errors.push({
					check: 'scripts.prebuild',
					error: errorMsg,
					boundary: ['package.json'],
					context: ['package.json'],
					suggestion: '"prebuild": "rm -rf dist types"',
				})
				yield show(errorMsg, 'warn')
			}
		}

		if (pkgChanged) {
			pkg.scripts = scripts
			pkg.devDependencies = devDeps
			await this._.db.saveDocument(pkgPath, pkg)
		}

		// 2. Config audit
		yield progress(t(HygieneAuditor.UI.checking_configs, {}) || 'Checking config files...')
		const configs = ['tsconfig.json']
		const hasKnip = (await this.fileExists('knip.json')) || (await this.fileExists('knip.jsonc'))
		if (!hasKnip) configs.push('knip.json')

		for (const config of configs) {
			if (!(await this.fileExists(config))) {
				const errorMsg = t(HygieneAuditor.UI.missing_config, { file: config }) || `Missing config file: ${config}`

				if (this.fix) {
					const defaults =
						config === 'tsconfig.json'
							? {
									compilerOptions: { target: 'ESNext', module: 'ESNext', moduleResolution: 'node' },
								}
							: { $schema: 'https://unpkg.com/knip@5/schema.json', entry: ['src/index.js'] }

					await this._.db.saveDocument(this._.db.resolveSync(this.dir, config), defaults)
					yield show(t(HygieneAuditor.UI.fixing_config, { file: config }) || `Automatically added config: ${config}`, 'success')
				} else {
					errors.push({
						check: config,
						error: errorMsg,
						boundary: [config],
						context: ['package.json'],
					})
					yield show(errorMsg, 'warn')
				}
			}
		}

		if (!errors.some((e) => e.check === 'tsconfig.json' || e.check === 'knip.json')) {
			yield show(t(HygieneAuditor.UI.configs_ok, {}) || 'All config files present.', 'success')
		}

		const missingScripts = errors
			.filter((e) => e.check && e.check.startsWith('scripts.'))
			.map((e) => (e.check || '').replace('scripts.', ''))
		const missingConfigs = errors
			.filter(
				(e) =>
					e.check && (e.check.endsWith('.json') || (e.check.endsWith('.jsonc') && e.check !== 'package.json')),
			)
			.map((e) => e.check || '')

		return result({
			success: errors.length === 0,
			errors,
			scripts: { missing: missingScripts },
			configs: { missing: missingConfigs },
		})
	}

	/**
	 * Gets a suggested script content based on project structure.
	 * @param {string} script 
	 * @returns {string | null}
	 * @private
	 */
	_getSuggestedScript(script) {
		if (script === 'play') {
			return 'nan0cli --data play'
		} else if (script === 'test:docs') {
			return "node --test --test-timeout=3333 'src/docs/**/*.md.js' 'src/README.md.js'"
		} else if (script === 'test:coverage') {
			return 'c8 node --test'
		} else if (script === 'test:all') {
			return 'npm run build && npm run test && npm run knip'
		} else if (script === 'test') {
			return 'node --test'
		} else if (script === 'build') {
			return 'tsc'
		} else if (script === 'knip') {
			return 'knip'
		}
		return null
	}
}
