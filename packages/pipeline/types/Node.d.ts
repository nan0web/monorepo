/**
 * Abstract Node Model for Pipeline Architecture.
 * Follows OLMUI principles.
 */
export class Node {
    /**
     * @param {Partial<Node>} [params={}]
     */
    constructor(params?: Partial<Node>);
    /** @type {string} Unique ID of the node instance in the pipeline */
    id: string;
    /** @type {Record<string, any>} Input data for the node */
    inputs: Record<string, any>;
    /** @type {Record<string, any>} Output results of the node */
    outputs: Record<string, any>;
    /**
     * Core execution method. Must be overridden by subclasses.
     * @returns {AsyncGenerator<Object, any, unknown>}
     */
    run(): AsyncGenerator<any, any, unknown>;
    /**
     * Indicates a new logical step in the process.
     * @param {string} label
     */
    step(label: string): {
        type: string;
        label: string;
    };
    /**
     * Reports progress of the current step.
     * @param {number} value
     * @param {number} total
     */
    progress(value: number, total: number): {
        type: string;
        value: number;
        total: number;
    };
    /**
     * Simple log message.
     * @param {string} message
     */
    log(message: string): {
        type: string;
        message: string;
    };
    /**
     * Visualizes partial or intermediate data.
     * @param {any} data
     */
    show(data: any): {
        type: string;
        data: any;
    };
    /**
     * Requests input from the user/architect.
     * @param {Object} schema
     */
    ask(schema: any): {
        type: string;
        schema: any;
    };
    /**
     * Final result of the node.
     * @param {Object} data
     */
    result(data: any): {
        type: string;
        data: any;
    };
}
