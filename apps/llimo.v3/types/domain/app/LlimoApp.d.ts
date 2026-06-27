/**
 * LlimoApp — main domain model as app for llimo.v3
 */
export class LlimoApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof StrategyApp | typeof ChatSessionModel | typeof StatsReportModel | typeof WorkflowApp | typeof PipelineApp)[];
        positional: boolean;
        default: typeof ChatSessionModel;
    };
    /**
     * @param {Partial<LlimoApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<LlimoApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {any} */ command: any;
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui';
import { StrategyApp } from '../strategy/AiStrategyModel.js';
import { ChatSessionModel } from './ChatSessionModel.js';
import { StatsReportModel } from '../stats/StatsReportModel.js';
import { WorkflowApp } from '../workflow/WorkflowApp.js';
import { PipelineApp } from '../pipeline/PipelineApp.js';
