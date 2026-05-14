import { parseArgs } from 'node:util'
import { resolvePositionalArgs } from '@nan0web/ui'
import { Model, getMetadata } from '@nan0web/types'

/**
 * Creates a Model instance from CLI argv by auto-generating parseArgs config
 * from the Model's static field descriptors.
 *
 * @template {typeof Model} T
 * @param {T} ModelClass - Model class with static field descriptors.
 * @param {string[]} argv - Raw CLI arguments (typically process.argv.slice(2)).
 * @param {Object} [appOptions={}] - Options object to inject into the Model.
 * @returns {InstanceType<T>} A fully resolved Model instance.
 */
export function modelFromArgv(ModelClass, argv = [], appOptions = {}) {
	/** @type {import('node:util').ParseArgsConfig['options']} */
	const options = {}

	const extract = (TargetClass) => {
		const metadata = getMetadata(TargetClass)
		for (const [key, descriptor] of Object.entries(metadata)) {
			if (Array.isArray(descriptor.options)) {
				descriptor.options.forEach((C) => typeof C === 'function' && extract(C))
			} else if (Array.isArray(descriptor.type)) {
				descriptor.type.forEach((C) => typeof C === 'function' && extract(C))
			}

			if (!descriptor.help && descriptor.default === undefined) continue
			if (['args', 'UI', 'help'].includes(key)) continue

			/** @type {"boolean" | "string"} */
			const parseType =
				descriptor.type === 'boolean' || typeof descriptor.default === 'boolean'
					? 'boolean'
					: 'string'

			const opt = { type: parseType }
			if (
				descriptor.alias &&
				typeof descriptor.alias === 'string' &&
				descriptor.alias.length === 1
			) {
				opt.short = descriptor.alias
			}
			options[key] = opt
		}
	}

	extract(ModelClass)

	const { positionals, values } = parseArgs({
		args: argv,
		options,
		allowPositionals: true,
		strict: false,
	})

	const data = resolvePositionalArgs(/** @type {any} */ (ModelClass), positionals, values)
	data._argv = argv
	// @ts-ignore
	return /** @type {InstanceType<T>} */ (new ModelClass(data, appOptions))
}
