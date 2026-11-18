/**
 * Agent entry configuration inside nan0web.nan0.
 */
export default class AgentEntryConfig extends Model {
    static id: {
        help: string;
        default: string;
        required: boolean;
    };
    static description: {
        help: string;
        default: string;
    };
    static workflows: {
        help: string;
        type: string;
        default: never[];
    };
    static inspectors: {
        help: string;
        type: string;
        default: never[];
    };
    /**
     * @param {Partial<AgentEntryConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<AgentEntryConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Unique agent identifier */
    id: string;
    /** @type {string} Short description of agent role */
    description: string;
    /** @type {string[]} List of workflow markdown paths */
    workflows: string[];
    /** @type {string[]} List of inspector markdown paths */
    inspectors: string[];
}
import { Model } from '@nan0web/types';
