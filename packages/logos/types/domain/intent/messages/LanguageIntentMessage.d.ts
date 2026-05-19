/**
 * Encapsulates the Language Intent communication pattern according to the message-driven design.
 */
export class LanguageIntentMessage extends Message {
    static Body: typeof LanguageIntentModel;
    constructor(input: any);
    /** @type {LanguageIntentModel} */
    body: LanguageIntentModel;
}
import { Message } from '@nan0web/co';
import { LanguageIntentModel } from '../domain/LanguageIntentModel.js';
