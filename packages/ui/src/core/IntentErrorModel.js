/**
 * @file IntentErrorModel — Model-as-Schema for all OLMUI contract errors.
 *
 * All error messages in the Generator/Intent system are defined here
 * as static fields with i18n-ready keys. No hardcoded strings in
 * validators or runners.
 *
 * Pattern:
 *   static field_name = {
 *     help: 'Developer description (docs/IDE)',
 *     error: 'User-facing message template with {params}',
 *   }
 */

import { ModelError } from '@nan0web/types'

export class IntentErrorModel {
	// ─── Intent Validation Errors ───

	static intent_not_object = {
		help: 'Intent must be a valid object',
		error: "Intent must be an object, got: '{actual}'",
	}

	static intent_unknown_type = {
		help: 'Only ask, progress, log, result types are allowed',
		error: "Unknown intent type: '{type}'. Allowed: {allowed}",
	}

	static ask_missing_field = {
		help: 'AskIntent requires a field property name',
		error: 'AskIntent requires a non-empty "field" string',
	}

	static ask_missing_schema_help = {
		help: 'AskIntent schema must contain help for i18n',
		error: 'AskIntent.schema must have at least a "help" property',
	}

	static intent_missing_message = {
		help: 'Progress and Log intents require a message',
		error: "'{type}' intent requires a \"message\" string",
	}

	static render_missing_component = {
		help: 'Render intent requires a component name',
		error: 'Render intent requires a non-empty "component" string',
	}

	// ─── Runner Contract Errors ───

	static adapter_missing_ask = {
		help: 'Every adapter must handle ask intents',
		error:
			'Adapter MUST provide at least an "ask" handler. This is the minimum contract for any UI adapter.',
	}

	static ask_wrong_response = {
		help: 'Ask handler must return { value: ... }',
		error: "ask('{field}') handler must return { value: ... }, got: {actual}",
	}

	static validation_failed = {
		help: 'Value returned by adapter failed schema validation',
		error: "Field '{field}' failed validation: {reason}",
	}

	static unhandled_intent = {
		help: 'Intent type not handled by the runner dispatch',
		error: "Unhandled intent type: '{type}'",
	}

	// ─── Timeout / Abort ───

	static timeout = {
		help: 'Adapter exceeded the allowed response time',
		error: '{label} — adapter did not respond within {ms}ms',
	}

	static aborted = {
		help: 'External signal cancelled the generator',
		error: 'Generator aborted by external signal',
	}

	/**
	 * Build a ModelError for a specific error field.
	 *
	 * @param {string} field - Static field name on IntentErrorModel.
	 * @param {Record<string, *>} [params] - Template parameters to substitute {key} placeholders.
	 * @returns {ModelError}
	 */
	static error(field, params = {}) {
		let message = IntentErrorModel[field]?.error || field
		for (const [key, val] of Object.entries(params)) {
			message = message.replaceAll(`{${key}}`, String(val))
		}
		return new ModelError({ [field]: message })
	}
}
