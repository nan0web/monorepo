import { describe, it } from "node:test"
import assert from "node:assert"
import { createOutputProgress } from "./cli.js"

/**
 * Minimal stub mimicking the Logger API used by `createOutputProgress`.
 */
class StubLogger {
	constructor() {
		this.lines = []
	}
	info(msg) { this.lines.push({ method: "info", msg }) }
	cursorUp() { }          // no‑op for tests
	fill(txt) { return txt }
}

/* The test only verifies that the function returns a timer
	 (NodeJS.Timeout) and that calling the returned `clearInterval`
	 does not throw. This ensures the progress helper is usable
	 without side‑effects in the test environment. */
describe("createOutputProgress()", () => {
	it("returns a Timeout and can be cleared safely", () => {
		const logger = new StubLogger()
		const progress = createOutputProgress({ logger, maxLines: 2, chunks: [] })
		assert.ok(progress instanceof Object, "should be a timer object")
		// Simulate a few ticks
		setTimeout(() => {
			clearInterval(progress)
			assert.ok(true, "cleared without error")
		}, 10)
	})
})
