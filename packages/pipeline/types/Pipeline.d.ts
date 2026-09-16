/**
 * Pipeline Orchestrator.
 * Manages a graph of Nodes and passes data between them via Edges.
 */
export class Pipeline {
    /**
     * @param {Partial<Pipeline>} [config={}]
     */
    constructor(config?: Partial<Pipeline>);
    /** @type {import('./Node.js').Node[]} */
    nodes: import("./Node.js").Node[];
    /** @type {Array<{from: string, to: string, map: Object}>} */
    edges: Array<{
        from: string;
        to: string;
        map: any;
    }>;
    /**
     * Runs the pipeline by executing nodes in their dependency order.
     * @returns {AsyncGenerator<Object, void, unknown>}
     */
    run(): AsyncGenerator<any, void, unknown>;
    /**
     * Maps outputs from source nodes to inputs of the target node.
     * @param {string} targetId
     */
    mapInputs(targetId: string): void;
    /**
     * Builds a topological sort order for node execution.
     * @returns {string[]}
     */
    buildExecutionOrder(): string[];
}
