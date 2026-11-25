/**
 * TaskModel (Model-as-Schema)
 * Represents a single task item parsed from Markdown AST (checkbox or table).
 */
export class TaskModel extends Model {
    static title: {
        type: string;
        required: boolean;
        help: string;
    };
    static fullText: {
        type: string;
        default: string;
        help: string;
    };
    static status: {
        type: string;
        default: string;
        help: string;
    };
    static kind: {
        type: string;
        default: string;
        help: string;
    };
    static domain: {
        type: string;
        default: string;
        help: string;
    };
    static hashtags: {
        type: string;
        default: never[];
        help: string;
    };
    static project: {
        type: string;
        default: string;
        help: string;
    };
    static date: {
        type: string;
        default: string;
        help: string;
    };
    static badges: {
        type: string;
        default: {};
        help: string;
    };
    static metrics: {
        type: string;
        default: {};
        help: string;
    };
    static priorityScore: {
        type: string;
        default: number;
        help: string;
    };
    static filePath: {
        type: string;
        default: string;
        help: string;
    };
    static lineIndex: {
        type: string;
        default: number;
        help: string;
    };
    static agent: {
        type: string;
        default: string;
        help: string;
    };
    static model: {
        type: string;
        default: string;
        help: string;
    };
    static tokensIn: {
        type: string;
        default: number;
        help: string;
    };
    static tokensOut: {
        type: string;
        default: number;
        help: string;
    };
    static costUsd: {
        type: string;
        default: number;
        help: string;
    };
    static step: {
        type: string;
        default: string;
        help: string;
    };
    static gate: {
        type: string;
        default: string;
        help: string;
    };
    static targetFiles: {
        type: string;
        default: never[];
        help: string;
    };
    static logPath: {
        type: string;
        default: string;
        help: string;
    };
    /**
     * Compute total tokens (input + output) for a task.
     * @param {Partial<TaskModel>} task
     * @returns {number}
     */
    static totalTokens(task: Partial<TaskModel>): number;
    /**
     * Format token count into compact human-readable string (e.g. 640k tok).
     * @param {number} count
     * @returns {string}
     */
    static formatTokens(count: number): string;
    /**
     * Format USD cost with 2 decimal places (e.g. $2.15).
     * @param {number} usd
     * @returns {string}
     */
    static formatCost(usd: number): string;
    /**
     * Convert table or checkbox symbol to normalized status.
     * @param {string} symbol
     * @returns {'todo' | 'work' | 'done' | 'pause' | 'fail'}
     */
    static symbolToStatus(symbol: string): "todo" | "work" | "done" | "pause" | "fail";
    /**
     * Convert status to table emoji symbol.
     * @param {string} status
     * @returns {string}
     */
    static statusToTableSymbol(status: string): string;
    /**
     * Convert status to markdown checkbox mark.
     * @param {string} status
     * @returns {string}
     */
    static statusToCheckboxMark(status: string): string;
    /**
     * Calculate task priority via PriorityEvaluator contract.
     * @param {TaskModel | Record<string, any>} taskOrMetrics
     * @param {import('./PriorityEvaluator.js').PriorityEvaluatorFn} [evaluator]
     * @param {{ tasks?: any[], date?: string }} [context]
     * @returns {number}
     */
    static calculatePriority(taskOrMetrics: TaskModel | Record<string, any>, evaluator?: import("./PriorityEvaluator.js").PriorityEvaluatorFn, context?: {
        tasks?: any[];
        date?: string;
    }): number;
    /**
     * Extract #hashtags from text.
     * @param {string} text
     * @returns {string[]}
     */
    static extractHashtags(text: string): string[];
    /**
     * Clean raw task text and optionally truncate.
     * @param {string} rawBody
     * @param {number} [maxLen=0]
     * @returns {string}
     */
    static cleanTitle(rawBody: string, maxLen?: number): string;
    /**
     * @param {Partial<TaskModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<TaskModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Task title */ title: string;
    /** @type {string} Full untruncated task text */ fullText: string;
    /** @type {'todo' | 'done' | 'work' | 'pause' | 'fail'} Task status */ status: "todo" | "done" | "work" | "pause" | "fail";
    /** @type {'checkbox' | 'table'} Source format */ kind: "checkbox" | "table";
    /** @type {string} Task domain */ domain: string;
    /** @type {string[]} Extracted hashtags */
    hashtags: string[];
    /** @type {string} Resolved project key */ project: string;
    /** @type {string} Optional date YYYY-MM-DD */ date: string;
    /** @type {Record<string, string>} Key-value badges */ badges: Record<string, string>;
    /** @type {Record<string, number>} Numeric metrics */ metrics: Record<string, number>;
    /** @type {number} Calculated priority P(x) */
    priorityScore: number;
    /** @type {string} Source file path */ filePath: string;
    /** @type {number} Line index in file */ lineIndex: number;
    /** @type {string} Assigned agent identifier */ agent: string;
    /** @type {string} Active LLM model name */ model: string;
    /** @type {number} Input tokens consumed */ tokensIn: number;
    /** @type {number} Output tokens generated */ tokensOut: number;
    /** @type {number} Estimated cost in USD */ costUsd: number;
    /** @type {string} Current progress step */ step: string;
    /** @type {string} Gate status */ gate: string;
    /** @type {string[]} Target files */
    targetFiles: string[];
    /** @type {string} Path to execution log */ logPath: string;
}
export default TaskModel;
import { Model } from '@nan0web/types';
