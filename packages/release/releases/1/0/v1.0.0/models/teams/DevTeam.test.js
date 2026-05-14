import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import DevTeam from "./DevTeam.js"

describe("DevTeam Model", () => {
	it("has a static name defined", () => {
		assert.equal(DevTeam.name, "Software development team")
	})

	it("references developer from members", () => {
		assert.ok(DevTeam.developer)
		assert.equal(DevTeam.developer.name, "YaRaSLove")
	})
})