/**
 * @file Intent — Yield Contract Types for OLMUI Generators.
 *
 * Defines the strict set of intent types that a Model generator can yield,
 * and the response shapes that Adapters must return.
 *
 * These types serve as the "welding contract" between Domain Models
 * and UI Adapters (CLI, Lit, React, Chat, Test).
 */

import { IntentErrorModel } from './IntentErrorModel.js'

// ─── Intent Types (Model → Adapter) ───

/**
 * @typedef {Object} FieldSchema
 * @property {string} help - Human-readable label / i18n key.
 * @property {*} default - Default value for the field.
 * @property {string} [type] - Field type hint ('text', 'number', 'text/markdown').
 * @property {Array<{value: *, label: string}>} [options] - Enum options for select.
 * @property {(val: *) => true | string} [validate] - Validator: true = ok, string = error key from Model.
 * @property {boolean} [hidden] - If true, field is excluded from UI forms.
 */

/**
 * Model needs data from the environment (user input, LLM extraction, test fixture).
 * Adapter MUST return an `AskResponse`.
 * @typedef {Object} AskIntent
 * @property {'ask'} type
 * @property {string} field - Property name on the model.
 * @property {FieldSchema | Function} schema - Field metadata or Model-as-Schema class constructor.
 * @property {true} [model] - When true, schema is a Model-as-Schema class (full form).
 */

/**
 * Model informs about a long-running operation. No response expected.
 * Message MUST come from the Model (i18n static field value).
 * @typedef {Object} ProgressIntent
 * @property {'progress'} type
 * @property {number} [value] - Progress value (0-1).
 * @property {number} [total] - Absolute total (if value is absolute).
 * @property {string} [id] - Progress ID for tracking by Adapter to calculate speed/eta.
 * @property {string} message - Status message from Model (i18n static field value).
 * @property {ProgressOptions} [options] - Additional options for progress intent.
 */

/**
 * @typedef {'info' | 'warn' | 'error' | 'success'} ShowLevel
 */

/** @typedef {ShowLevel | 'debug'} LogLevel */

/**
 * Model emits a show message. No response expected.
 * Message MUST come from the Model (i18n static field value).
 * @typedef {Object} ShowIntent
 * @property {'show'} type
 * @property {ShowLevel} level
 * @property {string} message - Show message from Model (i18n static field value).
 */

/**
 * Model emits a log message intended for debugging/developer (Not UI).
 * @typedef {Object} LogIntent
 * @property {'log'} type
 * @property {LogLevel} level
 * @property {string} message - Internal log message.
 */

/**
 * Final return value from the generator.
 * @typedef {Object} ResultIntent
 * @property {'result'} type
 * @property {*} data - The raw result data (JSON-serializable).
 * @property {boolean} [raw] - If true, Adapter MUST output data raw (no UI decorations).
 */

/**
 * Model requests rendering of a pure UI component (Header, Footer, Static Map).
 * No response expected from the logic loop.
 * @typedef {Object} RenderIntent
 * @property {'render'} type
 * @property {string} component - Component name (e.g. 'App.Layout.Header').
 * @property {object} props - Static props for the component.
 */

/**
 * Contextual data and attachments for the AI subagent.
 * @typedef {Object} AgentContext
 * @property {string[]} [instructions] - List of instructions or guidelines (e.g. ['Use 1-char emojis only']).
 * @property {Record<string, string>} [files] - Hash map of file paths to their string contents.
 * @property {Record<string, any>} [data] - Any arbitrary JSON data (e.g. parsed errors, ASTs, metadata) useful for the task.
 */

/**
 * Model delegates a task to an AI subagent. The Adapter should launch the agent
 * with the provided task and context, and return the result. If the agent is skipped,
 * it returns { success: false } but allows user to generate a prompt.
 * @typedef {Object} AgentIntent
 * @property {'agent'} type
 * @property {string} task - The instructional task for the AI agent.
 * @property {AgentContext} context - Contextual data, files, and instructions for the task.
 * @property {() => string} toPrompt - Helper to format task and context as an LLM prompt.
 */

/**
 * Union of all possible yielded intents.
 * @typedef {(AskIntent | ProgressIntent | LogIntent | ShowIntent | RenderIntent | AgentIntent | ResultIntent) & {
 *   $value?: any;
 *   $success?: boolean;
 *   $files?: Record<string, string>;
 *   $message?: string;
 * }} Intent
 */

// ─── Response Types (Adapter → Model) ───

/**
 * Response to an AskIntent. Adapter provides the collected value.
 * The value MUST conform to the type described in the requested FieldSchema.
 * @typedef {Object} AskResponse
 * @property {*} value - The value matching schema.type (collected from user / LLM / test fixture).
 * @property {boolean} cancelled - Whether the user cancelled this interaction (e.g. pressed ESC).
 * @property {string} [action] - The action identifier (e.g., 'submit', 'exit', 'back').
 * @property {any} [body] - Additional payload or form data.
 * @property {any} [form] - The form model instance (if applicable).
 * @property {number} [index] - The selected index for lists/tables.
 */

