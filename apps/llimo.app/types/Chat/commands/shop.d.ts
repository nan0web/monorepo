export class ShopperCommand extends UiCommand {
    static name: string;
    static help: string;
    static create(input?: {}): ShopperCommand;
    constructor(input?: {});
    /** @type {WebShopperModel} */
    model: WebShopperModel;
    run(): AsyncGenerator<boolean, void, unknown>;
}
import { UiCommand } from '../../cli/Ui.js';
import { WebShopperModel } from '../../domain/WebShopperModel.js';
