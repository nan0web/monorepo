/**
 * @typedef {(task: import('./TaskModel.js').TaskModel | Record<string, any>, context?: { tasks?: any[], date?: string }) => number} PriorityEvaluatorFn
 */
/**
 * Built-in priority evaluators for table and pool task formats.
 */
export class PriorityEvaluator {
    static table(task: import("./TaskModel.js").TaskModel | Record<string, any>, context?: {
        tasks?: any[];
        date?: string;
    }): number;
    static pool(task: import("./TaskModel.js").TaskModel | Record<string, any>, context?: {
        tasks?: any[];
        date?: string;
    }): number;
    /**
     * Evaluate task priority using custom or default evaluator.
     * @param {import('./TaskModel.js').TaskModel | Record<string, any>} task
     * @param {PriorityEvaluatorFn} [evaluator]
     * @param {{ tasks?: any[], date?: string }} [context]
     * @returns {number}
     */
    static evaluate(task: import("./TaskModel.js").TaskModel | Record<string, any>, evaluator?: PriorityEvaluatorFn, context?: {
        tasks?: any[];
        date?: string;
    }): number;
}
export default PriorityEvaluator;
export type PriorityEvaluatorFn = (task: import("./TaskModel.js").TaskModel | Record<string, any>, context?: {
    tasks?: any[];
    date?: string;
}) => number;
