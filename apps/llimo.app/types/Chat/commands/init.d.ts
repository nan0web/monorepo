export class InitCommand extends UiCommand {
    static name: string;
    static help: string;
    static create(input?: {}): InitCommand;
    constructor(input?: {});
    /** @type {InitProjectModel} */
    model: InitProjectModel;
    run(): AsyncGenerator<boolean, void, unknown>;
}
import { UiCommand } from '../../cli/Ui.js';
import { InitProjectModel } from '../../domain/InitProjectModel.js';
