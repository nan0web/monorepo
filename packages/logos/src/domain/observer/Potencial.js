/**
 * Quantum Potential
 * @description Possible quantum state
 */
class Potential {
	constructor(state) {
		this.state = state
		this.probability = Math.random()
		this.entangledWith = []
	}

	entangleWith(other) {
		this.entangledWith.push(other)
	}
}

export default Potential
