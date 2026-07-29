import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'

/**
 * OlmuiThemingAuditor — Auditor for OLMUI theming standard compliance.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class OlmuiThemingAuditor extends AuditorModel {
	static alias = 'theming'

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
