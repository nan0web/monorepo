import { TaskModel } from '../../domain/Task/TaskModel.js'

/**
 * KindleExportAdapter exports task digests to plain TXT (primary) or structured EPUB.
 */
export class KindleExportAdapter {
	/**
	 * Format tasks as clean plain text for Kindle.
	 * @param {TaskModel[]} tasks
	 * @param {string} [title='Задачі']
	 * @returns {string}
	 */
	static formatTxt(tasks, title = 'Задачі') {
		const header = `${title}\n${'='.repeat(title.length)}\n\n`
		const body = tasks
			.map((t, i) => `${i + 1}. [${TaskModel.statusToTableSymbol(t.status)}] ${t.fullText || t.title}`)
			.join('\n')
		return `${header}${body}\n`
	}

	/**
	 * Format tasks as XHTML content suitable for EPUB assembly.
	 * @param {TaskModel[]} tasks
	 * @param {string} [title='Задачі']
	 * @returns {string}
	 */
	static formatEpubXhtml(tasks, title = 'Задачі') {
		const items = tasks
			.map((t) => `<li>[${TaskModel.statusToTableSymbol(t.status)}] ${t.fullText || t.title}</li>`)
			.join('\n')
		return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1><ul>${items}</ul></body></html>`
	}

	/**
	 * @param {TaskModel[]} tasks
	 * @param {'txt' | 'epub'} [format='txt']
	 * @returns {{ format: string, content: string }}
	 */
	static export(tasks, format = 'txt') {
		if (format === 'epub') {
			return { format: 'epub', content: KindleExportAdapter.formatEpubXhtml(tasks) }
		}
		return { format: 'txt', content: KindleExportAdapter.formatTxt(tasks) }
	}
}

export default KindleExportAdapter
