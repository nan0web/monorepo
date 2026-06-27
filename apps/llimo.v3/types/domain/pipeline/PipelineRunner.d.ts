export class PipelineRunner {
    /**
     * @param {any} context
     */
    constructor(context: any);
    context: any;
    /** @type {Record<string, any>} */
    drivers: Record<string, any>;
    /**
     * @param {string} name
     * @param {string} task
     * @param {any} [options={}]
     * @returns {AsyncGenerator<any, { ok: boolean; [key: string]: any }, any>}
     */
    execute(name: string, task: string, options?: any): AsyncGenerator<any, {
        ok: boolean;
        [key: string]: any;
    }, any>;
}
