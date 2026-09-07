/**
 * Model-as-Schema for Confirmation dialog.
 */
export class ConfirmModel extends Model {
    static title: {
        help: string;
        default: string;
        type: string;
    };
    static message: {
        help: string;
        default: string;
        type: string;
    };
    static okLabel: {
        help: string;
        default: string;
        type: string;
    };
    static cancelLabel: {
        help: string;
        default: string;
        type: string;
    };
    /**
     * @param {Partial<ConfirmModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ConfirmModel> | Record<string, any>, options?: object);
    /** @type {string} Short title for the action */ title: string;
    /** @type {string} The question asked to the user */ message: string;
    /** @type {string} Text for the confirm button */ okLabel: string;
    /** @type {string} Text for the cancel button */ cancelLabel: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
