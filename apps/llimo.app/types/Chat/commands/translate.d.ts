/**
 * `translate` command — translates markdown docs using AI.
 * Bridges the OLMUI TranslateDocsModel into the LLiMo chat command system.
 */
export class TranslateCommand extends UiCommand {
    static name: string;
    static description: string;
    /**
     * Factory method compatible with LLiMo command system.
     * @param {object} [input]
     * @param {string[]} [input.argv=[]]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {TranslateCommand}
     */
    static create(input?: {
        argv?: string[] | undefined;
    }, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): TranslateCommand;
    /**
     * @param {Partial<TranslateCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<TranslateCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {TranslateDocsModel} */
    model: TranslateDocsModel;
    /**
     * @returns {AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>}
     */
    run(): AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>;
}
import { UiCommand } from '../../cli/Ui.js';
import { TranslateDocsModel } from '../../domain/app/TranslateDocsModel.js';
