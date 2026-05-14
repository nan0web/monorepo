/**
 * ArchitectureMap — a cross-package component readiness registry.
 *
 * Tracks which UI components are implemented in which packages
 * (ui-lit, ui-cli, ui-react-bootstrap, etc.) and provides
 * a programmatic readiness matrix.
 *
 * @example
 * const map = new ArchitectureMap()
 * map.register('ui-lit', ['Button', 'Input', 'Select'])
 * map.register('ui-cli', ['Button', 'Input'])
 * map.getMatrix()
 * // → { Button: { 'ui-lit': true, 'ui-cli': true },
 * //     Input:  { 'ui-lit': true, 'ui-cli': true },
 * //     Select: { 'ui-lit': true, 'ui-cli': false } }
 * map.getReadiness('Button') // → true  (in all packages)
 * map.getReadiness('Select') // → false (missing from ui-cli)
 */
export default class ArchitectureMap {
	/** @type {Map<string, Set<string>>} packageName → Set of component names */
	#packages = new Map()

	/** @type {Set<string>} all known component names */
	#components = new Set()

	/**
	 * Register a package and its exported components.
	 *
	 * @param {string} packageName — e.g. 'ui-lit', 'ui-cli', 'ui-react-bootstrap'
	 * @param {string[]} componentsList — e.g. ['Button', 'Input', 'Select']
	 */
	register(packageName, componentsList = []) {
		this.#packages.set(packageName, new Set(componentsList))
		for (const name of componentsList) {
			this.#components.add(name)
		}
	}

	/**
	 * Get the list of all registered package names.
	 *
	 * @returns {string[]}
	 */
	getPackages() {
		return [...this.#packages.keys()]
	}

	/**
	 * Get all known component names (union of all packages).
	 *
	 * @returns {string[]}
	 */
	getComponents() {
		return [...this.#components].sort()
	}

	/**
	 * Build a readiness matrix: { componentName → { packageName → boolean } }.
	 *
	 * Every known component gets an entry for every registered package.
	 *
	 * @returns {Object<string, Object<string, boolean>>}
	 */
	getMatrix() {
		const packages = this.getPackages()
		/** @type {Object<string, Object<string, boolean>>} */
		const matrix = {}

		for (const comp of this.#components) {
			matrix[comp] = {}
			for (const pkg of packages) {
				matrix[comp][pkg] = this.#packages.get(pkg)?.has(comp) ?? false
			}
		}

		return matrix
	}

	/**
	 * Check if a component is implemented in ALL registered packages.
	 *
	 * @param {string} componentName
	 * @returns {boolean}
	 */
	getReadiness(componentName) {
		if (this.#packages.size === 0) return false
		for (const components of this.#packages.values()) {
			if (!components.has(componentName)) return false
		}
		return true
	}

	/**
	 * Get a summary: { total, ready, notReady, readyPercent }.
	 *
	 * @returns {{ total: number, ready: number, notReady: number, readyPercent: number }}
	 */
	getSummary() {
		const components = this.getComponents()
		const total = components.length
		const ready = components.filter((c) => this.getReadiness(c)).length
		return {
			total,
			ready,
			notReady: total - ready,
			readyPercent: total > 0 ? Math.round((ready / total) * 100) : 0,
		}
	}
}

export { ArchitectureMap }
