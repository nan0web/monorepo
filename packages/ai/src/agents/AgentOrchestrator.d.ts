import { Model } from '@nan0web/types';
import { SysBuildAgent } from './SysBuildAgent.js';
import { CnaiRefactorAgent } from './CnaiRefactorAgent.js';
import { CnaiSearchAgent } from './CnaiSearchAgent.js';
/**
 * AgentOrchestrator — manages and executes subagents based on intent.
 */
export declare class AgentOrchestrator extends Model {
    /** @type {any} Intent object with task and context */ intent: any;
    static agents: {
        [SysBuildAgent.alias]: typeof SysBuildAgent;
        'cnai:refactor': typeof CnaiRefactorAgent;
        'cnai:search': typeof CnaiSearchAgent;
    };
    static intent: {
        help: string;
        default: {};
    };
    /**
     * @param {Object} [data] Initial state
     * @param {Partial<import('@nan0web/types').ModelOptions> & Record<string, any>} [options] Options
     */
    constructor(data?: any, options?: Partial<import('@nan0web/types').ModelOptions> & Record<string, any>);
    /**
     * Executes the requested agent task.
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
