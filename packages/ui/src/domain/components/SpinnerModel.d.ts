import { Model } from '@nan0web/types';
/**
 * Model-as-Schema for Spinner component.
 * Represents a loading or progress state without user interaction.
 */
export declare class SpinnerModel extends Model {
    static size: {
        help: string;
        default: string;
        options: string[];
    };
    static color: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<SpinnerModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<SpinnerModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
