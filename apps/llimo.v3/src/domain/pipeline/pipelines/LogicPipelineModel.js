import { ModelAsApp, result } from '@nan0web/ui'
import { ChatSessionModel } from '../../app/ChatSessionModel.js'

export class LogicPipelineModel extends ModelAsApp {
	static alias = 'logic'
	static UI = {
		title: '⚙️ Logic Pipeline',
	}

	static task = {
		help: 'Input text for logic laws analysis',
		default: '',
		positional: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.task
	}

	async *run() {
		const laws = [
			{ name: 'Identity', prompt: 'Analyze the text. Confirm that terms and concepts are defined clearly and remain identical throughout (A is A). Suggest clarifications if definitions drift.' },
			{ name: 'Non-Contradiction', prompt: 'Analyze the text. Identify and resolve any logical contradictions (A cannot be both B and not-B at the same time in the same relation).' },
			{ name: 'Excluded Middle', prompt: 'Analyze the text. Ensure there are no ambiguous intermediate propositions where a statement is neither true nor false (Either A or not-A, no third option).' },
			{ name: 'Sufficient Reason', prompt: 'Analyze the text. Ensure every assertion has a sufficient reason, evidence, or ground to justify it.' }
		]

		let currentText = this.task || ''
		for (const law of laws) {
			const chatData = {
				input: `Please review and improve the following text according to the Law of ${law.name}.\nInstructions: ${law.prompt}\n\nText:\n${currentText}`,
				_positionals: []
			}
			const chatModel = new ChatSessionModel(chatData, this._)
			const lastVal = yield* chatModel.run()
			if (lastVal && lastVal.outputText) {
				currentText = lastVal.outputText
			}
		}

		return result({
			ok: true,
			outputText: currentText
		})
	}
}
