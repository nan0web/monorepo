export class ReleaseMemberModel extends Model {
    static role: {
        type: string;
        required: boolean;
    };
    static name: {
        type: string;
        required: boolean;
    };
    static handle: {
        type: string;
    };
    /**
     * @param {Partial<ReleaseMemberModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseMemberModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Role / Position (Посада) */
    role: string;
    /** @type {string} Full Name (Ім'я) */
    name: string;
    /** @type {string} Login / Handle (Логін без @) */
    handle: string;
}
import { Model } from '@nan0web/types';
