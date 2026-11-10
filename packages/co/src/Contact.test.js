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
		assert.equal(contact.toString(), Contact.ADDRESS)
	})

	it('Contact constructor with string input uses parse', () => {
		const input = Contact.EMAIL + 'test@example.com'
		const contact = Contact.from(input)
		assert.equal(contact.type, Contact.EMAIL)
		assert.equal(contact.value, 'test@example.com')
		assert.equal(contact.toString(), input)
	})

	it('Contact constructor with object input', () => {
		const props = { type: Contact.TELEPHONE, value: '+1234567890' }
		const contact = new Contact(props)
		assert.equal(contact.type, Contact.TELEPHONE)
		assert.equal(contact.value, '+1234567890')
		assert.equal(contact.toString(), Contact.TELEPHONE + '+1234567890')
	})

	it('Contact.parse recognizes known prefixes, besides URL', () => {
		const prefixes = [
			Contact.ADDRESS,
			Contact.EMAIL,
			Contact.FACEBOOK,
			Contact.INSTAGRAM,
			Contact.LINKEDIN,
			Contact.SIGNAL,
			Contact.SKYPE,
			Contact.TELEGRAM,
			Contact.VIBER,
			Contact.WHATSAPP,
			Contact.X,
			Contact.TELEPHONE,
		]
		for (const prefix of prefixes) {
			const value = 'value123'
			const input = prefix + value
			const contact = Contact.parse(input)
			assert.equal(contact.type, prefix)
			assert.equal(contact.value, value)
			assert.equal(contact.toString(), input)
		}
	})

	it('Contact.parse detects email without prefix', () => {
		const email = 'user@example.com'
		const contact = Contact.parse(email)
		assert.equal(contact.type, Contact.EMAIL)
		assert.equal(contact.value, email)
		assert.equal(contact.toString(), Contact.EMAIL + email)
	})

	it('Contact.parse detects telephone without prefix', () => {
		const phone = '+1 (234) 567-8900'
		const contact = Contact.parse(phone)
		assert.equal(contact.type, Contact.TELEPHONE)
		assert.equal(contact.value, phone)
		assert.equal(contact.toString(), Contact.TELEPHONE + phone)
	})

	it('Contact.parse detects website without prefix', () => {
		const url = 'https://example.com'
		const contact = Contact.parse(url)
		assert.equal(contact.type, Contact.URL)
		assert.equal(contact.value, 'https://example.com')
		assert.equal(String(contact), url)
	})

	it('Contact.parse defaults to address for unknown format', () => {
		const address = '123 Main St'
		const contact = Contact.parse(address)
		assert.equal(contact.type, Contact.ADDRESS)
		assert.equal(contact.value, address)
		assert.equal(contact.toString(), Contact.ADDRESS + address)
	})

	it('Contact.from returns same instance if input is Contact', () => {
		const contact = new Contact({ type: Contact.EMAIL, value: 'a@b.com' })
		const result = Contact.from(contact)
		assert.strictEqual(result, contact)
	})

	it('Contact.from creates new instance if input is not Contact', () => {
		const props = { type: Contact.TELEPHONE, value: '123456' }
		const result = Contact.from(props)
		assert.ok(result instanceof Contact)
		assert.equal(result.type, props.type)
		assert.equal(result.value, props.value)
	})

	describe('toText() international phone formatting', () => {
		it('formats Ukrainian numbers (+380)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+380991234567' })
			assert.equal(c.toText(), '+380 (99) 123-4567')
		})

		it('formats Finnish standard mobile numbers (+358)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+358401234567' })
			assert.equal(c.toText(), '+358 (40) 123-4567')
		})

		it('preserves Finnish short & premium rate service numbers without distortion', () => {
			// Emergency number
			const emergency = new Contact({ type: Contact.TELEPHONE, value: '112' })
			assert.equal(emergency.toText(), '112')

			// Short service code (e.g. 10041)
			const shortCode = new Contact({ type: Contact.TELEPHONE, value: '10041' })
			assert.equal(shortCode.toText(), '10041')

			// Finnish premium rate national format (0600, 0700 series)
			const premium = new Contact({ type: Contact.TELEPHONE, value: '060012345' })
			assert.equal(premium.toText(), '060012345')
		})

		it('formats UK numbers (+44)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+447911123456' })
			assert.equal(c.toText(), '+44 (791) 112-3456')
		})

		it('formats US/Canada numbers (+1)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+12345678901' })
			assert.equal(c.toText(), '+1 (234) 567-8901')
		})

		it('formats Post-Soviet +7 numbers (Kazakhstan/Russia)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+79991234567' })
			assert.equal(c.toText(), '+7 (999) 123-45-67')
			assert.equal(c.toString(), 'tel:+79991234567')
			const json = JSON.parse(JSON.stringify(c))
			assert.equal(json.type, Contact.TELEPHONE)
			assert.equal(json.value, '+79991234567')
		})

		it('formats Middle East / UAE numbers (+971)', () => {
			const c = new Contact({ type: Contact.TELEPHONE, value: '+971501234567' })
			assert.equal(c.toText(), '+971 (50) 123-4567')
			assert.equal(c.toString(), 'tel:+971501234567')
			const json = JSON.parse(JSON.stringify(c))
			assert.equal(json.type, Contact.TELEPHONE)
			assert.equal(json.value, '+971501234567')
		})

		it('formats African numbers (Egypt +20, South Africa +27)', () => {
			const egypt = new Contact({ type: Contact.TELEPHONE, value: '+201012345678' })
			assert.equal(egypt.toText(), '+20 (101) 234-5678')
			assert.equal(egypt.toString(), 'tel:+201012345678')

			const sa = new Contact({ type: Contact.TELEPHONE, value: '+27821234567' })
			assert.equal(sa.toText(), '+27 (821) 234-567')
			assert.equal(sa.toString(), 'tel:+27821234567')
		})

		it('formats Caucasus and Central Asia (+995 Georgia, +998 Uzbekistan)', () => {
			const georgia = new Contact({ type: Contact.TELEPHONE, value: '+995591234567' })
			assert.equal(georgia.toText(), '+995 (59) 123-4567')
			assert.equal(georgia.toString(), 'tel:+995591234567')

			const uzbek = new Contact({ type: Contact.TELEPHONE, value: '+998901234567' })
			assert.equal(uzbek.toText(), '+998 (90) 123-4567')
		})

		it('preserves clean stringify / serialization contract across all phone formats', () => {
			const numbers = ['+380991234567', '+358401234567', '+79991234567', '+971501234567']
			for (const num of numbers) {
				const contact = Contact.parse(num)
				assert.equal(contact.type, Contact.TELEPHONE)
				assert.equal(contact.value, num)
				assert.equal(contact.toString(), `tel:${num}`)
				const parsed = JSON.parse(JSON.stringify(contact))
				assert.equal(parsed.value, num)
			}
		})
	})
})
