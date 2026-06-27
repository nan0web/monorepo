export class LogicPipeline {
    /**
     * @param {any} context
     */
    constructor(context: any);
    context: any;
    /**
     * @param {string} task
     * @param {any} options
     * @returns {AsyncGenerator<any, { ok: boolean; outputText: string }, any>}
     */
    execute(task: string, options: any): AsyncGenerator<any, {
        ok: boolean;
        outputText: string;
    }, any>;
}
