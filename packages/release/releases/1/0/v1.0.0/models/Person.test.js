import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import Person from "./Person.js"
import { Contact } from "@nan0web/co"

describe("Person Model", () => {
	it("constructs with default empty values", () => {
		const person = new Person()
		assert.equal(person.name, "")
		assert.deepEqual(person.contacts, [])
		assert.equal(person.gpgKey, null)
		assert.equal(person.revokedKey, null)
	})

	it("constructs with given input", () => {
		const input = {
			name: "Alice",
			contacts: ["https://example.com", "mailto:alice@example.com"],
			gpgKey: "KEY123",
			revokedKey: "OLDKEY456"
		}
		const person = new Person(input)
		assert.equal(person.name, "Alice")
		assert.equal(person.gpgKey, "KEY123")
		assert.equal(person.revokedKey, "OLDKEY456")
		assert.equal(person.contacts.length, 2)
		assert.ok(person.contacts[0] instanceof Contact)
		assert.ok(person.contacts[1] instanceof Contact)
	})

	it("can be created using static from method", () => {
		const input = { name: "Bob" }
		const person = Person.from(input)
		assert.ok(person instanceof Person)
		assert.equal(person.name, "Bob")
	})

	it("returns same instance when from receives Person", () => {
		const p1 = new Person({ name: "Charlie" })
		const p2 = Person.from(p1)
		assert.equal(p1, p2)
	})
})
