/**
 * PipelineNode — Composable base class for pipeline stages.
 *
 * Each node is a self-contained processing unit with typed input/output.
 * Nodes can be chained via pipe() or assembled via static compose().
 *
 * @template TInput
 * @template TOutput
 */
export class PipelineNode {
	/** @type {PipelineNode|null} */
	_next = null

	/**
	 * Abstract processing method. Must be overridden by subclasses.
	 * @param {TInput} input
	 * @returns {Promise<TOutput>}
	 */
	async process(input) {
		throw new Error('process() must be implemented by subclass')
	}

	/**
	 * Connect this node to a downstream node.
	 * @param {PipelineNode} nextNode
	 * @returns {PipelineNode} The downstream node (for further chaining).
	 */
	pipe(nextNode) {
		this._next = nextNode
		return nextNode
	}

	/**
	 * Execute this node and all downstream nodes in sequence.
	 * @param {TInput} input
	 * @returns {Promise<any>}
	 */
	async execute(input) {
		const output = await this.process(input)
		if (this._next) {
			return this._next.execute(output)
		}
		return output
	}

	/**
	 * Build a pipeline from an array of PipelineNode classes.
	 * Instantiates each class and chains them via pipe().
	 * Returns the head node (call execute() on it to run the chain).
	 *
	 * @param {Array<typeof PipelineNode>} nodeClasses
	 * @param {object} [options] - Shared options passed to each node constructor.
	 * @returns {PipelineNode} Head node of the composed pipeline.
	 */
	static compose(nodeClasses, options = {}) {
		if (!nodeClasses || nodeClasses.length === 0) {
			throw new Error('compose() requires at least one node class')
		}

		const nodes = nodeClasses.map(NodeClass => new NodeClass(options))
		for (let i = 0; i < nodes.length - 1; i++) {
			nodes[i].pipe(nodes[i + 1])
		}
		return nodes[0]
	}
}
