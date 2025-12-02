import { describe, it, afterEach } from "node:test"
import assert from "node:assert"
import Logger from "@nan0web/log"
import { createOutputProgress, pause } from "./cli.js"

const example = [
	"! Running tests...",
	"1..15",
	"# tests 26",
	"# suites 15",
	"# pass 26",
	"# fail 0",
	"# cancelled 0",
	"# skipped 0",
	"# todo 0",
	"# duration_ms 1314.626542",
]

describe("createOutputProgress() – real Logger", () => {
	let timer

	afterEach(() => {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	})

	it("returns a Timeout that can be cleared safely", () => {
		const logger = new Logger(Logger.detectLevel(process.argv))
		// Minimal input – a single line in `chunks`.
		timer = createOutputProgress({ logger, maxLines: 2, chunks: ["sample line"] })
		assert.ok(timer instanceof Object, "should be a timer object")
		// Let the interval tick once; then clear it.
		setTimeout(() => {
			clearInterval(timer)
			assert.ok(true, "interval cleared without error")
		}, 5)
	})

	it("should show proper chunks due the progress", async () => {
		class TrackLogger extends Logger {
			output = []
			info(...args) {
				this.output.push(args)
			}
		}
		const logger = new TrackLogger()
		const chunks = []
		const maxLines = 2
		const progress = createOutputProgress({ logger, chunks, fps: 1e2, maxLines })
		const blocks = []
		let block = []
		const copy = example.slice()
		while (copy.length) {
			const chunk = copy.shift()
			chunks.push(chunk)
			if (block.length === maxLines) {
				blocks.push(block)
				block = []
			}
			block.push(chunk)
			await pause(10)
		}
		if (block.length) blocks.push(block)
		clearInterval(progress)
		assert.deepStrictEqual(
			logger.output.join("\n").split("\n").map(s => {
				const arr = s.split("  ")
				if (arr.length === 1) return s
				return arr.slice(2).join("  ").trim()
			}),
			[
				"! Running tests...",
				"! Running tests...", '1..15',
				'1..15', '# tests 26',
				'# tests 26', '# suites 15',
				'# suites 15', '# pass 26',
				'# pass 26', '# fail 0',
				'# fail 0', '# cancelled 0',
				'# cancelled 0', '# skipped 0',
				'# skipped 0', '# todo 0',
				'# todo 0', '# duration_ms 1314.626542'
			]
		)
	})
})
