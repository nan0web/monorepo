import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'

/**
 * OlmuiThemingAuditor — Auditor for OLMUI theming standard compliance.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class OlmuiThemingAuditor extends AuditorModel {
	static alias = 'theming'

	/** @type {string[]} Directories to ignore during scanning */
	static IGNORE_DIRS = [
		'node_modules',
		'.git',
		'.next',
		'.next-playwright',
		'.venv',
		'.datasets',
		'dist',
		'build',
		'coverage',
		'types',
		'play',
		'test',
		'tests',
		'playwright-report',
		'test-results',
	]

	/** @type {(string | RegExp)[]} Files or paths to ignore (e.g. Payload CMS / admin components, tests, setup) */
	static IGNORE_PATTERNS = [
		/\/components\/(BooleanCell|Logo|MapCell|Icon|ImageCell)\.(tsx|jsx|js|ts)$/,
		/cms\/src\/components\//,
		/\.test\.(js|jsx|ts|tsx)$/,
		/\.spec\.(js|jsx|ts|tsx)$/,
		/vitest\.setup\.(js|ts|mts)$/,
		/\/tests\//,
		/test-[^/]+\.(js|ts)$/,
	]

	/**
	 * Checks if a directory or file path should be ignored by theming audit.
	 * @param {string} path
	 * @returns {boolean}
	 */
	static isIgnored(path) {
		const name = path.split('/').pop() || path
		if (name.startsWith('.') || OlmuiThemingAuditor.IGNORE_DIRS.includes(name)) {
			return true
		}
		for (const pattern of OlmuiThemingAuditor.IGNORE_PATTERNS) {
			if (typeof pattern === 'string' && path.includes(pattern)) return true
			if (pattern instanceof RegExp && pattern.test(path)) return true
		}
		return false
	}

	static dir = {
		type: 'string',
		help: 'Target directory to scan for styling compliance',
		positional: true,
		default: '.',
	}

	static UI = {
		title: 'OLMUI Theming Auditor',
		description: 'Checks UI styles for hardcoded values (colors, measurements, layouts) and enforces theme variable usage.',
		icon: '🎨',
		starting: 'Auditing styling in {dir}',
		noFiles: 'No styling files found to audit in {dir}',
		doneSuccess: 'All files passed the theming audit (0% hardcode).',
		doneErrors: 'Theming audit failed. Hardcoded design tokens found!',
		auditPassed: 'Audit passed: {file}',
		auditFailed: 'Audit failed for {file}: {errors}',
		errorDb: 'Database not provided to auditor',
		errorColor: 'Hardcoded color "{match}" found without theme variable',
		errorSize: 'Hardcoded size/spacing "{match}" found without theme variable',
	}

	/**
	 * Run the theming audit, delegating to the appropriate platform subclass.
	 * @returns {AsyncGenerator<import('../../core/Intent.js').Intent, import('../../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		const AuditorClass = this.platform === 'python'
			? (await import('./PyOlmuiThemingAuditor.js')).PyOlmuiThemingAuditor
			: (await import('./JsOlmuiThemingAuditor.js')).JsOlmuiThemingAuditor

		const delegate = new (/** @type {any} */ (AuditorClass))({
			dir: /** @type {any} */ (this).dir,
			fix: /** @type {any} */ (this).fix,
			platform: /** @type {any} */ (this).platform,
		}, /** @type {any} */ (this)._)
		
		return yield* delegate.run()
	}
}

export default OlmuiThemingAuditor
