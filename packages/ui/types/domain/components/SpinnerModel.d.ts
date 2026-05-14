/**
 * Model-as-Schema for Spinner component.
 * Represents a loading or progress state without user interaction.
 */
export class SpinnerModel extends Model {
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
    /** @type {'sm'|'md'|'lg'} Spinner diameter */ size: "sm" | "md" | "lg";
    /** @type {string} Override for base color token */ color: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
