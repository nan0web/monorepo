/**
 * `translate` command — translates markdown docs using AI.
 * Bridges the OLMUI TranslateDocsModel into the LLiMo chat command system.
 */
export class TranslateCommand extends UiCommand {
    static name: string;
    static help: string;
    /**
     * Factory method compatible with LLiMo command system.
     * @param {object} [input]
     * @param {string[]} [input.argv=[]]
     * @returns {TranslateCommand}
     */
    static create(input?: {
        argv?: string[] | undefined;
    }): TranslateCommand;
    /**
     * @param {Partial<TranslateCommand>} input
     */
    constructor(input?: Partial<TranslateCommand>);
    /** @type {TranslateDocsModel} */
    model: TranslateDocsModel;
    /**
     * @returns {AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>}
     */
    run(): AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>;
}
import { UiCommand } from '../../cli/Ui.js';
import { TranslateDocsModel } from '../../domain/TranslateDocsModel.js';
