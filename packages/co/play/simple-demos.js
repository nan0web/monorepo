#!/usr/bin/env node

import Logger from '@nan0web/log'
import { to, FullObject } from '@nan0web/types'
import { Chat, Contact, Message } from '../src/index.js'
import { next, pause } from '@nan0web/ui-cli'

export async function runSimpleDemos(console) {
	console.clear()
	await pause(33)
	console.success('Welcome to @nan0web/co Playground')
	console.info('Demonstrating core communication classes')

	// --- Message Demo ---
	console.info('\n📝 Message Class Demo')

	const message = new Message({
		body: 'Hello from the universe!',
		time: Date.now(),
	})

	console.info(`Message as rendered JSON object:\n`)
	console.info(JSON.stringify(to(FullObject)(message), null, 2))

	console.info(`\nMessage as string:\n\n"${String(message)}"`)

	await pressAnyKey(console)

	// --- Contact Demo ---
	console.info('\n👤 Contact Class Demo')

	const contacts = [
		Contact.from('alice@example.com'),
		Contact.from('+1234567890'),
		Contact.from('https://github.com/nan0web'),
		new Contact({ type: Contact.ADDRESS, value: '123 Main St, Universe' }),
	]

	for (const contact of contacts) {
		console.info(`${contact.constructor.name}: ${contact.toString()}`)
		await pause(333)
	}
	await pressAnyKey(console)

	// --- Chat Demo ---
	console.info('\n💬 Chat Class Demo')

	const alice = new Contact({ type: Contact.EMAIL, value: 'alice@example.com' })
	const bob = new Contact({ type: Contact.EMAIL, value: 'bob@example.com' })
	const charlie = new Contact({ type: Contact.EMAIL, value: 'charlie@example.com' })

	const chatMessages = [
		{ author: alice, body: "Hey everyone, let's plan our universe trip!" },
		{ author: bob, body: "Great idea! I'm in." },
		{ author: charlie, body: 'Count me too. When?' },
		{ author: alice, body: 'How about next cosmic cycle?' },
		{ author: bob, body: 'Perfect, that gives us time to prepare.' },
		{ author: charlie, body: "Agreed. Let's make it happen!" },
	]

	let chat = null
	for (const msg of chatMessages) {
		if (chat === null) {
			chat = new Chat(msg)
		} else {
			chat.recent.next = new Chat(msg)
		}
	}

	console.info(`Chat chain size: ${chat.size}`)
	console.info('Chat content:')
	console.info(String(chat))

	console.success('\nSimple demos completed! ✨')
	await pressAnyKey(console)
}

let keyPressHandlerRegistered = false

export async function pressAnyKey(console) {
	if (!keyPressHandlerRegistered) {
		process.stdin.setMaxListeners(process.stdin.getMaxListeners() + 1)
		keyPressHandlerRegistered = true
	}

	console.info('\n--- press any key ---')
	await next()
	console.clearLine(console.cursorUp())
}
