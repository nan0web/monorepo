/**
 * HeroModel — OLMUI Component Model
 * Represents the top presentation section of a page.
 */
export class HeroModel extends Model {
    static $id: string;
    static badge: {
        help: string;
        placeholder: string;
        default: string;
    };
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static subtitle: {
        help: string;
        placeholder: string;
        default: string;
    };
    static code: {
        help: string;
        default: string;
    };
    static actions: {
        help: string;
        type: string;
        model: typeof Navigation;
        default: never[];
    };
    /**
     * @param {Partial<HeroModel | Record<string, any>>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<HeroModel | Record<string, any>>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Top small badge text ior icon */ badge: string;
    /** @type {string} Hero heading */ title: string;
    /** @type {string} Hero secondary text */ subtitle: string;
    /** @type {string} Code snippet or secondary markup */ code: string;
    /** @type {Navigation[]} CTA buttons */ actions: Navigation[];
}
import { Model } from '@nan0web/types';
import Navigation from './Navigation.js';
