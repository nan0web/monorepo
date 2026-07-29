import fs from 'node:fs/promises'
import path from 'node:path'
import { BatchTaskModel } from './BatchTaskModel.js'

/**
 * Runs a batch queue of tasks from a JSONL file, processes each using executor,
 * and writes the results to another JSONL file.
 * @param {string} queueFile
 * @param {string} resultsFile
 * @param {function(BatchTaskModel): Promise<object>} executor
 * @returns {Promise<void>}
 */
export async function runBatchQueue(queueFile, resultsFile, executor) {
	const content = await fs.readFile(queueFile, 'utf8')
	const lines = content.split('\n').filter((line) => line.trim())

	const results = []
	for (const line of lines) {
		const data = JSON.parse(line)
		const task = new BatchTaskModel(data)
		const result = await executor(task)
		results.push(JSON.stringify(result))
	}

	await fs.mkdir(path.dirname(resultsFile), { recursive: true })
	await fs.writeFile(resultsFile, results.join('\n') + '\n', 'utf8')
}
