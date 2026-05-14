import { Model } from '@nan0web/types'
import { resolveDefaults, resolveAliases } from '@nan0web/types'

/**
 * SecurityGateModel - Enforces security policies for LLiMo workflow commands.
 * Blocks dangerous bash commands, sudo/eval, and unregistered proxies.
 */
export class SecurityGateModel extends Model {


	static allowedProxies = {
		help: 'Allowed proxies list',
		default: ['@bash', '@web', '@validate', '@get', '@ls', '@llimo'],
		type: 'array',
		validate: (val) => val && val.length > 0 ? true : SecurityGateModel.UI.errNoProxies,
	}

	static forbiddenPatterns = {
		help: 'Forbidden string patterns or regexes',
		default: [ 'rm -rf /', 'sudo ', 'eval ', ':(){ :|:& };:', 'mv .* /dev/null' ],
		type: 'array',
	}

	static UI = {
		errorBlockedPattern: 'Security Violation: Dangerous pattern detected in command: {0}',
		errorUnregisteredProxy: 'Security Violation: Proxy tool not allowed: {0}',
		errNoProxies: 'Must provide at least one allowed proxy',
	}

	constructor(data = {}) {
		super(data)
		/** @type {any[]} Allowed proxies list */ this.allowedProxies = this.allowedProxies || SecurityGateModel.allowedProxies.default
		/** @type {any} Forbidden string patterns or regexes */ this.forbiddenPatterns = this.forbiddenPatterns || SecurityGateModel.forbiddenPatterns.default
	}

	/**
	 * Validates a command and its arguments.
	 *
	 * @param {string} proxy
	 * @param {string[]} args
	 * @returns {true | string} True if ok, or error message $key
	 */
	static validate(proxy, args) {
		const model = new SecurityGateModel() // Instantiate to get defaults or current context
		const fullCommand = args.join(' ')
		if (!model.allowedProxies.includes(proxy)) {
			return SecurityGateModel.UI.errorUnregisteredProxy.replace('{0}', proxy)
		}
		for (const pattern of model.forbiddenPatterns) {
			if (typeof pattern === 'string' && fullCommand.includes(pattern)) {
				return SecurityGateModel.UI.errorBlockedPattern.replace('{0}', fullCommand)
			}
			if (pattern instanceof RegExp && pattern.test(fullCommand)) {
				return SecurityGateModel.UI.errorBlockedPattern.replace('{0}', fullCommand)
			}
		}

		return true
	}
}
