/**
 * Media
 *
 * Media asset attachment for Post or other entities.
 * Supports hybrid positioning (Format A: inline shortcode anchor; Format B: placement directive).
 *
 * @class Media
 * @extends Model
 */
export default class Media extends Model {
    static id: {
        type: string;
        help: string;
    };
    static url: {
        type: string;
        help: string;
    };
    static type: {
        type: string;
        help: string;
        default: string;
    };
    static caption: {
        type: string;
        help: string;
        default: string;
    };
    static placement: {
        type: string;
        help: string;
        default: {};
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */
    id: string;
    /** @type {string} */
    url: string;
    /** @type {string} */
    type: string;
    /** @type {string} */
    caption: string;
    /** @type {object} */
    placement: object;
}
import { Model } from '@nan0web/types';
