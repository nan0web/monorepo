/**
 * @fileoverview Universal Flow Runner for yield-based UI architecture.
 *
 * The Flow pattern enables "One Logic, Many UI" by separating business logic
 * from presentation. A Flow is an async generator that yields Components,
 * which are then rendered by platform-specific Adapters.
 *
 * @module @nan0web/ui/core/Flow
 */

import CancelError from './Error/CancelError.js'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES (JSDoc for pure JavaScript, TypeScript-compatible)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Component types that can be yielded from a Flow.
 *
 * @typedef {'view' | 'prompt' | 'stream' | 'action' | 'flow'} ComponentType
 */

/**
 * Base interface for all UI components.
 *
 * @typedef {Object} FlowComponent
 * @property {ComponentType} type - Component type discriminator.
 * @property {string} [name] - Optional component name for debugging.
 */

/**
 * Static view component (no user input required).
 * Examples: Alert, Badge, Toast, Table, Text
 *
 * @typedef {Object} ViewComponent
 * @property {'view'} type - Always 'view'.
 * @property {string} name - Component name (e.g., 'Alert', 'Toast').
 * @property {Object} props - Component-specific properties.
 */

/**
 * Interactive prompt component (requires user input).
 * Examples: Input, Select, Confirm, Multiselect, Mask
 *
 * @typedef {Object} PromptComponent
 * @property {'prompt'} type - Always 'prompt'.
 * @property {string} name - Component name (e.g., 'Select', 'Input').
 * @property {Object} props - Component-specific properties.
 * @property {string} [props.message] - Prompt message to display.
 * @property {any[]} [props.choices] - Options for Select/Multiselect.
 * @property {Function} [props.validate] - Validation function.
 */

/**
 * Streaming component for progress/async operations.
 * Examples: Spinner, ProgressBar, StreamChunk
 *
 * @typedef {Object} StreamComponent
 * @property {'stream'} type - Always 'stream'.
 * @property {string} name - Component name (e.g., 'Spinner', 'Progress').
 * @property {Object} props - Component-specific properties.
 * @property {AsyncIterable} [iterable] - Async iterator for streaming content.
 */

/**
 * Action component for physical or side-effect operations.
 * Examples: Move, Sound, Light, Notify
 *
 * @typedef {Object} ActionComponent
 * @property {'action'} type - Always 'action'.
 * @property {string} name - Component name (e.g., 'Move', 'Beep').
 * @property {Object} props - Component-specific properties.
 */

/**
 * Result returned by prompt components.
 *
 * @typedef {Object} PromptResult
 * @property {any} value - The value entered/selected by user.
 * @property {boolean} [cancelled] - True if user cancelled the prompt.
 */

/**
 * Adapter interface that all platform adapters must implement.
 *
 * @typedef {Object} FlowAdapter
 * @property {(component: ViewComponent) => void | Promise<void>} renderView
 *   Renders a static view component.
 * @property {(component: PromptComponent) => Promise<PromptResult>} executePrompt
 *   Execute an interactive prompt and returns user input.
 * @property {(component: StreamComponent) => AsyncIterable} streamProgress
 *   Handles streaming components.
 * @property {(component: ActionComponent) => Promise<any>} [executeAction]
 *   Executes an action component (physical or side-effect).
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT FACTORIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a View component.
 *
 * @param {string} name - Component name (e.g., 'Alert', 'Toast').
 * @param {Object} props - Component properties.
 * @returns {ViewComponent}
 *
 * @example
 * yield View('Alert', { variant: 'success', message: 'Done!' })
 */
export function View(name, props = {}) {
	return { type: 'view', name, props }
}

/**
 * Creates a Prompt component.
 *
 * @param {string} name - Component name (e.g., 'Select', 'Input').
 * @param {Object} props - Component properties.
 * @returns {PromptComponent}
 *
 * @example
 * const value = yield Prompt('Select', { message: 'Choose:', choices: ['a', 'b'] })
 */
export function Prompt(name, props = {}) {
	return { type: 'prompt', name, props }
}

/**
 * Creates a Stream component.
 *
 * @param {string} name - Component name (e.g., 'Spinner', 'Progress').
 * @param {Object} props - Component properties.
 * @returns {StreamComponent}
 *
 * @example
 * yield* Stream('Progress', { total: 100, current: 50 })
 */
export function Stream(name, props = {}) {
	return { type: 'stream', name, props }
}

/**
 * Creates an Action component.
 *
 * @param {string} name - Action name.
 * @param {Object} props - Action properties.
 * @returns {ActionComponent}
 */
