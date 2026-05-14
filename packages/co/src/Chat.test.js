import { describe, it } from 'node:test'
import assert from 'node:assert'
import Chat from './Chat.js'
import Contact from './Contact.js'

describe('Chat class', () => {
	it('should create instance with default values', () => {
		const chat = new Chat()
		assert.strictEqual(chat.body, '')
		assert.ok(chat.time instanceof Date)
		assert.ok(chat.author instanceof Contact)
		assert.strictEqual(chat.next, null)
	})

	it('should create instance with provided values', () => {
		const author = new Contact({ type: Contact.EMAIL, value: 'test@example.com' })
		const next = new Chat({ body: 'next message' })
		const body = 'Hello world'
		const time = 1700000000000
		const chat = new Chat({
			author: author,
			next: next,
			body: body,
			time: time,
		})

		assert.strictEqual(chat.body, body)
		assert.strictEqual(chat.time.getTime(), time)
		assert.strictEqual(chat.author, author)
		assert.strictEqual(chat.next, next)
	})

	it('should convert to string representation', () => {
		const author = new Contact({ type: Contact.EMAIL, value: 'test@example.com' })
		const body = 'Hello world'
		const time = 1700000000000
		const chat = new Chat({
			author: author,
			body: body,
			time: time,
		})

		const expected = `${new Date(time).toISOString()} ${author}\n${body}\n`
		assert.strictEqual(String(chat), expected)
	})

	it('should handle string input in constructor', () => {
		const body = 'Direct string input'
		const chat = new Chat(body)

		assert.ok(chat instanceof Chat)
		assert.strictEqual(chat.body, body)
	})

	it('should return same instance when from receives Chat', () => {
		const original = new Chat({ body: 'test' })
		const returned = Chat.from(original)

		assert.strictEqual(original, returned)
	})

	it('should build chat chain for 2 persons with up to 12 messages', () => {
		const messages = [
			{ author: 'alice@example.com', body: 'Hi Bob! What a nice day today, really?' },
			{ author: 'bob@example.com', body: 'Hello Alice! Seems so. Where are you going?' },
			{ author: 'alice@example.com', body: 'Just going to the park. Want to join?' },
			{ author: 'bob@example.com', body: "Sure, I'll meet you there in 10 minutes." },
			{ author: 'alice@example.com', body: 'Great, see you soon!' },
			{ author: 'bob@example.com', body: "Don't forget to bring water!" },
			{ author: 'alice@example.com', body: 'Will do! Anything else?' },
			{ author: 'bob@example.com', body: 'No, that should be fine. See you at the park!' },
			{ author: 'alice@example.com', body: 'Perfect, looking forward to it!' },
			{ author: 'bob@example.com', body: "Same here, it'll be nice to catch up." },
			{ author: 'alice@example.com', body: "Absolutely, it's been too long." },
			{ author: 'bob@example.com', body: 'See you soon, Alice!' },
		]

		const root = Chat.from(messages)

		let current = root
		for (let i = 0; i < messages.length; i++) {
			assert.equal(current.author.value, messages[i].author)
			assert.equal(current.body, messages[i].body)
			current = current.next
		}
		assert.equal(current, null)
		assert.equal(root.size, 12)
	})

	it('should build chat chain for 3 persons with up to 18 messages', () => {
		const alice = new Contact({ type: Contact.EMAIL, value: 'alice@example.com' })
		const bob = new Contact({ type: Contact.EMAIL, value: 'bob@example.com' })
		const charlie = new Contact({ type: Contact.EMAIL, value: 'charlie@example.com' })

		let chat = null
		const authors = [alice, bob, charlie]
		let authorIndex = 0

		// Create 18 messages with rotating authors
		for (let i = 1; i <= 18; i++) {
			const messageBody = `Message ${i}`
			if (chat === null) {
				chat = new Chat({ author: authors[authorIndex], body: messageBody })
			} else {
				let last = chat
				while (last.next) last = last.next
				last.next = new Chat({ author: authors[authorIndex], body: messageBody })
			}
			// Rotate authors
			authorIndex = (authorIndex + 1) % authors.length
		}

		// Verify chat chain
		let current = chat
		let count = 0
		let expectedAuthorIndex = 0

		while (current !== null) {
			count++
			assert.ok(current instanceof Chat)
			assert.strictEqual(current.author, authors[expectedAuthorIndex])
			assert.strictEqual(current.body, `Message ${count}`)

			// Rotate expected authors
			expectedAuthorIndex = (expectedAuthorIndex + 1) % authors.length
			current = current.next
		}

		assert.strictEqual(count, 18)
	})
})
