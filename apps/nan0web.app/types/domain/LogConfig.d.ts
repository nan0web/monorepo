/**
 * Log Configuration Model
 * Controls rotation and format for execution logs (access, errors).
 *
 * @property {boolean} enabled Enable logging
 * @property {string} dir Directory for storing logs
 * @property {'daily'|'hourly'|'size'} rotation Rotation strategy
 * @property {number} maxSizeMb Max size in megabytes (if rotation is 'size')
 * @property {boolean} logBodies Log request payload bodies
 */
export default class LogConfig extends Model {
    static enabled: {
        short: string;
        help: string;
        type: string;
        default: boolean;
    };
    static dir: {
        short: string;
        help: string;
        type: string;
        default: string;
    };
    static rotation: {
        short: string;
        help: string;
        type: string;
        options: string[];
        default: string;
    };
    static maxSizeMb: {
        short: string;
        help: string;
        type: string;
        default: number;
    };
    static logBodies: {
        short: string;
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {object} [data]
     * @param {object} [options]
     */
    constructor(data?: object, options?: object);
    /** @type {boolean} */ enabled: boolean;
    /** @type {string} */ dir: string;
    /** @type {string} */ rotation: string;
    /** @type {number} */ maxSizeMb: number;
    /** @type {boolean} */ logBodies: boolean;
}
import { Model } from '@nan0web/types';
