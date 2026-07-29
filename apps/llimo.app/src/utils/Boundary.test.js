import { describe, it } from "node:test"
import assert from "node:assert"
import { BoundaryProtocol } from "./Boundary.js"
import { FileProtocol } from "../FileProtocol.js"

describe("BoundaryProtocol.parse", () => {
	it("should parse files wrapped in boundary markers correctly", async () => {
		const source = [
			"Some introductory text",
			"---boundary:src/todoModel.js---",
			"export const todos = []",
			"export function addTodo(text) {",
			"\ttodos.push(text)",
			"}",
			"---boundary:src/todoModel.js---",
			"Some middle text",
			"---boundary:@bash---",
			"pnpm install",
			"---boundary:@bash---",
			"---boundary:@validate---",
			"- [src/todoModel.js](src/todoModel.js)",
			"- [Setting up](@bash)",
			"---boundary:@validate---"
		].join("\n")

		const result = await BoundaryProtocol.parse(source)

		assert.equal(result.correct.length, 3)
		assert.equal(result.correct[0].filename, "src/todoModel.js")
		assert.equal(result.correct[0].content, "export const todos = []\nexport function addTodo(text) {\n\ttodos.push(text)\n}\n")
		assert.equal(result.correct[1].filename, "@bash")
		assert.equal(result.correct[1].content, "pnpm install\n")
		assert.equal(result.correct[2].filename, "@validate")

		// Validation should pass since we delivered src/todoModel.js and @bash
		assert.ok(result.isValid)
	})

	it("should parse files when closing boundary matches format or is implicit", async () => {
		const source = [
			"---boundary:src/a.js---",
			"const a = 1",
			"---boundary:src/b.js---",
			"const b = 2",
			"---boundary---"
		].join("\n")

		const result = await BoundaryProtocol.parse(source)
		assert.equal(result.correct.length, 2)
		assert.equal(result.correct[0].filename, "src/a.js")
		assert.equal(result.correct[0].content, "const a = 1\n")
		assert.equal(result.correct[1].filename, "src/b.js")
		assert.equal(result.correct[1].content, "const b = 2\n")
	})

	it("should parse snippet boundaries with startLine and lineCount", async () => {
		const source = [
			"---boundary:src/a.js:10:3---",
			"const a = 1",
			"const b = 2",
			"---boundary---"
		].join("\n")

		const result = await BoundaryProtocol.parse(source)
		assert.equal(result.correct.length, 1)
		assert.equal(result.correct[0].filename, "src/a.js")
		assert.equal(result.correct[0].startLine, 10)
		assert.equal(result.correct[0].lineCount, 3)
		assert.equal(result.correct[0].content, "const a = 1\nconst b = 2\n")
	})
})

describe("FileProtocol.parseAdaptive", () => {
	it("should use BoundaryProtocol when boundary marker is present", async () => {
		const source = [
			"---boundary:src/a.js---",
			"const a = 1",
			"---boundary:src/a.js---"
		].join("\n")

		const result = await FileProtocol.parseAdaptive(source)
		assert.equal(result.correct.length, 1)
		assert.equal(result.correct[0].filename, "src/a.js")
		assert.equal(result.correct[0].content, "const a = 1\n")
	})

	it("should fallback to MarkdownProtocol when boundary marker is not present", async () => {
		const source = [
			"#### [src/a.js](src/a.js)",
			"```javascript",
			"const a = 1",
			"```"
		].join("\n")

		const result = await FileProtocol.parseAdaptive(source)
		assert.equal(result.correct.length, 1)
		assert.equal(result.correct[0].filename, "src/a.js")
		assert.equal(result.correct[0].content, "const a = 1\n")
	})
})