/**
 * Response to an AgentIntent.
 * The underlying Adapter (Orchestrator) is responsible for communicating with the LLM,
 * enforcing output formats (e.g. Unified Diff or Tool Calls like `updateFile`),
 * and resolving common LLM hallucinations (like Grok truncating code with `// ...`).
 *
 * The Model (e.g. IconsAuditor) receives this clean, resolved response and does not
 * need to parse Markdown or interpret diffs itself.
 *
 * @typedef {Object} AgentResponse
 * @property {boolean} success - True if the agent successfully processed the task.
 * @property {Record<string, string>} [files] - Hash map of fully resolved, updated file contents.
 * @property {string} [message] - Optional summary or explanation returned by the AI.
 */

// ─── Abort Support ───

/**
 * Special response that Adapters can send to abort the generator.
 *
 * The `reason` is a KEY from the Model's static `abort` dictionary,
 * not a freeform message. This enables proper i18n translation:
 *
 *   Model defines:  static abort = { user_cancelled: 'Скасовано', timeout: 'Час вичерпано' }
 *   Adapter sends:  { abort: true, reason: 'user_cancelled' }
 *   UI translates:  t(Model.abort[reason])
 *
 * @typedef {Object} AbortResponse
 * @property {true} abort - Signal to the model that execution was cancelled.
 * @property {string} [reason] - Key from Model's static abort dictionary (not a freeform message).
 */

/**
 * Union of all possible responses an Adapter can send back via iterator.next().
 * @typedef {AskResponse | AgentResponse | AbortResponse | undefined} IntentResponse
 */

/**
 * @typedef {'ask' | 'show' | 'progress' | 'render' | 'agent'} IntentType
 */

export const INTENT_TYPES = /** @type {const} */ ([
	'ask',
	'progress',
	'show',
	'log',
	'render',
	'agent',
])

/**
 * Detects if a value is a Model-as-Schema class (has static fields with `help`).
 * @param {*} schema
 * @returns {boolean}
 */
export function isModelSchema(schema) {
	if (typeof schema !== 'function') return false
	return Object.getOwnPropertyNames(schema).some((key) => {
		const meta = schema[key]
		return meta && typeof meta === 'object' && 'help' in meta
	})
}

/**
 * Validates that an object is a well-formed Intent.
 * Throws ModelError if the intent is malformed (the "Judge").
 *
 * @param {*} intent
 * @returns {intent is Intent}
 */
export function validateIntent(intent) {
	if (!intent || typeof intent !== 'object') {
		throw IntentErrorModel.error('intent_not_object', { actual: typeof intent })
	}
	if (!INTENT_TYPES.includes(intent.type) && intent.type !== 'result') {
		throw IntentErrorModel.error('intent_unknown_type', {
			type: intent.type,
			allowed: INTENT_TYPES.join(', ') + ', result',
		})
	}
	if (intent.type === 'ask') {
		if (typeof intent.field !== 'string' || !intent.field) {
			throw IntentErrorModel.error('ask_missing_field')
		}
		// Accept both: plain schema {help: '...'} and Model-as-Schema class/instance
		const isModel = !!intent.model
		if (
			!isModel &&
			(!intent.schema || typeof intent.schema !== 'object' || !('help' in intent.schema))
		) {
			throw IntentErrorModel.error('ask_missing_schema_help')
		}
	}
	if (intent.type === 'progress' || intent.type === 'show' || intent.type === 'log') {
		const isComponentShow = (intent.type === 'show' || intent.type === 'log') && intent.component
		if (!isComponentShow && typeof intent.message !== 'string') {
			throw IntentErrorModel.error('intent_missing_message', { type: intent.type })
		}
	}
	if (intent.type === 'render') {
		if (typeof intent.component !== 'string' || !intent.component) {
			throw IntentErrorModel.error('render_missing_component')
		}
	}
	if (intent.type === 'agent') {
		if (typeof intent.task !== 'string' || !intent.task) {
			throw IntentErrorModel.error('agent_missing_task')
		}
	}
	return true
}

/**
 * Create an ask intent.
 *
 * Two modes:
 *   ask('amount', { help: 'Enter amount', type: 'number' })  → single field
 *   ask('transfer', TransferMoneyModel)                       → full Model form
 *
 * @param {string} field - Field name or form name.
 * @param {object | Function} schema - Field descriptor or Model-as-Schema class.
 * @returns {AskIntent}
 */
export function ask(field, schema) {
	if (isModelSchema(schema)) {
		return { type: 'ask', field, schema, model: true }
	}
	return { type: 'ask', field, schema }
}

