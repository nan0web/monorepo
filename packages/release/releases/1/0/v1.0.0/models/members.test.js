import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import members from "./members.js"

describe("Members Model", () => {
	it("exports YaRaSLove as a member", () => {
		assert.ok(members.YaRaSLove)
		assert.equal(members.YaRaSLove.name, "YaRaSLove")
	})

	it("YaRaSLove has three contacts", () => {
		const yar = members.YaRaSLove
		assert.equal(yar.contacts.length, 3)
	})

	it("YaRaSLove includes a valid GPG key", () => {
		const yar = members.YaRaSLove
		assert.equal(yar.gpgKey, "?")
	})
})
