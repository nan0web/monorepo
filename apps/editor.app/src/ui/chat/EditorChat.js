/**
 * EditorChat — The Chat/Agent adapter for the editor application.
 * Maps model intents to chat messages and structured data for AI agents.
 */
export class EditorChat {
	constructor(model) {
		this.model = model
	}

	/**
	 * Перетворює інтенти моделі у формат чату.
	 */
	async *run() {
		const gen = this.model.run()
		let next = await gen.next()

		while (!next.done) {
			const intent = next.value

			// В чаті ми просто повертаємо інтент як об'єкт повідомлення
			// Чат-фреймворк сам вирішить, як це відрендерити (текст + кнопки/форми)
			const answer = yield {
				role: 'assistant',
				content: intent.message || '',
				intent: {
					type: intent.type,
					schema: intent.schema,
					data: intent.data
				}
			}

			next = await gen.next(answer)
		}

		return next.value
	}
}
