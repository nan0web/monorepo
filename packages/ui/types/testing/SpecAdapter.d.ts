/**
 * @typedef {Object} SpecAdapterOptions
 * @property {typeof import('node:assert/strict')} [assert] Custom assertion library (falls back to node:assert in Node runtime)
 */
export class SpecAdapter {
    /**
     * @param {Array<object>} stream The remaining nan0 array without the first element.
     * @param {SpecAdapterOptions} [options={}]
     */
    constructor(stream: Array<object>, options?: SpecAdapterOptions);
    /** @type {Array<object>} */
    stream: Array<object>;
    /** @type {typeof import('node:assert/strict')} */
    assert: typeof import("node:assert/strict");
    /**
     * @param {import('../core/Intent.js').AskIntent} intent
     */
    ask(intent: import("../core/Intent.js").AskIntent): Promise<{
        value: any;
        cancelled: boolean;
    }>;
    /**
     * @param {import('../core/Intent.js').ShowIntent} intent
     */
    show(intent: import("../core/Intent.js").ShowIntent): Promise<void>;
    /**
     * @param {import('../core/Intent.js').LogIntent} intent
     */
    log(intent: import("../core/Intent.js").LogIntent): Promise<void>;
    /**
     * @param {import('../core/Intent.js').ProgressIntent} intent
     */
    progress(intent: import("../core/Intent.js").ProgressIntent): Promise<void>;
    /**
     * @param {import('../core/Intent.js').RenderIntent} intent
     */
    render(intent: import("../core/Intent.js").RenderIntent): Promise<void>;
    /**
     * @param {import('../core/Intent.js').AgentIntent} intent
     */
    agent(intent: import("../core/Intent.js").AgentIntent): Promise<{
        success: boolean;
        files: any;
        message: any;
    }>;
    /**
     * @param {import('../core/Intent.js').ResultIntent} intent
     */
    result(intent: import("../core/Intent.js").ResultIntent): Promise<void>;
    #private;
}
export type SpecAdapterOptions = {
    /**
     * Custom assertion library (falls back to node:assert in Node runtime)
     */
    assert?: typeof assert | undefined;
};
import assert from 'node:assert/strict';
