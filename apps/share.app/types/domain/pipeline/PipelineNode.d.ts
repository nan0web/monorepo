/**
 * PipelineNode — Composable base class for pipeline stages.
 *
 * Each node is a self-contained processing unit with typed input/output.
 * Nodes can be chained via pipe() or assembled via static compose().
 *
 * @template TInput
 * @template TOutput
 */
export class PipelineNode<TInput, TOutput> {
    /**
     * Build a pipeline from an array of PipelineNode classes.
     * Instantiates each class and chains them via pipe().
     * Returns the head node (call execute() on it to run the chain).
     *
     * @param {Array<typeof PipelineNode>} nodeClasses
     * @param {object} [options] - Shared options passed to each node constructor.
     * @returns {PipelineNode} Head node of the composed pipeline.
     */
    static compose(nodeClasses: Array<typeof PipelineNode>, options?: object): PipelineNode<any, any>;
    /** @type {PipelineNode|null} */
    _next: PipelineNode<any, any> | null;
    /**
     * Abstract processing method. Must be overridden by subclasses.
     * @param {TInput} input
     * @returns {Promise<TOutput>}
     */
    process(input: TInput): Promise<TOutput>;
    /**
     * Connect this node to a downstream node.
     * @param {PipelineNode} nextNode
     * @returns {PipelineNode} The downstream node (for further chaining).
     */
    pipe(nextNode: PipelineNode<any, any>): PipelineNode<any, any>;
    /**
     * Execute this node and all downstream nodes in sequence.
     * @param {TInput} input
     * @returns {Promise<any>}
     */
    execute(input: TInput): Promise<any>;
}
