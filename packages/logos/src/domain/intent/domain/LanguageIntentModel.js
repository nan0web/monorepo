import { Message } from '@nan0web/co'

/**
 * Domain model describing the input payload for LanguageIntent analysis.
 * This class establishes the shape and type, strictly separate from CLI concerns or message parsing.
 *
 * In One Logic — Many UI architecture, this model drives both validation and defaults.
 */
export class LanguageIntentModel {
	static lang = {
		alias: 'l',
		help: 'Response language',
		defaultValue: 'en',
	}
	/** @type {string} */
	lang

	static inputFile = {
		alias: 'f',
		help: 'Input file (target)',
		defaultValue: '',
	}
	/** @type {string} */
	inputFile

	static input = {
		help: 'Raw Input content (instead of file)',
		defaultValue: '',
	}
	/** @type {string} */
	input

	static outputFile = {
		alias: 'o',
		help: 'File for results',
		defaultValue: '',
	}
	/** @type {string} */
	outputFile

	static raw = {
		alias: 'r',
		help: 'Output only clean raw format',
		defaultValue: false,
	}
	/** @type {boolean} */
	raw

	static mode = {
		alias: 'm',
		help: 'Execution mode (agent/llm or regex/script)',
		options: ['agent', 'regex'],
		defaultValue: 'agent',
	}
	/** @type {string} */
	mode

	/**
	 * @param {Object} input
	 */
	constructor(input = {}) {
		const {
			lang = LanguageIntentModel.lang.defaultValue,
			inputFile = LanguageIntentModel.inputFile.defaultValue,
			input: rawInput = LanguageIntentModel.input.defaultValue,
			outputFile = LanguageIntentModel.outputFile.defaultValue,
			raw = LanguageIntentModel.raw.defaultValue,
			mode = LanguageIntentModel.mode.defaultValue,
		} = Message.parseBody(input, LanguageIntentModel)

		this.lang = String(lang)
		this.inputFile = String(inputFile)
		this.input = String(rawInput)
		this.outputFile = String(outputFile)
		this.raw = Boolean(raw)
		this.mode = String(mode)
	}
}
