#!/usr/bin/env node

import { Contact } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

export async function runContactFormatsDemo(console) {
	console.clear()
	console.success('Contact Formats Demo')

	const contactExamples = [
		{
			description: 'Email',
			value: 'user@domain.com',
			type: Contact.EMAIL,
		},
		{
			description: 'Phone',
			value: '+1-234-567-8900',
			type: Contact.TELEPHONE,
		},
		{
			description: 'URL',
			value: 'https://example.com',
			type: Contact.URL,
		},
		{
			description: 'Address',
			value: 'Universe, Earth, Europe, UA, Kyiv, 123 Street',
			type: Contact.ADDRESS,
		},
		{
			description: 'Facebook',
			value: 'username',
			type: Contact.FACEBOOK,
		},
		{
			description: 'Instagram',
			value: 'handle',
			type: Contact.INSTAGRAM,
		},
		{
			description: 'LinkedIn',
			value: 'profile-id',
			type: Contact.LINKEDIN,
		},
		{
			description: 'Signal',
			value: '+1234567890',
			type: Contact.SIGNAL,
		},
		{
			description: 'Telegram',
			value: 'username',
			type: Contact.TELEGRAM,
		},
		{
			description: 'WhatsApp',
			value: '+1234567890',
			type: Contact.WHATSAPP,
		},
		{
			description: 'X (Twitter)',
			value: 'handle',
			type: Contact.X,
		},
	]

	console.info('Various contact types:\n')
	for (const example of contactExamples) {
		const contact = new Contact({ type: example.type, value: example.value })
		console.info(`${example.description}: ${contact}`)
		await pressAnyKey(console)
	}

	console.success('\nContact formats demo complete! 📇')
}
