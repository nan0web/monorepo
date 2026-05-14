#!/usr/bin/env node

import process from 'node:process'

import Logger from '@nan0web/log'
import { Chat, Contact, Message } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

export async function runInteractiveChat(console) {
	console.clear()
	console.success('Interactive Chat Demo')

	// Create contacts
	const system = new Contact({ type: Contact.EMAIL, value: 'system@nan0web.org' })
	const alice = new Contact({ type: Contact.EMAIL, value: 'alice@example.com' })
	const bob = new Contact({ type: Contact.EMAIL, value: 'bob@example.com' })
	const charlie = new Contact({ type: Contact.EMAIL, value: 'charlie@example.com' })

	// Initialize chat with some messages
	let chat = new Chat({
		author: system,
		body: 'Welcome to the interactive chat demo!',
		time: Date.now() - 5000,
	})

	chat.recent.next = new Chat({
		author: alice,
		body: "Hi there! I'm Alice.",
		time: Date.now() - 3000,
	})

	chat.recent.next = new Chat({
		author: charlie,
		body: 'Hello! Charlie here.',
		time: Date.now() - 1000,
	})

	// Display initial chat
	console.info('Displaying initial chat messages:\n')
	console.info(String(chat))

	await pressAnyKey(console)

	// Interactive Bob typing simulation
	console.info('\n' + '='.repeat(50))
	console.info('Bob is typing a new message (bottom section):')
	console.info('='.repeat(50))

	// Reserve space for user input (2 lines)
	process.stdout.write('\n[Bob]: \n')

	// Simulate Bob typing his message
	const bobMessage = 'Hello everyone! This is Bob typing in real-time. '
	const fullBobMessage = bobMessage + "I'm demonstrating letter-by-letter animation. "
	const finalBobMessage = fullBobMessage + "Isn't this cool?"

	for (const char of finalBobMessage) {
		process.stdout.write(char)
		await new Promise((resolve) => setTimeout(resolve, 33))
	}

	// Add Bob's message to chat
	chat.recent.next = new Chat({
		author: bob,
		body: finalBobMessage,
		time: Date.now(),
	})

	// Show updated chat
	console.info('\n\n' + '='.repeat(50))
	console.info("Final chat with Bob's message included:")
	console.info('='.repeat(50))
	console.info(String(chat))

	await pressAnyKey(console)

	console.success('\nInteractive chat demo completed! 🌌')
}
