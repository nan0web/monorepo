import { Data as BaseData } from '@nan0web/db'

class Data extends BaseData {
	static OBJECT_DIVIDER = '.'
}
/**
 * Resolves context-aware values in strings and objects.
 * Supports:
 * - References: `data:currencies`, `action:save`, `fn:calculate,100,USD,UAH`
 * - Templates: `{{user.name}}`, `{{currencies[0]}}`
 * - Scalars: numbers, booleans, etc. (passthrough)
 *
 * @param {Object} context - Application context (data, actions, functions)
 * @param {*} value - Raw value to resolve
 * @returns {*} Resolved value
 */
export function resolveContext(context, value) {
	if (typeof value !== 'string') return value

	// Handle data:* reference
	if (value.startsWith('data:')) {
		const path = value.slice(5)
		return Data.find(path, context.data) ?? []
	}

	// Handle action:* reference
	if (value.startsWith('action:')) {
		const name = value.slice(7)
		return context.actions?.[name]
	}

	// Handle fn:* reference with arguments
	if (value.startsWith('fn:')) {
		const [fnName, ...rawArgs] = value.slice(3).split(',')
		const fn = context.functions?.[fnName]
		if (typeof fn !== 'function') return undefined

		// Parse arguments (numbers, booleans, strings)
		const args = rawArgs.map((arg) => {
			try {
				return JSON.parse(arg)
			} catch {
				return arg // Return as-is if parsing fails
			}
		})

		return () => fn(...args)
	}

	// Handle template interpolation {{key}} using Data.find
	return value.replace(/{{(.*?)}}/g, (_, path) => {
		const result = Data.find(path, context.data)
		return result !== undefined ? result : `{{${path}}}`
	})
}

/**
 * Resolves a context value or returns undefined if resolution fails.
 * Used internally by renderers to safely resolve props.
 *
 * @param {Object} ctx - Context with data, actions and functions
 * @param {string} value - String value to resolve
 * @returns {*} Resolved value or undefined
 */
export function resolveContextValue(ctx, value) {
	if (typeof value !== 'string') return undefined
	if (value.startsWith('data:')) {
		return Data.find(value.slice(5), ctx.data) ?? []
	}
	if (value.startsWith('action:')) {
		return ctx.actions?.[value.slice(7)]
	}
	if (value.startsWith('fn:')) {
		const [fnName, ...args] = value.slice(3).split(',')
		const fn = ctx.functions?.[fnName]
		return typeof fn === 'function' ? fn : undefined
	}
	return undefined
}
