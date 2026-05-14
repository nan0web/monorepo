import { Message } from '@nan0web/co'
import { LanguageIntentModel } from '../domain/LanguageIntentModel.js'

/**
 * Encapsulates the Language Intent communication pattern according to the message-driven design.
 */
export class LanguageIntentMessage extends Message {
	static Body = LanguageIntentModel

	/** @type {LanguageIntentModel} */
	body

	constructor(input) {
		super(input)
		// Assuming input may have `body` nested or flat structure from CLI args
		this.body = new LanguageIntentModel(input?.opts ?? input?.body ?? input)
	}
}
