/**
 * EditorVscode — The VS Code Extension adapter.
 * Bridges EditorModel with the VS Code Extension Host via postMessage.
 */
export class EditorVscode {
	constructor(model) {
		this.model = model
		this.vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null
	}

	/**
	 * Запуск адаптера у WebView.
	 */
	async *run() {
		const gen = this.model.run()
		let next = await gen.next()

		while (!next.done) {
			const intent = next.value

			// Якщо ми в VS Code — деякі дії можна делегувати хосту
			if (this.vscode && intent.type === 'save') {
				this.vscode.postMessage({
					command: 'saveFile',
					path: intent.path,
					content: intent.data
				})
			}

			// В іншому випадку — стандартна обробка через інтенти
			const answer = yield intent
			next = await gen.next(answer)
		}

		return next.value
	}
}
