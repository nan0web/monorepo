import Phenomenon from './Phenomenon.js'

/**
 * Rea0ity (objective reality)
 */
class Rea0ity {
	constructor() {
		this.superposition = new Map()
	}

	entangle(potentials) {
		potentials.forEach((p, i) => {
			this.superposition.set(p.probability, p)
			if (i > 0) {
				p.entangleWith(potentials[i - 1])
			}
		})
		return this
	}
}

export default Rea0ity
