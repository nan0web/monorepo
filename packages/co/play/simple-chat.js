#!/usr/bin/env node

import Logger from '@nan0web/log'
import { Chat, Contact } from '../src/index.js'

const console = new Logger({ level: 'info', icons: true, chromo: true })

console.clear()
console.success('Simple Chat Demo')
console.info('Showing how to build a conversation chain')

// Create contacts
const alice = new Contact({ type: Contact.EMAIL, value: 'alice@example.com' })
const bob = new Contact({ type: Contact.EMAIL, value: 'bob@example.com' })
const charlie = new Contact({ type: Contact.EMAIL, value: 'charlie@example.com' })

// Create chat chain
const messages = [
	{ author: alice, body: "Hey everyone, let's plan our universe trip!" },
	{ author: bob, body: "Great idea! I'm in." },
	{ author: charlie, body: 'Count me too. When?' },
	{ author: alice, body: 'How about next cosmic cycle?' },
	{ author: bob, body: 'Perfect, that gives us time to prepare.' },
	{ author: charlie, body: "Agreed. Let's make it happen!" },
]

// Build the chat
let chat = null
for (const msg of messages) {
	if (chat === null) {
		chat = new Chat(msg)
	} else {
		chat.recent.next = new Chat(msg)
	}
}

console.info('Full conversation:\n')
console.info(String(chat))

console.success('\nSimple chat demo complete! 🌌')
