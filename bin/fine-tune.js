#!/usr/bin/env node
import FS from "@nan0web/db-fs"
import Logger from "@nan0web/log"

class BrowserableFS extends FS {
	async * browse(uri = ".", options = {}) {
		const { depth = 0, ignore = [] } = options
		this.console.debug("browse()", uri, { depth })
		await this.requireConnected()
		const entries = []
		const isExp = uri.includes("*") || uri.includes("?")
		const skip = path => {
			if (ignore.length && micromatch.any(path, ignore)) {
				return true
			}
			if (isExp && !micromatch(path, uri)) {
				return true
			}
			return false
		}
		if (this.loaded) {
			for (const [path] of this.meta) {
				if (skip(path)) continue
				yield path
			}
		} else {
			this.console.debug("browse().readDir()", uri)
			for await (const entry of this.readDir(this.root, { depth })) {
				if (skip(entry.path)) continue
				yield entry.path
			}
			this.console.debug("browse().readDir().done", uri, { root: this.root, entries })
		}
	}
}

const logger = new Logger(Logger.detectLevel(process.argv))
const fs = new BrowserableFS()

/**
 * Collect all .datasets/README.dataset.jsonl from {apps|packages}/+/.datasets /
 * and combine into a single .datasets/training.jsonl for fine-tuning.
 *
 * Converts each record to the messages format for MLX / llama.cpp fine - tuning.
 */
async function main(argv = process.argv.slice(2)) {
	logger.info('Collecting datasets for fine-tuning...')
	const isText = argv.includes("--text")

	await fs.connect()

	// Find all dataset files
	const ws = await fs.loadDocument("pnpm-workspace.yaml")
	const arr = ws.packages.filter(p => p.startsWith("packages/")).map(p => p.split("/").pop())
	const sets = new Map()
	for (const name of arr) {
		const ds = await fs.loadDocument(`packages/${name}/.datasets/README.dataset.jsonl`, [])
		if (ds.length) sets.set(name, ds)
	}
	logger.info(`Found ${sets.size} dataset files`)

	const allRecords = []

	const systemContent = "Context: @nan0web platform, Release Notes, CI/CD testing. Answer with working JavaScript code examples. Always include pnpm package manager. Use ES modules, no semicolons. Prefer vanilla JS and nan0web."

	// Load and parse each .jsonl file
	for (const [, ds] of sets.entries()) {
		for (const record of ds) {
			// Convert to messages format for fine-tuning
			// Assume record.instruction is like "How to ...?"
			// record.output contains code examples
			const instruction = record.instruction || ""
			const output = record.output || ""
			const input = record.input || ""
			const contextHeader = (record.context || []).join("\n")

			if (!instruction || !output) continue

			if (isText) {
				// Construct the "user" part of the conversation
				// We include context headers and input (markdown) to ground the instruction
				const parts = [
					contextHeader, // e.g. "h1:@nan0web/auth-core"
					input,         // e.g. "## Installation"
					instruction    // e.g. "How to install with npm?"
				]
				const userContent = parts.filter(Boolean).join("\n\n")

				// Construct the "assistant" part
				const assistantContent = output

				const text = `<|im_start|>system\n${systemContent}<|im_end|>\n<|im_start|>user\n${userContent}<|im_end|>\n<|im_start|>assistant\n${assistantContent}<|im_end|>`

				allRecords.push({ text })
			} else {
				const messagesRecord = {
					messages: [
						{
							role: 'system',
							content: systemContent
						},
						{
							role: 'user',
							content: record.instruction + '\n\n' + (record.input || '')
						},
						{
							role: 'assistant',
							content: record.output
						}
					]
				}
				allRecords.push(messagesRecord)
			}

		}
	}

	const trainPath = '.datasets/train.jsonl'
	const validPath = '.datasets/valid.jsonl'
	if (argv.includes("--valid")) {
		// Split 90/10
		const splitIndex = Math.floor(allRecords.length * 0.9)
		const trainData = allRecords.slice(0, splitIndex)
		const validData = allRecords.slice(splitIndex)
		await fs.saveDocument(trainPath, trainData)
		await fs.saveDocument(validPath, validData)
		logger.success(`✅ ${trainData.length} training examples to ${trainPath}`)
		logger.success(`🚨 ${validData.length} valid examples to ${validPath}`)
	} else {
		// Write combined dataset
		await fs.saveDocument(trainPath, allRecords)
		logger.success(`✅ Combined ${allRecords.length} training examples to ${trainPath}`)
	}

}

// Run the script
main().catch(err => {
	console.error(err.stack ?? err.message)
	process.exit(1)
})
