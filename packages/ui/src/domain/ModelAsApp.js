import { Model, getMetadata } from '@nan0web/types'
import { result, ask, show } from '../core/Intent.js'
import { InputAdapter } from '../core/InputAdapter.js'
import { resolvePositionalArgs } from '../core/resolvePositionalArgs.js'

/**
 * @typedef {Object} AppOptions
 * @property {InputAdapter} adapter
 * @property {string} parentPath
 * @property {boolean} _isExplicit
 */
/** @typedef {import('@nan0web/types').ModelOptions & AppOptions} ModelAsAppOptions */

/**
 * The model with a run generator.
 * @property {boolean} help Show help
 */
export class ModelAsApp extends Model {
	static help = {
		help: 'Show help',
		default: false,
	}

	/**
	 * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
	 * @param {Partial<ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Show help */ this.help
		this._ =  {
			...this._,
			adapter: options.adapter || new InputAdapter(),
			parentPath: String(options.parentPath || ''),
			_isExplicit: Boolean(options._isExplicit),
		}

		// ── Automated Sub-Command Instantiation ──
		const metadata = getMetadata(this.constructor)
		for (const [key, meta] of Object.entries(metadata)) {
			if (meta && typeof meta === 'object' && Array.isArray(meta.options)) {
				const val = /** @type {any} */ (this)[key]
				if (val) {
					/** @type {any} */ this[key] = this._instantiateSubCommand(key, val, data)
				}
			}
		}
	}

	/**
	 * Instantiates a subcommand if the value matches one of the options.
	 * @param {string} key - Field name.
	 * @param {any} val - Current value (string, class, or instance).
	 * @param {any} [data={}] - Data to pass to the new instance.
	 * @returns {any} Instantiated subcommand or original value.
	 */
	_instantiateSubCommand(key, val, data = {}) {
		if (val && typeof val === 'object' && typeof val.run === 'function') return val

		const Class = /** @type {typeof ModelAsApp} */ (this.constructor)
		const meta = /** @type {any} */ (Class)[key]
		if (!meta || !Array.isArray(meta.options)) return val

		let SubClass = null
		let isExplicit = false
		if (typeof val === 'function' && val.prototype && typeof val.prototype.run === 'function') {
			SubClass = val
		} else if (typeof val === 'string') {
			SubClass = meta.options.find((C) => {
				if (typeof C !== 'function') return false
				const className = typeof C.name === 'string' ? C.name : ''
				const alias =
					(typeof C.alias === 'string' ? C.alias : null) ||
					className.replace(/Command|App/g, '').toLowerCase()
				return alias === val
			})
			isExplicit = !!SubClass
		}

		if (SubClass) {
			const className = typeof Class.name === 'string' ? Class.name : ''
			const myAlias =
				(typeof /** @type {any} */ (Class).alias === 'string' ? /** @type {any} */ (Class).alias : null) ||
				className.replace(/Command|App/g, '').toLowerCase()
			const fullPath = this._.parentPath ? `${this._.parentPath} ${myAlias}` : myAlias

			const finalData = resolvePositionalArgs(SubClass, data._positionals || [], data)
			return new SubClass(finalData, { ...this._, parentPath: fullPath, _isExplicit: isExplicit })
		}

		return val
	}

	/**
	 * Generate help text for the model
	 * @param {string} [parentPath]
	 * @returns {string}
	 */
	generateHelp(parentPath = this._.parentPath) {
		const Class = /** @type {typeof ModelAsApp} */ (this.constructor)

		// Delegate help to sub-command ONLY if it was explicitly requested via arguments.
		// This prevents "store --help" from showing "store list --help" documentation.
		for (const key in this) {
			const val = /** @type {any} */ (this)[key]
			if (val instanceof ModelAsApp && val['help'] && val._._isExplicit) {
				const className = typeof Class.name === 'string' ? Class.name : ''
				const myAlias =
					(typeof /** @type {any} */ (Class).alias === 'string' ? /** @type {any} */ (Class).alias : null) ||
					className.replace(/Command|App/g, '').toLowerCase()
				const fullPath = parentPath ? `${parentPath} ${myAlias}` : myAlias
				return val.generateHelp(fullPath)
			}
		}

		const className = typeof Class.name === 'string' ? Class.name : ''
		const myAlias =
			(typeof /** @type {any} */ (Class).alias === 'string' ? /** @type {any} */ (Class).alias : null) ||
			className.replace(/Command|App/g, '').toLowerCase()
		const fullPath = parentPath ? `${parentPath} ${myAlias}` : myAlias

		const t = this._.t
		const lines = []

		/** @type {any} */
		const UI =
			typeof (/** @type {any} */ (Class).UI) === 'object' && /** @type {any} */ (Class).UI
				? /** @type {any} */ (Class).UI
				: {}

		if (UI.title) {
			lines.push(`# ${UI.icon ? UI.icon + ' ' : ''}${t(UI.title)}`.trim())
			if (UI.description) lines.push(`${t(UI.description)}`)
			lines.push('')
		}

		const posMeta = []
		const posNames = []
		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (meta && typeof meta === 'object' && meta.help && meta.positional) {
				posNames.push(meta.required ? `<${key}>` : `[${key}]`)
				posMeta.push({ key, meta })
			}
		}

		const usageTitle = UI.usageTitle ? t(UI.usageTitle) : 'Usage:'
		lines.push(`## ${usageTitle}`)
		lines.push('```bash')
		const posStr = posNames.length > 0 ? ` ${posNames.join(' ')}` : ''
		lines.push(`${fullPath}${posStr} [options]`.trimEnd())

		let usageExamples = UI.usageExamples
		if (!usageExamples) {
			for (const key in Class) {
				const meta = /** @type {any} */ (Class)[key]
				if (
					meta &&
					typeof meta === 'object' &&
					meta.positional &&
					(Array.isArray(meta.type) || Array.isArray(meta.options))
				) {
					usageExamples = []
					const subcommands = Array.isArray(meta.type) ? meta.type : meta.options
					for (const SubCmd of subcommands) {
						if (SubCmd && SubCmd.prototype && SubCmd.prototype.generateHelp) {
							const subClassName = typeof SubCmd.name === 'string' ? SubCmd.name : ''
							const cmdName = SubCmd.alias || subClassName.replace(/Command|App/g, '').toLowerCase()
							const desc = SubCmd.UI?.title ? t(SubCmd.UI.title) : ''
							usageExamples.push(`${fullPath} ${cmdName} ${desc ? `— ${desc}` : ''}`.trim())
						}
					}
					if (usageExamples.length === 0) usageExamples = undefined
					break
				}
			}
		}

		if (Array.isArray(usageExamples)) {
			let maxLeft = 0
			/** @type {any[]} */
			const parsedExamples = []
			for (const ex of usageExamples) {
				const renderedStr = t(ex, { cmd: fullPath })
				const match = renderedStr.match(/^(.*?)\s+(—|-)\s+(.*)$/)
				if (match) {
					const left = match[1].trim()
					const sep = match[2]
					const right = match[3].trim()
					maxLeft = Math.max(maxLeft, left.length)
					parsedExamples.push({ left, sep, right })
				} else {
					parsedExamples.push({ left: renderedStr.trim(), sep: '', right: '' })
				}
			}
			for (const p of parsedExamples) {
				if (p.right) {
					lines.push(`${p.left.padEnd(maxLeft + 3)}${p.sep} ${p.right}`)
				} else {
					lines.push(p.left)
				}
			}
		}
		lines.push('```')
		lines.push('')

		if (posMeta.length > 0) {
			lines.push(`## Arguments:`)
			lines.push('```bash')
			let maxPosLen = 0
			for (const p of posMeta) maxPosLen = Math.max(maxPosLen, p.key.length)
			for (const p of posMeta) {
				const desc = t(p.meta.help)
				let defValue = p.meta.default
				if (typeof defValue === 'function' && defValue.prototype) {
					const defClassName = typeof defValue.name === 'string' ? defValue.name : ''
					defValue = defValue.alias || defClassName.replace(/Command|App/g, '').toLowerCase()
				}
				const def = defValue !== undefined ? ` [${defValue}]` : ''
				lines.push(`  ${p.key.padEnd(maxPosLen + 2)} - ${desc}${def}`)
			}
			lines.push('```')
			lines.push('')
		}

		const optionsTitle = t(UI.optionsTitle || 'Options:')
		lines.push(`## ${optionsTitle}`)
		lines.push('```bash')

		let maxOptLen = 0
		let hasAlias = false
		/** @type {Array<{key: string, meta: any, left: string}>} */
		const parsedOptions = []

		for (const key in Class) {
			const meta = /** @type {any} */ (Class)[key]
			if (!meta || typeof meta !== 'object' || !meta.help || key === 'UI' || meta.positional)
				continue
			if (meta.alias) hasAlias = true
		}

		const entries = []
		for (const key in Class) {
			entries.push([key, /** @type {any} */ (Class)[key]])
		}
		const sortedEntries = entries.sort(([a], [b]) => a.localeCompare(b))

		for (const [key, meta] of sortedEntries) {
			if (!meta || typeof meta !== 'object' || !meta.help || key === 'UI' || meta.positional)
				continue

			let left
			if (hasAlias) {
				left = meta.alias ? `  -${meta.alias}, --${key}` : `      --${key}`
			} else {
				left = `  --${key}`
			}

			maxOptLen = Math.max(maxOptLen, left.length)
			parsedOptions.push({ key, meta, left })
		}

		for (const opt of parsedOptions) {
			let right = t(opt.meta.help)
			if (
				opt.key !== 'help' &&
				opt.meta.default !== undefined &&
				opt.meta.default !== null &&
				typeof opt.meta.default !== 'function' &&
				!Array.isArray(opt.meta.default)
			) {
				if (['boolean', 'string', 'number'].includes(typeof opt.meta.default)) {
					right += ` [${opt.meta.default}]`
				}
			}
			lines.push(`${opt.left.padEnd(maxOptLen + 2)} - ${right}`)
		}

		lines.push('```')
		lines.push('')
		return lines.join('\n')
	}

	/**
	 * Execute the model programmatically without a UI adapter.
	 * @param {any} [data]
	 * @param {Partial<ModelAsAppOptions>} [options]
	 * @returns {Promise<any>}
	 */
	static async execute(data = {}, options = {}) {
		const app = new this(data, options)
		if (typeof app.run !== 'function') return null

		let finalData = null
		const gen = app.run()
		let res = await gen.next()
		while (!res.done) {
			const intent = res.value
			if (intent && intent.type === 'result') finalData = intent.data
			res = await gen.next()
		}
		if (res.value && res.value.type === 'result') finalData = res.value.data
		return finalData
	}

	/**
	 * Default execution generator.
	 * Automatically delegates to the first instantiated subcommand field.
	 *
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		// 1. Automatic Help Handling (Premium OLMUI style)
		if (/** @type {any} */ (this).help) {
			const content = this.generateHelp()
			const UI = /** @type {any} */ (this.constructor).UI || {}
			const title = UI.title || this.constructor.name

			if (/** @type {any} */ (this).raw) {
				yield show(content, 'info', /** @type {any} */ ({ format: 'markdown', raw: true }))
			} else {
				yield ask('help', { content, title: `${title} Help`, hint: 'content-viewer' })
			}
			return result({})
		}

		// 2. Automatic Subcommand Delegation
		for (const key in this) {
			const val = /** @type {any} */ (this)[key]
			if (val instanceof ModelAsApp && val !== this) {
				return yield* val.run()
			}
		}
		return result({})
	}
}
