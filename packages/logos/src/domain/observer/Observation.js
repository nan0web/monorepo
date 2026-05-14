/**
 * Quantum Observation
 * @description Collapsed state from superposition
 */
class Observation {
	constructor(state, observer) {
		this.state = state
		this.observer = observer
		this.timestamp = Date.now()
	}
}

export default Observation
