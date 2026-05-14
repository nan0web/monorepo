/**
 * Model-as-Schema for Button component.
 */
export class ButtonModel extends Model {
    static variant: {
        help: string;
        default: string;
        options: string[];
    };
    static content: {
        help: string;
        default: string;
        type: string;
    };
    static href: {
        help: string;
        default: string;
        type: string;
    };
    static disabled: {
        help: string;
        default: boolean;
        type: string;
    };
    static clicked: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<ButtonModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ButtonModel> | Record<string, any>, options?: object);
    /** @type {'primary'|'secondary'|'danger'|'ghost'} Button visual style */ variant: "primary" | "secondary" | "danger" | "ghost";
    /** @type {string} Text displayed inside the button */ content: string;
    /** @type {string} Optional link URL */ href: string;
    /** @type {boolean} Whether the button can be clicked */ disabled: boolean;
    /** @type {boolean} Reactive flag set to true when user activates the button */ clicked: boolean;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
