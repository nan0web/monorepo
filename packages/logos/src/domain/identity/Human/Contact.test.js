import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Contact from './Contact.js'

describe('Contact', () => {
	const tests = [
		['test@example.com', 'mailto:test@example.com'],
		['+1234567890', 'tel:+1234567890'],
		['https://example.com', 'https://example.com'],
		['123 Main St', 'address:123 Main St'],
	]

	for (const [input, expected] of tests) {
		it(`Contact.parse(${input})`, () => {
			const contact = Contact.parse(input)
			assert.equal(String(contact), expected)
		})
	}

	it('Contact default constructor', () => {
		const contact = new Contact()
		assert.equal(contact.type, Contact.ADDRESS)
		assert.equal(contact.value, '')
		assert.equal(contact.toString(), 'address:')
	})

	it('Contact constructor with string input uses parse', () => {
		const input = 'test@example.com'
		const contact = Contact.from(input)
		assert.equal(contact.type, Contact.EMAIL)
		assert.equal(contact.value, input)
		assert.equal(contact.toString(), 'mailto:' + input)
	})

	it('Contact constructor with object input', () => {
		const contact = new Contact({ type: 'tel:', value: '+1234567890' })
		assert.equal(contact.type, Contact.TELEPHONE)
		assert.equal(contact.value, '+1234567890')
		assert.equal(contact.toString(), 'tel:+1234567890')
	})

	const testCases = [
		{ input: 'address:123 Main St', type: Contact.ADDRESS, value: '123 Main St' },
		{ input: 'mailto:test@example.com', type: Contact.EMAIL, value: 'test@example.com' },
		{ input: 'tel:+1234567890', type: Contact.TELEPHONE, value: '+1234567890' },
		{ input: 'https://www.facebook.com/username', type: Contact.FACEBOOK, value: 'username' },
		{ input: 'https://www.instagram.com/username', type: Contact.INSTAGRAM, value: 'username' },
		{ input: 'https://www.linkedin.com/in/username', type: Contact.LINKEDIN, value: 'username' },
		{ input: 'https://signal.me/#p/username', type: Contact.SIGNAL, value: 'username' },
		{ input: 'skype:username', type: Contact.SKYPE, value: 'username' },
		{ input: 'https://t.me/username', type: Contact.TELEGRAM, value: 'username' },
		{ input: 'viber://chat?number=username', type: Contact.VIBER, value: 'username' },
		{ input: 'https://wa.me/username', type: Contact.WHATSAPP, value: 'username' },
		{ input: 'https://x.com/username', type: Contact.X, value: 'username' },
		{ input: 'https://example.com', type: Contact.URL, value: 'https://example.com' },
	]
	for (const { input, type, value } of testCases) {
		it('Contact.parse recognizes known prefixes for ' + input, () => {
			const contact = Contact.parse(input)
			assert.equal(contact.type, type)
			assert.equal(contact.value, value)
			assert.equal(contact.toString(), input)
		})
	}

	it('Contact.parse detects email without prefix', () => {
		const email = 'user@example.com'
		const contact = Contact.parse(email)
		assert.equal(contact.type, 'mailto:')
		assert.equal(contact.value, email)
		assert.equal(contact.toString(), 'mailto:' + email)
	})

	it('Contact.parse detects telephone without prefix', () => {
		const phone = '+1 (234) 567-8900'
		const contact = Contact.parse(phone)
		assert.equal(contact.type, 'tel:')
		assert.equal(contact.value, phone)
		assert.equal(contact.toString(), 'tel:' + phone)
	})

	it('Contact.parse detects website without prefix', () => {
		const url = 'https://example.com'
		const contact = Contact.parse(url)
		assert.equal(contact.type, '//')
		assert.equal(contact.value, 'https://example.com')
		assert.equal(contact.toString(), url)
	})

	it('Contact.parse defaults to address for unknown format', () => {
		const address = '123 Main St'
		const contact = Contact.parse(address)
		assert.equal(contact.type, 'address:')
		assert.equal(contact.value, address)
		assert.equal(contact.toString(), 'address:' + address)
	})

	it('Contact.from returns same instance if input is Contact', () => {
		const contact = new Contact({ type: 'mailto:', value: 'a@b.com' })
		const result = Contact.from(contact)
		assert.strictEqual(result, contact)
	})

	it('Contact.from creates new instance if input is not Contact', () => {
		const props = { type: 'tel:', value: '+1234567890' }
		const result = Contact.from(props)
		assert.ok(result instanceof Contact)
		assert.equal(result.type, 'tel:')
		assert.equal(result.value, props.value)
	})
})
