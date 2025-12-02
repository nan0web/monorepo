/**
 * Topological sort of a dependency map.
 *
 * @param {{[k:string]:string[]}} map
 * @returns {string[]}
 */
export function getBuildOrder(map) {
	const order = []
	const indeg = new Map()
	const adj = new Map()

	// initialise nodes
	for (const node in map) {
		indeg.set(node, 0)
		adj.set(node, [])
	}
	// edges
	for (const [node, deps] of Object.entries(map)) {
		for (const dep of deps) {
			if (!adj.has(dep)) {
				adj.set(dep, [])
				indeg.set(dep, 0)
			}
			adj.get(dep).push(node)
			indeg.set(node, indeg.get(node) + 1)
		}
	}
	// Kahn's algorithm
	const queue = []
	for (const [n, i] of indeg.entries()) if (i === 0) queue.push(n)

	while (queue.length) {
		const n = queue.shift()
		order.push(n)
		for (const m of adj.get(n) ?? []) {
			indeg.set(m, indeg.get(m) - 1)
			if (indeg.get(m) === 0) queue.push(m)
		}
	}
	if (order.length !== indeg.size) throw new Error("Circular dependency detected")
	return order
}
