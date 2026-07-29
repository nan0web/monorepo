export class InitCommand extends UiCommand {
    static name: string;
    static description: string;
    /**
     * @param {Record<string, any>} [input={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {InitCommand}
     */
    static create(input?: Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): InitCommand;
    /**
     * @param {Partial<InitCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<InitCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {InitProjectModel} */
    model: InitProjectModel;
    run(): AsyncGenerator<boolean, void, unknown>;
}
import { UiCommand } from '../../cli/Ui.js';
import { InitProjectModel } from '../../domain/app/InitProjectModel.js';
