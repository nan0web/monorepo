/**
 * LlimoApp — main domain model as app for LLiMo.
 */
export class LlimoApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof StrategyEditModel | typeof TranslateDocsModel | typeof StrategyCommand | typeof ModelsModel | typeof PipelineModel | typeof SystemModel | typeof UnpackModel | typeof WorkflowModel | typeof ChatSessionModel | typeof SubagentModel | typeof PipelineSeedCommand)[];
        positional: boolean;
        default: typeof ChatSessionModel;
    };
    /**
     * @param {Partial<LlimoApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<LlimoApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ModelAsApp} */ command: ModelAsApp;
}
import { ModelAsApp } from '@nan0web/ui-cli';
import { StrategyEditModel } from '../AiStrategyModel.js';
import { TranslateDocsModel } from './TranslateDocsModel.js';
import { StrategyCommand } from '../../Chat/commands/strategy.js';
import { ModelsModel } from '../ModelsModel.js';
import { PipelineModel } from '../PipelineModel.js';
import { SystemModel } from '../SystemModel.js';
import { UnpackModel } from '../UnpackModel.js';
import { WorkflowModel } from '../WorkflowModel.js';
import { ChatSessionModel } from './ChatSessionModel.js';
import { SubagentModel } from './SubagentModel.js';
declare class PipelineSeedCommand extends PipelineStepModel {
    static alias: string;
    constructor(data?: {}, options?: {});
}
/**
 * Base Model wrapper for individual pipeline steps.
 */
declare class PipelineStepModel extends ModelAsApp {
    static intent: {
        help: string;
        default: string;
        positional: boolean;
    };
    static task: {
        help: string;
        default: string;
    };
    static model: {
        help: string;
        default: string;
    };
    /**
     * @param {Record<string, any>} [data]
     * @param {Record<string, any>} [options]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} */ step: string;
    /** @type {string} */ intent: string;
    /** @type {string} */ task: string;
    /** @type {string} */ model: string;
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export {};
