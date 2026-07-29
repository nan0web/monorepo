export class MailValidator {
	/**
	 * Validates MX by checking if the MX target resolves to the server's IP address.
	 * Resolves the aaPanel bug where the MX record is forced to match the local domain name.
	 * @param {string} domain
	 * @param {string} serverIp
	 * @param {object} dnsResolver
	 * @returns {Promise<boolean>}
	 */
	static async validateMx(domain, serverIp, dnsResolver) {
		try {
			const mxRecords = await dnsResolver.resolveMx(domain)
			if (!mxRecords || mxRecords.length === 0) return false

			for (const record of mxRecords) {
				const ips = await dnsResolver.resolveA(record.exchange)
				if (ips.includes(serverIp)) {
					return true
				}
			}
			return false
		} catch {
			return false
		}
	}

	/**
	 * Validates PTR by verifying Forward-Confirmed Reverse DNS (FCrDNS) on the server's IP.
	 * Resolves the aaPanel bug where it expects a distinct PTR for each tenant domain.
	 * @param {string} serverIp
	 * @param {object} dnsResolver
	 * @returns {Promise<boolean>}
	 */
	static async validatePtr(serverIp, dnsResolver) {
		try {
			const hostnames = await dnsResolver.reverse(serverIp)
			if (!hostnames || hostnames.length === 0) return false

			for (const hostname of hostnames) {
				const ips = await dnsResolver.resolveA(hostname)
				if (ips.includes(serverIp)) {
					return true
				}
			}
			return false
		} catch {
			return false
		}
	}

	/**
	 * Validates DKIM configuration by checking the TXT record at {selector}._domainkey.{domain}.
	 * @param {string} domain
	 * @param {string} selector
	 * @param {object} dnsResolver
	 * @returns {Promise<boolean>}
	 */
	static async validateDkim(domain, selector, dnsResolver) {
		try {
			const recordName = `${selector}._domainkey.${domain}`
			const records = await dnsResolver.resolveTxt(recordName)
			if (!records || records.length === 0) return false

			// resolveTxt returns an array of arrays of strings
			const flatRecords = records.flat().join('')
			return flatRecords.includes('v=DKIM1') && flatRecords.includes('p=')
		} catch {
			return false
		}
	}

	/**
	 * Validates DMARC configuration by checking the TXT record at _dmarc.{domain}.
	 * @param {string} domain
	 * @param {object} dnsResolver
	 * @returns {Promise<boolean>}
	 */
	static async validateDmarc(domain, dnsResolver) {
		try {
			const recordName = `_dmarc.${domain}`
			const records = await dnsResolver.resolveTxt(recordName)
			if (!records || records.length === 0) return false

			const flatRecords = records.flat().join('')
			return flatRecords.includes('v=DMARC1') && flatRecords.includes('p=')
		} catch {
			return false
		}
	}

	/**
	 * Checks if the server's IP address is listed in major DNSBL lists.
	 * @param {string} serverIp
	 * @param {object} dnsResolver
	 * @returns {Promise<string[]>} List of blacklists where the IP is found
	 */
	static async checkBlacklists(serverIp, dnsResolver) {
		const rbls = [
			'zen.spamhaus.org',
			'b.barracudacentral.org',
			'bl.spamcop.net'
		]
		const reverseIp = serverIp.split('.').reverse().join('.')
		const listed = []

		for (const rbl of rbls) {
			try {
				const ips = await dnsResolver.resolveA(`${reverseIp}.${rbl}`)
				if (ips && ips.length > 0) {
					listed.push(rbl)
				}
			} catch {
				// NXDOMAIN means not blacklisted
			}
		}

		return listed
	}
}

export default MailValidator
