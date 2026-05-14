import { show, ask, progress } from '@nan0web/ui-cli'
import { log } from '@nan0web/ui'

/**
 * EditorCli — The CLI adapter for the editor application.
 * Bridges EditorModel with the terminal interface.
 */
export class EditorCli {
	constructor(model) {
		this.model = model
	}

	/**
	 * Запуск інтерактивного циклу в терміналі.
	 */
	async *run() {
		const gen = this.model.run()
		let next = await gen.next()

		while (!next.done) {
			const intent = next.value

			switch (intent.type) {
				case 'progress':
					yield progress(intent.message, intent.value)
					break
				case 'log':
					// Дійсно виводимо в термінал
					console.log(`\x1b[90m[${intent.level?.toUpperCase()}]\x1b[0m ${intent.message}`)
					break
				case 'show':
					const data = intent.data || intent
					// console.log(`DEBUG-INTENT: ${intent.message}`) // Тимчасово для відладки
					
					if (intent.message === 'navigation') {
						console.log('\n\x1b[1m📂 Document Tree:\x1b[0m')
						const items = data.items || []
						items.forEach(item => {
							const marker = item.isStaged ? '\x1b[34m●\x1b[0m' : ' '
							const path = item.file?.path || item.path || 'unknown'
							console.log(`  ${marker} ${path}`)
						})
						console.log('')
					} else if (intent.message === 'editor') {
						const doc = data.model || data
						const url = doc.$url || doc.title || 'New Document'
						console.log(`\x1b[32m📝 Editing:\x1b[0m \x1b[1m${url}\x1b[0m\n`)
					} else {
						console.log(`\x1b[90m[SHOW]\x1b[0m ${intent.message}`)
					}
					yield { type: 'show', message: intent.message, data }
					break
				case 'ask':
					const options = (intent.options || intent.schema?.options || []).map(opt => ({
						label: opt.UI?.title || opt.label || opt.name || opt,
						value: opt
					}))

					const res = yield ask(intent.message || 'Select action:', {
						type: 'select',
						options
					})
					
					next = await gen.next(res)
					continue
			}

			next = await gen.next()
		}

		return next.value
	}
}
