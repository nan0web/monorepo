import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ListCommand } from "./list.js"
import DB from "@nan0web/db"

describe("ListCommand", () => {
	it("creates instance correctly", () => {
		const db = new DB()
		const cmd = new ListCommand({}, { db })
		assert.strictEqual(cmd.constructor.name, "list")
		assert.strictEqual(ListCommand.name, "list")
		assert.ok(cmd instanceof ListCommand)
	})
	it("runs without error", async () => {
		// Create a fully memory-isolated DB with a mounted @chat DB
		const db = new DB()
		const chatDb = new DB({
			predefined: [
				["current", "chat-1"],
				["chat-1/messages.jsonl", []],
				["chat-2/messages.jsonl", []],
			]
		})
		db.mount("@chat", chatDb)
		await db.connect()

		const cmd = ListCommand.create({}, { db })
		const gen = cmd.run()
		let res = await gen.next()
		let count = 0
		while (!res.done) {
			count++
			const intent = res.value
			if (intent && intent.name === "ask" && intent.field === "choice") {
				res = await gen.next({ value: "1" })
			} else {
				res = await gen.next()
			}
		}
		assert.ok(count >= 1)
	})
})
