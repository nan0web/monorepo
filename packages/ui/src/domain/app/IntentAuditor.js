import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { result } from '../../core/Intent.js'
import { JsIntentAuditor } from './JsIntentAuditor.js'
import { PyIntentAuditor } from './PyIntentAuditor.js'

/**
 * IntentAuditor — Base model for OLMUI Intent hygiene audits.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class IntentAuditor extends AuditorModel {
	static alias = 'intents'

	static dir = {
		type: 'string',
		help: 'Target directory to scan for output hygiene',
		positional: true,
		default: 'src',
	}

	static UI = {
		title: 'OLMUI Intent Hygiene Audit',
		description: 'Validates code files to ensure raw console statements are purged and proper yield intents are used.',
		icon: '📡',
		starting: 'Scanning {dir} for intent and output hygiene...',
		auditPassed: 'Hygiene OK: {file}',
		auditFailed: 'Hygiene Leak in {file}: {errors}',
		doneSuccess: 'Pristine output hygiene! Zero leaks found.',
		doneErrors: 'Intent hygiene audit failed with errors. Check above.',

		errorDb: 'Database not provided to auditor',
		errorConsoleLeak: 'Line {line}: Found direct system write "{match}" (violates OLMUI/TLI isolation, use yield show | log | ask).',
		errorProcessLeak: 'Line {line}: Found direct process write "{match}" (violates total logic isolation, use yield intents).',
		errorPrintLeak: 'Line {line}: Found direct print statement "{match}" (violates Python TLI isolation, use yield intents).',
		errorSysWriteLeak: 'Line {line}: Found direct system stream write "{match}" (violates Python TLI isolation).',
	}

	/**
	 * Run the intent audit, delegating to the appropriate platform subclass.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const AuditorClass = /** @type {any} */ (this).platform === 'python' ? PyIntentAuditor : JsIntentAuditor
		const delegate = new (/** @type {any} */ (AuditorClass))({
			dir: /** @type {any} */ (this).dir,
			fix: /** @type {any} */ (this).fix,
			platform: /** @type {any} */ (this).platform,
		}, /** @type {any} */ (this)._)
		
		return yield* delegate.run()
	}
}

export default IntentAuditor
