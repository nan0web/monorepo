/**
 * CompletionGenerator – generates shell completion scripts for zsh and bash.
 *
 * @module CompletionGenerator
 */

/**
 * Generate shell completion scripts based on command structure.
 */
export default class CompletionGenerator {
	/**
	 * Generate a completion script for the specified shell type.
	 *
	 * @param {string} shellType - Either 'zsh' or 'bash'
	 * @param {Object} commandStructure - Command structure with commands and options
	 * @param {string} appName - Application name for the completion function
	 * @returns {string} Generated completion script
	 */
	static generateCompletionScript(shellType, commandStructure, appName = 'app') {
		if (shellType === 'zsh') {
			return this.generateZshCompletion(commandStructure, appName)
		} else if (shellType === 'bash') {
			return this.generateBashCompletion(commandStructure, appName)
		} else {
			throw new Error(`Unsupported shell type: ${shellType}`)
		}
	}

	/**
	 * Generate Zsh completion script.
	 *
	 * @param {Object} commandStructure
	 * @param {string} appName
	 * @returns {string}
	 */
	static generateZshCompletion(commandStructure, appName) {
		const funcName = `_${appName.replace(/[^a-zA-Z0-9]/g, '_')}`
		const commands = this.getAllCommands(commandStructure)
		const options = this.getAllOptions(commandStructure)

		return `#compdef ${appName}

${funcName}() {
	local curcontext="$curcontext" state line
	typeset -A opt_args

	_arguments -C \
		'(-h --help)'{'-h,--help'}'[Show help]' \
		${options
			.map((opt) => {
				const flags = []
				if (opt.short) flags.push(`'-${opt.short}'`)
				if (opt.long) flags.push(`'--${opt.long}'`)
				const desc = opt.help ? `[${opt.help.replace(/'/g, "'\\''")}]` : ''
				return `(${flags.join(' ')}){${flags.join(',')}${desc}}`
			})
			.join(' \\\n\t\t')}
		'*::command:->commands'

	case $state in
		(commands)
			local -a _commands
			_commands=(
				${commands.map((cmd) => `'${cmd.name}:${cmd.help || cmd.name}'`).join(' \\\n\t\t\t')}
			)
			_describe -t commands 'commands' _commands
			;;
	esac
}

compdef ${funcName} ${appName}
`
	}

	/**
	 * Generate Bash completion script.
	 *
	 * @param {Object} commandStructure
	 * @param {string} appName
	 * @returns {string}
	 */
	static generateBashCompletion(commandStructure, appName) {
		const commands = this.getAllCommands(commandStructure)
		const options = this.getAllOptions(commandStructure)

		const commandList = commands.map((cmd) => cmd.name).join(' ')
		const optionList = options.map((opt) => `--${opt.long}`).join(' ')
		const shortOptionList = options.filter((opt) => opt.short).map((opt) => `-${opt.short}`).join(' ')

		// Build the bash script using string concatenation to avoid template literal issues
		const lines = []
		lines.push(`# ${appName} bash completion`)
		lines.push(`_${appName}() {`)
		lines.push(`\tlocal cur prev words cword`)
		lines.push(`\tCOMPREPLY=()`)
		lines.push(`\tcur="${'${COMP_WORDS[COMP_CWORD]}'}"`)
		lines.push(`\tprev="${'${COMP_WORDS[COMP_CWORD-1]}'}"`)
		lines.push(`\twords=("${'${COMP_WORDS[@]}'}")`)
		lines.push(`\tcword=$${'COMP_CWORD'}`)
		lines.push('')
		lines.push(`\tif [[ "$cword" -eq 1 ]]; then`)
		lines.push(`\t\tCOMPREPLY=($(compgen -W "${commandList}" -- "$cur"))`)
		lines.push(`\t\treturn 0`)
		lines.push(`\tfi`)
		lines.push('')
		lines.push(`\tif [[ "$cur" == --* ]]; then`)
		lines.push(`\t\tCOMPREPLY=($(compgen -W "${optionList}" -- "$cur"))`)
		lines.push(`\t\treturn 0`)
		lines.push(`\tfi`)
		lines.push('')
		lines.push(`\tif [[ "$cur" == -* && "$cur" != --* ]]; then`)
		lines.push(`\t\tCOMPREPLY=($(compgen -W "${shortOptionList}" -- "$cur"))`)
		lines.push(`\t\treturn 0`)
		lines.push(`\tfi`)
		lines.push(`}`)
		lines.push('')
		lines.push(`complete -F _${appName} ${appName}`)
		
		return lines.join('\n')
	}

	/**
	 * Extract all commands from command structure.
	 *
	 * @param {Object} commandStructure
	 * @returns {Array<{name: string, help?: string}>}
	 */
	static getAllCommands(commandStructure) {
		const commands = []

		// Extract root-level commands
		if (commandStructure.commands) {
			for (const [name, config] of Object.entries(commandStructure.commands)) {
				commands.push({
					name,
					help: config.help || config.description || name,
				})
			}
		}

		// Extract from Messages if available
		if (commandStructure.Messages) {
			for (const MessageClass of commandStructure.Messages) {
				if (MessageClass.name && MessageClass.name !== 'Message') {
					commands.push({
						name: MessageClass.name.toLowerCase(),
						help: MessageClass.help || MessageClass.description || MessageClass.name,
					})
				}
			}
		}

		return commands
	}

	/**
	 * Extract all options from command structure.
	 *
	 * @param {Object} commandStructure
	 * @returns {Array<{long: string, short?: string, help?: string}>}
	 */
	static getAllOptions(commandStructure) {
		const options = []

		// Extract from static properties if it's a Model class
		if (commandStructure.constructor && commandStructure.constructor !== Object) {
			const ModelClass = commandStructure.constructor
			for (const [prop, schema] of Object.entries(ModelClass)) {
				if (prop === 'length' || prop === 'name' || prop === 'prototype') continue
				
				if (schema && typeof schema === 'object' && (schema.type || schema.help)) {
					const option = {
						long: prop,
						help: schema.help || schema.description,
					}
					
				if (schema.alias) {
						option.short = schema.alias
					} else if (typeof prop === 'string' && prop.length === 1) {
						option.short = prop
					}
					
				options.push(option)
				}
			}
		}

		// Extract from options object
		if (commandStructure.options) {
			for (const [name, config] of Object.entries(commandStructure.options)) {
				if (Array.isArray(config)) {
					options.push({
						long: name,
						short: config[2] || undefined, // [type, default, alias/short]
						help: config[3] || name,
					})
				} else if (config && typeof config === 'object') {
					options.push({
						long: name,
						short: config.alias || config.short,
						help: config.help || config.description || name,
					})
				}
			}
		}

		return options
	}

	/**
	 * Extract command structure from a Model class.
	 *
	 * @param {Function | Object} ModelClass - Model class or object to analyze
	 * @returns {Object} Command structure
	 */
	static extractCommandStructure(ModelClass) {
		const structure = {
			Messages: [],
			commands: {},
			options: {},
		}

		// If it's a function (class), analyze its static properties
		if (typeof ModelClass === 'function') {
			// ModelClass is a constructor function - safe to push
			/** @type {any[]} */ (structure.Messages).push(ModelClass)
			
			// Copy static properties that define the schema
			for (const [prop, schema] of Object.entries(ModelClass)) {
				if (prop === 'length' || prop === 'name' || prop === 'prototype') continue
				
				if (schema && typeof schema === 'object') {
					// This is a field definition
					if (schema.type || schema.help || schema.default !== undefined) {
						structure.options[prop] = schema
					}
				}
			}
		}

		return structure
	}
}