#!/usr/bin/env node

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { runBatchQueue } from '../src/domain/batch.js'
import { AgentOrchestrator } from '../src/agents/AgentOrchestrator.js'
import { DBFS } from '@nan0web/db-fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, '../')
const workspaceRoot = path.join(pkgRoot, '../../')

async function main() {
	const args = process.argv.slice(2)
	if (args.length < 2) {
		console.error('Usage: node batch-runner.js <queue_file.jsonl> <results_file.jsonl>')
		process.exit(1)
	}

	const queueFile = path.resolve(process.cwd(), args[0])
	const resultsFile = path.resolve(process.cwd(), args[1])

	const db = new DBFS({ root: workspaceRoot })

	const executor = async (task) => {
		console.log(`[Batch Runner] Running task: ${task.id} (${task.task})`)
		try {
			const orchestrator = new AgentOrchestrator({ intent: task }, { db })
			let lastResult = null
			for await (const chunk of orchestrator.run()) {
				if (chunk && typeof chunk === 'object') {
					if (chunk.type === 'result') {
						lastResult = chunk.data
					} else {
						lastResult = chunk
					}
				}
			}
			
			// Normalize result
			const ok = lastResult?.ok !== undefined ? lastResult.ok : lastResult?.success
			return {
				id: task.id,
				success: ok ?? true,
				result: lastResult
			}
		} catch (error) {
			console.error(`[Batch Runner] Task ${task.id} failed:`, error)
			return {
				id: task.id,
				success: false,
				error: error.message
			}
		}
	}

	try {
		await runBatchQueue(queueFile, resultsFile, executor)
		console.log(`[Batch Runner] Finished processing queue. Results saved to: ${resultsFile}`)
	} catch (err) {
		console.error('[Batch Runner] Execution failed:', err)
		process.exit(1)
	}
}

main().catch(console.error)
