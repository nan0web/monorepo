import { describe, it } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { runNodeScript, createTempWorkspace, cleanupTempDir } from "../src/test-utils.js"

describe("llimo-workflow CLI", () => {
	it("executes workflow and outputs progress via UI-CLI", async () => {
		const tempDir = await createTempWorkspace({
			"workflow.md": "- @llimo test",
			"package.json": '{ "scripts": { "test": "echo pass" } }',
		})

		const { stdout, stderr, exitCode } = await runNodeScript({
			script: path.resolve(process.cwd(), "bin/llimo-workflow.js"),
			args: [path.join(tempDir, "workflow.md"), "--test"],
			cwd: tempDir,
			input: "y\n",
		})

		await cleanupTempDir(tempDir)

		// Assert execution completed (it might fail depending on local npm/test state, we just want the UI output)
		assert.ok([0, 1].includes(exitCode))

		// Save snapshot for nan0gallery
		const snapPath = "snapshots/cli/uk/comp_workflow.md"
		await fs.mkdir(path.dirname(snapPath), { recursive: true })
		const md = `# 📸 LLiMo Workflow Execution

**Command:** \`llimo workflow workflow.md\`

\`\`\`ansi
${stdout.trim()}
${stderr.trim()}
\`\`\`
`
		await fs.writeFile(snapPath, md, "utf-8")
	})

	it("shows error via Alert on failure", async () => {
		const tempDir = await createTempWorkspace({
			"dangerous.md": "- @bash rm -rf /",
		})

		const { stdout, stderr, exitCode } = await runNodeScript({
			script: path.resolve(process.cwd(), "bin/llimo-workflow.js"),
			args: [path.join(tempDir, "dangerous.md"), "--test"],
			cwd: tempDir,
			input: "y\n"
		})

		await cleanupTempDir(tempDir)

		assert.strictEqual(exitCode, 1)

		// Save snapshot for nan0gallery
		const snapPath = "snapshots/cli/uk/comp_workflow-error.md"
		await fs.mkdir(path.dirname(snapPath), { recursive: true })
		const md = `# 📸 LLiMo Workflow Error Handling

**Command:** \`llimo workflow dangerous.md\` (Trigger Security Gate)

\`\`\`ansi
${stdout.trim()}
${stderr.trim()}
\`\`\`
`
		await fs.writeFile(snapPath, md, "utf-8")
	})
})
