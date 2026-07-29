export class StrategyCommand extends UiCommand {
    static name: string;
    static description: string;
    static subcommand: {
        help: string;
        options: string[];
        positional: boolean;
        default: string;
    };
    static model: {
        help: string;
        positional: boolean;
        default: string;
    };
    static position: {
        help: string;
        type: string;
        positional: boolean;
        default: number;
    };
    /**
     * @param {{ argv?: string[], chat?: import('../../llm/Chat.js').Chat }} [input]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     * @returns {StrategyCommand}
     */
    static create(input?: {
        argv?: string[];
        chat?: import("../../llm/Chat.js").Chat;
    }, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): StrategyCommand;
    /**
     * @param {Partial<StrategyCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<StrategyCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */
    subcommand: string;
    /** @type {string} */
    model: string;
    /** @type {number} */
    position: number;
    /** @type {import('../../llm/Chat.js').Chat|undefined} */
    chat: import("../../llm/Chat.js").Chat | undefined;
    run(): AsyncGenerator<false | import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { UiCommand } from '../../cli/Ui.js';
