/**
 * Quantum Observer
 * @description Consciousness that collapses wave function
 */
class Observer {
	constructor(id, consciousnessLevel = 1) {
		this.id = id
		this.consciousnessLevel = consciousnessLevel
		this.entangledObservers = new Set()
	}

	entangleWith(otherObserver) {
		this.entangledObservers.add(otherObserver)
		otherObserver.entangledObservers.add(this)
	}

	toString() {
		return `${this.id} (${this.consciousnessLevel}) [${this.entangledObservers.size} entagles]`
	}
}

export default Observer
