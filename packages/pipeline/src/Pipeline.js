/**
 * Pipeline Orchestrator.
 * Manages a graph of Nodes and passes data between them via Edges.
 */
export class Pipeline {
	/** @type {import('./Node.js').Node[]} */
	nodes = []
	/** @type {Array<{from: string, to: string, map: Object}>} */
	edges = []

	/**
	 * @param {Partial<Pipeline>} [config={}]
	 */
	constructor(config = {}) {
		this.nodes = config.nodes || []
		this.edges = config.edges || []
	}

	/**
	 * Runs the pipeline by executing nodes in their dependency order.
	 * @returns {AsyncGenerator<Object, void, unknown>}
	 */
	async *run() {
		// 1. Determine execution order (Topological Sort based on edges)
		const order = this.buildExecutionOrder()

		for (const nodeId of order) {
			const node = this.nodes.find((n) => n.id === nodeId)
			if (!node) continue

			// 2. Map inputs from previous nodes' outputs based on edges
			this.mapInputs(nodeId)

			// 3. Execute node and yield its intents
			for await (const intent of node.run()) {
				yield { nodeId, ...intent }
			}
		}
	}

	/**
	 * Maps outputs from source nodes to inputs of the target node.
	 * @param {string} targetId
	 */
	mapInputs(targetId) {
		const incoming = this.edges.filter((e) => e.to === targetId)
		const targetNode = this.nodes.find((n) => n.id === targetId)

		if (!targetNode) {
			throw new Error(`Target node with id: ${targetId} not found.`)
		}

		for (const edge of incoming) {
			const sourceNode = this.nodes.find((n) => n.id === edge.from)
			if (!sourceNode) continue

			for (const [sourceKey, targetKey] of Object.entries(edge.map)) {
				targetNode.inputs[targetKey] = sourceNode.outputs[sourceKey]
			}
		}
	}

	/**
	 * Builds a topological sort order for node execution.
	 * @returns {string[]}
	 */
	buildExecutionOrder() {
		const order = []
		const visited = new Set()
		const visiting = new Set()

		const visit = (nodeId) => {
			if (visiting.has(nodeId)) throw new Error(`Cycle detected in pipeline at node: ${nodeId}`)
			if (visited.has(nodeId)) return

			visiting.add(nodeId)

			// Nodes that provide inputs to this node must be visited first
			const dependencies = this.edges.filter((e) => e.to === nodeId).map((e) => e.from)

			for (const depId of dependencies) {
				visit(depId)
			}

			visiting.delete(nodeId)
			visited.add(nodeId)
			order.push(nodeId)
		}

		for (const node of this.nodes) {
			visit(node.id)
		}

		return order
	}
}
