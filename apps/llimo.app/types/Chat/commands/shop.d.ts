export class ShopperCommand extends UiCommand {
    static name: string;
    static description: string;
    /**
     * @param {Record<string, any>} [input={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {ShopperCommand}
     */
    static create(input?: Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): ShopperCommand;
    /**
     * @param {Partial<ShopperCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ShopperCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {WebShopperModel} */
    model: WebShopperModel;
    run(): AsyncGenerator<boolean, void, unknown>;
}
import { UiCommand } from '../../cli/Ui.js';
import { WebShopperModel } from '../../domain/app/WebShopperModel.js';
