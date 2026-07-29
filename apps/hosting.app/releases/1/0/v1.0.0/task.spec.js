import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import { ModelError } from '@nan0web/types'

// We expect these imports to fail initially (Red state)
import { WebDomainSchema } from '../../../../src/domain/WebDomainSchema.js'
import { MailServerSchema } from '../../../../src/domain/MailServerSchema.js'
import { MailboxSchema } from '../../../../src/domain/MailboxSchema.js'
import { CdnSyncSchema } from '../../../../src/domain/CdnSyncSchema.js'
import { CaddyServerAdapter } from '../../../../src/adapters/CaddyServerAdapter.js'
import { HostingRunner } from '../../../../src/domain/HostingRunner.js'
import { MailValidator } from '../../../../src/domain/MailValidator.js'

describe('hosting.app MVP v1.0.0 Contract', () => {
	describe('WebDomainSchema', () => {
		it('should validate valid web domain configuration', () => {
			const config = new WebDomainSchema({
				domain: 'legalgreenplanet.tech',
				root: '/www/wwwroot/legalgreenplanet.tech',
				active: true,
				ssl_provider: "Let's Encrypt",
				proxy_port: 3000,
			})
			assert.equal(config.validate(), true)
			assert.equal(config.domain, 'legalgreenplanet.tech')
			assert.equal(config.proxy_port, 3000)
		})

		it('should throw ModelError on invalid domain or port', () => {
			let error = null
			try {
				new WebDomainSchema({
					domain: 'invalid_domain', // Invalid FQDN
					root: '/www/wwwroot/legalgreenplanet.tech',
					proxy_port: 99999, // Out of range
				}).validate()
			} catch (err) {
				error = err
			}
			assert.ok(error instanceof ModelError)
			assert.ok(error.fields.domain)
			assert.ok(error.fields.proxy_port)
		})
	})

	describe('MailServerSchema', () => {
		it('should apply defaults and validate correct mail server config', () => {
			const config = new MailServerSchema({
				mail_domain: 'mail.eaukraine.eu',
			})
			assert.equal(config.validate(), true)
			assert.equal(config.dkim_selector, 'default')
			assert.equal(config.dkim_key_size, '2048')
			assert.equal(config.spam_filter_active, true)
		})

		it('should fail validation on invalid mail domain', () => {
			let error = null
			try {
				new MailServerSchema({
					mail_domain: 'not-a-domain',
					dkim_key_size: '512', // Invalid option
				}).validate()
			} catch (err) {
				error = err
			}
			assert.ok(error instanceof ModelError)
			assert.ok(error.fields.mail_domain)
			assert.ok(error.fields.dkim_key_size)
		})
	})

	describe('MailboxSchema', () => {
		it('should validate and set default quota', () => {
			const mailbox = new MailboxSchema({
				domain: 'legalgreenplanet.tech',
				mailbox_username: 'icesquare',
				mailbox_password: 'super-secure-password-123',
			})
			assert.equal(mailbox.validate(), true)
			assert.equal(mailbox.quota_bytes, 1073741824n) // 1GB default
		})

		it('should fail on short password', () => {
			let error = null
			try {
				new MailboxSchema({
					domain: 'legalgreenplanet.tech',
					mailbox_username: 'icesquare',
					mailbox_password: '123', // Too short
				}).validate()
			} catch (err) {
				error = err
			}
			assert.ok(error instanceof ModelError)
			assert.ok(error.fields.mailbox_password)
		})
	})

	describe('CdnSyncSchema', () => {
		it('should validate default static and require token for Cloudflare', () => {
			const localCdn = new CdnSyncSchema({
				cdn_provider: 'Local Static',
			})
			assert.equal(localCdn.validate(), true)

			let error = null
			try {
				new CdnSyncSchema({
					cdn_provider: 'Cloudflare',
					// api_token missing
				}).validate()
			} catch (err) {
				error = err
			}
			assert.ok(error instanceof ModelError)
			assert.ok(error.fields.api_token)
		})
	})

	describe('CaddyServerAdapter', () => {
		it('should generate reverse proxy routing configuration block', () => {
			const adapter = new CaddyServerAdapter()
			const config = new WebDomainSchema({
				domain: 'legalgreenplanet.tech',
				root: '/www/wwwroot/legalgreenplanet.tech',
				proxy_port: 3000,
			})
			const caddyBlock = adapter.generateConfigBlock(config)
			assert.ok(caddyBlock.includes('reverse_proxy :3000'))
			assert.ok(caddyBlock.includes('legalgreenplanet.tech'))
		})
	})

	describe('HostingRunner', () => {
		it('should run domain provisioning generator flow', async () => {
			const runner = new HostingRunner({
				dnsResolver: {
					resolveA: async (domain) => {
						if (domain === 'legalgreenplanet.tech') return ['142.132.174.234']
						return []
					}
				}
			})

			const steps = []
			const domainInfo = {
				domain: 'legalgreenplanet.tech',
				root: '/www/wwwroot/legalgreenplanet.tech',
				proxy_port: 3000,
			}

			for await (const step of runner.run(domainInfo)) {
				steps.push(step)
			}

			// We expect progress steps to match our defined flow
			assert.ok(steps.some(s => s.type === 'progress' && s.status === 'init'))
			assert.ok(steps.some(s => s.type === 'progress' && s.status === 'validate'))
			assert.ok(steps.some(s => s.type === 'progress' && s.status === 'system'))
			assert.ok(steps.some(s => s.type === 'log' && s.message.includes('Домен приєднано')))
		})
	})

	describe('MailValidator', () => {
		const mockResolver = {
			resolveMx: async (domain) => {
				if (domain === 'legalgreenplanet.tech') {
					return [{ exchange: 'mail.eaukraine.eu', priority: 10 }]
				}
				return []
			},
			resolveA: async (host) => {
				if (host === 'mail.eaukraine.eu') return ['142.132.174.234']
				if (host === '4.3.2.1.abc.zen.spamhaus.org') return ['127.0.0.2'] // listed
				return []
			},
			reverse: async (ip) => {
				if (ip === '142.132.174.234') return ['mail.eaukraine.eu']
				return []
			},
			resolveTxt: async (name) => {
				if (name === 'default._domainkey.legalgreenplanet.tech') {
					return [['v=DKIM1;k=rsa;p=MIGfMA0GCSqGSIb3DQE']]
				}
				if (name === '_dmarc.legalgreenplanet.tech') {
					return [['v=DMARC1;p=quarantine;rua=mailto:admin@legalgreenplanet.tech']]
				}
				return []
			}
		}

		it('should validate MX successfully when target resolves to server IP', async () => {
			const isValid = await MailValidator.validateMx(
				'legalgreenplanet.tech',
				'142.132.174.234',
				mockResolver
			)
			assert.equal(isValid, true)
		})

		it('should validate PTR successfully with FCrDNS', async () => {
			const isValid = await MailValidator.validatePtr(
				'142.132.174.234',
				mockResolver
			)
			assert.equal(isValid, true)
		})

		it('should validate DKIM configuration', async () => {
			const isValid = await MailValidator.validateDkim(
				'legalgreenplanet.tech',
				'default',
				mockResolver
			)
			assert.equal(isValid, true)
		})

		it('should validate DMARC configuration', async () => {
			const isValid = await MailValidator.validateDmarc(
				'legalgreenplanet.tech',
				mockResolver
			)
			assert.equal(isValid, true)
		})

		it('should identify listed IP in checkBlacklists', async () => {
			const badResolver = {
				resolveA: async (host) => {
					// Simulate listed on spamhaus
					if (host.includes('zen.spamhaus.org')) return ['127.0.0.2']
					return []
				}
			}
			const listed = await MailValidator.checkBlacklists('1.2.3.4', badResolver)
			assert.deepEqual(listed, ['zen.spamhaus.org'])
		})
	})
})