/**
 * @typedef {Object} ProgressOptions
 * @property {number} [total] - Absolute total steps.
 * @property {string} [id] - Progress tracking ID.
 * @property {number} [width] - Width of the progress bar in terminal characters.
 * @property {number} [fps] - Frames per second update rate limit.
 * @property {string} [format] - Custom format string (e.g. '{time} {bar} {percent} {title}').
 * @property {number} [columns] - Number of columns (terminal width).
 * @property {boolean} [forceOneLine] - Prevent wrapping and truncate instead.
 * @property {boolean|'success'|'error'} [stop] - Set to true to stop, or 'success'/'error' to stop with a status icon (for spinners).
 */

/**
 * Create a progress intent.
 * @param {string} message - Status message from Model (i18n static field value).
 * @param {number} [value=0] - Progress value (current step or percentage).
 * @param {ProgressOptions|number|string} [optionsOrTotalOrId] - Options object, or absolute total steps (number), or progress tracking ID (string).
 * @param {string} [id='default'] - Progress ID (if total is provided).
 * @returns {ProgressIntent}
 */
export function progress(message, value = 0, optionsOrTotalOrId, id) {
	/** @type {ProgressOptions} */
	let options = {}

	if (typeof optionsOrTotalOrId === 'object' && optionsOrTotalOrId !== null) {
		options = optionsOrTotalOrId
	} else {
		// legacy support
		if (typeof optionsOrTotalOrId === 'number') {
			options.total = optionsOrTotalOrId
			if (typeof id === 'string') options.id = id
		} else if (typeof optionsOrTotalOrId === 'string') {
			options.id = optionsOrTotalOrId
		}
	}

	return {
		type: 'progress',
		message,
		value,
		total: options.total,
		id: options.id || 'default',
		options,
	}
}

/**
 * Lgs a message if level is greater or equal the current view level.
 * @param {LogLevel} level
 * @param {string} message
 * @param {object} [data={}]
 * @returns {LogIntent}
 */
export function log(level, message, data = {}) {
	return { type: 'log', level, message, ...data }
}

/**
 * Create a render intent.
 * @param {string} component - Component name (e.g. 'App.Layout.Header').
 * @param {object} [props] - Static props for the component.
 * @returns {RenderIntent}
 */
export function render(component, props = {}) {
	return { type: 'render', component, props }
}

/**
 * Create a result intent.
 * @param {*} data - The raw result data.
 * @param {boolean} [raw=false] - If true, result is printed raw.
 * @returns {ResultIntent}
 */
export function result(data, raw = false) {
	return { type: 'result', data, raw }
}

/**
 * @typedef {Object} ShowData
 * @property {any} [component]
 * @property {import('@nan0web/types').Model} [model]
 */
/**
 * Create a show intent.
 * @param {string | any} message Message to display.
 * @param {ShowLevel|ShowData} [level='info'] Level of message or additional data then `level = 'info'`.
 * @param {ShowData} [data={}] Additional data to display.
 * @returns {ShowIntent}
 */
export function show(message, level = 'info', data = {}) {
	if ('string' === typeof level) {
		return { type: 'show', level, message, ...data }
	}
	return { type: 'show', level: 'info', message, ...level, ...data }
}

/**
 * Create an agent intent to delegate a task to an AI subagent.
 * @param {string} task - The instructional task for the AI agent.
 * @param {AgentContext} [context={}] - Contextual data (files, errors, docs).
 * @returns {AgentIntent}
 */
export function agent(task, context = {}) {
	return {
		type: 'agent',
		task,
		context,
		toPrompt() {
			let ctxStr = ''
			if (this.context.data) {
				try {
					ctxStr = JSON.stringify(this.context.data, null, 2)
				} catch (e) {
					ctxStr = String(this.context.data)
				}
			}

			// Format input files for the LLM using the boundary concept
			const filesStr = Object.entries(this.context.files || {})
				.map(([path, content]) => `---boundary:${path}---\n${content}\n---boundary---`)
				.join('\n\n')

			const outputRules = `
[Output Format Rules]
You must return your code modifications using the following strictly parsable boundary format. Do NOT use markdown code blocks (\`\`\`) or JSON for your code outputs.

To replace an ENTIRE file:
---boundary:path/to/file.js---
<full new file content here>
---boundary---

To replace a SPECIFIC SNIPPET (e.g. replacing 3 lines starting at line 33):
---boundary:path/to/file.js:33:3---
<new snippet content here>
---boundary---
`
			const inst = Array.isArray(this.context.instructions)
				? this.context.instructions.join('\n')
				: this.context.instructions

			return [
				`[Subagent Task]`,
				this.task,
				inst ? `\n[Instructions]\n${inst}` : '',
				ctxStr ? `\n[Context]\n${ctxStr}` : '',
				filesStr ? `\n[Files]\n${filesStr}` : '',
				outputRules,
			]
				.filter(Boolean)
				.join('\n')
		},
	}
}