export function Action(name, props = {}) {
	return { type: 'action', name, props }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FACTORIES (Pre-defined components)
// ═══════════════════════════════════════════════════════════════════════════

/** @param {Object} props */
export const Alert = (props) => View('Alert', props)

/** @param {Object} props */
export const Toast = (props) => View('Toast', props)

/** @param {Object} props */
export const Badge = (props) => View('Badge', props)

/** @param {Object} props */
export const Text = (props) => View('Text', props)

/** @param {Object} props */
export const Table = (props) => View('Table', props)

/** @param {Object} props */
export const Input = (props) => Prompt('Input', props)

/** @param {Object} props */
export const Select = (props) => Prompt('Select', props)

/** @param {Object} props */
export const Confirm = (props) => Prompt('Confirm', props)

/** @param {Object} props */
export const Multiselect = (props) => Prompt('Multiselect', props)

/** @param {Object} props */
export const Mask = (props) => Prompt('Mask', props)

/** @param {Object} props */
export const Password = (props) => Prompt('Password', props)

/** @param {Object} props */
export const Spinner = (props) => Stream('Spinner', props)

/** @param {Object} props */
export const Progress = (props) => Stream('Progress', props)

/** @param {Object} props */
export const Beep = (props) => Action('Beep', props)

/** @param {Object} props */
export const Move = (props) => Action('Move', props)

// ═══════════════════════════════════════════════════════════════════════════
// FLOW RUNNER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Runs a Flow (async generator) with the provided adapter.
 *
 * The Flow runner iterates through yielded components and dispatches them
 * to the appropriate adapter method based on component type.
 *
 * @param {AsyncGenerator} flow - The flow generator to execute.
 * @param {FlowAdapter} adapter - The platform-specific adapter.
 * @param {Object} [options={}] - Additional options.
 * @param {AbortSignal} [options.signal] - Abort signal for cancellation.
 * @returns {Promise<any>} The final return value of the flow.
 *
 * @example
 * async function* loginFlow() {
 *     yield Alert({ message: 'Welcome!' })
 *     const username = yield Input({ message: 'Username:' })
 *     const password = yield Password({ message: 'Password:' })
 *     return { username, password }
 * }
 *
 * const result = await runFlow(loginFlow(), cliAdapter)
 */
export async function runFlow(flow, adapter, options = {}) {
	const { signal } = options
	let nextValue = undefined

	while (true) {
		// Check for abort
		if (signal?.aborted) {
			throw new CancelError('Flow aborted')
		}

		// Get next component from flow
		const { value: component, done } = await flow.next(nextValue)

		if (done) {
			return component // Final return value
		}

		// Handle null/undefined yields
		if (!component) {
			nextValue = undefined
			continue
		}

		// Dispatch based on component type
		switch (component.type) {
			case 'view':
				await adapter.renderView?.(component)
				nextValue = undefined
				break

			case 'prompt': {
				const result = await adapter.executePrompt?.(component)
				if (result?.cancelled) {
					throw new CancelError('User cancelled prompt')
				}
				nextValue = result?.value
				break
			}

			case 'stream':
				// For streams, we iterate and yield each chunk
				if (adapter.streamProgress) {
					for await (const chunk of adapter.streamProgress(component)) {
						// Optionally allow flow to react to stream chunks
						// by using a specific protocol if needed
					}
				}
				nextValue = undefined
				break

			case 'action':
				nextValue = await adapter.executeAction?.(component)
				break

			case 'flow':
				// Nested flow - recursive execution
				nextValue = await runFlow(component.generator, adapter, options)
				break

			default:
				// Unknown component type - try to render as view
				if (typeof component === 'string') {
					await adapter.renderView?.({ type: 'view', name: 'Text', props: { content: component } })
				} else if (typeof component.toString === 'function') {
					await adapter.renderView?.({
						type: 'view',
						name: 'Text',
						props: { content: String(component) },
					})
				}
				nextValue = undefined
		}
	}
}

/**
 * Wraps a nested flow for composition with yield*.
 *
 * @param {Function} flowFn - Flow generator function.
 * @param {...any} args - Arguments to pass to the flow function.
 * @returns {Object} A flow component.
 *
 * @example
 * async function* mainFlow() {
 *     yield Alert({ message: 'Starting...' })
 *     const user = yield* flow(loginFlow)
 *     yield Alert({ message: `Welcome, ${user.name}!` })
 * }
 */
export function flow(flowFn, ...args) {
	return { type: 'flow', generator: flowFn(...args) }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
	runFlow,
	flow,
	// Factories
	View,
	Prompt,
	Stream,
	// Components
	Alert,
	Toast,
	Badge,
	Text,
	Table,
	Input,
	Select,
	Confirm,
	Multiselect,
	Mask,
	Password,
	Spinner,
	Progress,
}
