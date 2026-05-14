/**
 * Input module – provides utilities to read user input from the console.
 *
 * @module ui/input
 */

import prompts from './prompts.js'
import { CancelError } from '@nan0web/ui/core'
import process from 'node:process'
import { validateString, validateFunction } from '../core/PropValidation.js'

/** @typedef {import('@nan0web/ui').Intent} Intent */
/** @typedef {import('@nan0web/ui').Model} Model */
/** @typedef {import('@nan0web/ui').AskResponse} AskResponse */

/**
 * Triggers a system beep (ASCII Bell).
 */
export function beep() {
	process.stdout.write('\u0007')
}

/**
 * Represents a line of user input.
 *
 * @class
 * @property {string} value – The raw answer string.
 * @property {string[]} stops – Words that trigger cancellation.
 * @property {boolean} cancelled – True when the answer matches a stop word.
 */
export class Input {
	constructor(input = {}) {
		/** @type {boolean} */
		this._cancelled = false
		/** @type {string} */
		this.value = ''
		/** @type {string[]} */
		this.stops = []

		const { value = this.value, cancelled = this._cancelled, stops = [] } = input
		this.value = String(value)
		this.stops = stops
		this._cancelled = Boolean(cancelled)
	}

	get cancelled() {
		return this._cancelled || this.stops.includes(this.value)
	}

	toString() {
		return this.value
	}
}

/**
 * Modern text input with validation and default value.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} [config.initial] - Default value
 * @param {string} [config.type] - Prompt type (text, password, etc)
 * @param {(value:string)=>boolean|string|Promise<boolean|string>} [config.validate] - Validator
 * @param {(value:string)=>string} [config.format] - Formatter
 * @returns {Promise<{value:string, cancelled:boolean}>}
 */
export async function text(config) {
	validateString(config.message, 'message', 'Input.text', true)
	validateString(config.initial, 'initial', 'Input.text')
	validateFunction(config.validate, 'validate', 'Input.text')
	validateFunction(config.format, 'format', 'Input.text')

	const { message, initial, validate, type = 'text', format } = config
	const response = await prompts(
		{
			type: type,
			name: 'value',
			message,
			initial,
			validate,
			format,
		},
		{
			onCancel: () => {
				throw new CancelError()
			},
		}
	)

	return { value: response.value, cancelled: response.value === undefined }
}

/**
 * Factory that creates a reusable async input handler.
 * Adapter for legacy ask() signature.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {Object} [console] Optional console instance.
 * @param {(input: Input) => Promise<boolean>|boolean} [loop] Optional loop validator.
 * @returns {(question: string|{message:string}, loopVal?: Function) => Promise<Input>} Async function that resolves to an {@link Input}.
 */
export function createInput(stops = [], predef = undefined, console = undefined, loop = undefined) {
	return async function ask(question, loopVal = loop) {
		const currentLoop = typeof loopVal === 'function' ? loopVal : loop
		if (predef !== undefined) {
			prompts.inject([predef])
		}

		// Map options to prompts config
		let validationFn = undefined

		if (typeof currentLoop === 'function') {
			validationFn = async (val) => {
				if (stops.includes(val)) return true
				const inputObj = new Input({ value: val, stops })
				if (inputObj.cancelled) return true

				const shouldContinue = await currentLoop(inputObj)
				return shouldContinue ? 'Invalid input' : true
			}
		}

		const result = await text({
			message: typeof question === 'object' ? (question.message || '') : question,
			validate: validationFn,
		})

		return new Input({ value: result.value, stops })
	}
}

/**
 * Universal Interaction Helper `ask`.
 * Polymorphic entry point for OLMUI actions (Prompts, Views, Intents, Models).
 *
 * @param {string | Intent | Model | Function | Promise<any>} target - Question string, Component, Intent, or Model Class.
 * @param {any} [options] - Additional options or loop validator.
 * @returns {Promise<any>}
 */
export async function ask(target, options) {
	// 1. Resolve Promises
	if (target instanceof Promise) {
		target = await target
	}

	// 2. Handle null/undefined
	if (!target) return

	// 3. Handle Interactive Components (Prompts)
	if (typeof target === 'object' && 'execute' in target && typeof target.execute === 'function') {
		const result = await target.execute()
		// Unwrap standard AskResponse
		if (result && typeof result === 'object' && 'value' in result) {
			return result.value
		}
		return result
	}

	// 4. Handle OLMUI Intent Objects (render, show, result, agent)
	if (typeof target === 'object' && 'type' in target && typeof target.type === 'string') {
		const intent = /** @type {any} */ (target)
		
		// Optimization: handle simple display intents directly to avoid circular deps
		if (intent.type === 'render') {
			const { Table } = await import('../view/Table.js')
			const { Alert } = await import('../view/Alert.js')
			const { Spinner } = await import('../prompt/Spinner.js')
			const { ProgressBar } = await import('../prompt/ProgressBar.js')
			/** @type {Record<string, any>} */
			const components = { Table, Alert, Spinner, ProgressBar }

			const ComponentClass = components[intent.component]
			if (ComponentClass) {
				return await ask(ComponentClass(intent.props))
			}
		}

		if (intent.type === 'show') {
			const { Alert } = await import('../view/Alert.js')
			return await ask(
				/** @type {any} */ (Alert({
					title: '',
					variant: intent.level === 'warn' ? 'warning' : (intent.level || 'info'),
					children: intent.message || '',
				}))
			)
		}

		if (intent.type === 'agent') {
			const { Alert } = await import('../view/Alert.js')
			const { Spinner } = await import('../prompt/Spinner.js')

			// Show starting message
			await ask(
				/** @type {any} */ (Alert({
					title: 'Agent',
					variant: 'warning',
					children: intent.task || '',
				}))
			)

			// If action provided, wrap in spinner
			if (intent.action) {
				return await ask(/** @type {any} */ (Spinner({ UI: 'Processing...', action: intent.action })))
			}
			return
		}

		if (intent.type === 'result') {
			process.stdout.write(`\n${JSON.stringify(intent.data || intent, null, 2)}\n\n`)
			return
		}
	}

	// 5. Handle Classes (Models/Forms)
	if (typeof target === 'function' && target.name) {
		// Heuristic: if it's a function with a name, it's likely a Model/Class
		const { generateForm, Form } = await import('./form.js')
		const uiForm = generateForm(target, options)
		const cliForm = new Form(uiForm, options)
		const res = await cliForm.requireInput()
		if (res.cancelled) throw new CancelError()
		return cliForm.body
	}

	// 6. Handle Legacy String Ask
	if (typeof target === 'string') {
		const legacyAsk = createInput()
		const res = await legacyAsk(target, options)
		return res.value
	}

	// 7. Fallback: Static View Rendering
	const output = String(target)
	if (output) {
		process.stdout.write(output + '\n')
	}
	return output
}

/**
 * Mock helper for predefined inputs (Testing).
 */
export function createPredefinedInput(predefined, console, stops = []) {
	const strPredefined = predefined.map(String)
	let index = 0
	return async function (question) {
		if (index >= strPredefined.length) {
			throw new CancelError('No more predefined answers')
		}
		const val = strPredefined[index++]
		if (console) console.info(`${question}${val}`)
		return new Input({ value: val, stops })
	}
}
