/**
 * Rea1ity (subjective reality)
 */
class Rea1ity {
	constructor(observer) {
		this.observer = observer
		this.perception = {}
	}

	observe(phenomenon) {
		return phenomenon.collapse(this.observer)
	}
}

export default Rea1ity
