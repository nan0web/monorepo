import Observation from './Observation.js'

/**
 * Quantum Phenomenon
 * @description Pre-observed quantum state
 */
class Phenomenon {
	constructor(state) {
		this.initialState = state
		this.probabilities = new Map([[state, 1]])
		this.entangledPhenomena = new Set()
	}

	addState(state, probability) {
		if (probability === 1) {
			this.probabilities.clear()
		}
		this.probabilities.set(state, probability)
		this.normalizeProbabilities()
	}

	normalizeProbabilities() {
		let sum = [...this.probabilities.values()].reduce((a, b) => a + b, 0)
		for (let [k, v] of this.probabilities) {
			this.probabilities.set(k, v / sum)
		}
	}

	entangleWith(otherPhenomenon) {
		this.entangledPhenomena.add(otherPhenomenon)
		otherPhenomenon.entangledPhenomena.add(this)
	}

	collapse(observer) {
		// Apply consciousness weighting to probabilities
		const weightedProbs = new Map()
		const weight = 1 + Math.log10(observer.consciousnessLevel)
		for (const [state, prob] of this.probabilities) {
			weightedProbs.set(state, prob * weight)
		}

		// Normalize the weighted probabilities
		const total = Array.from(weightedProbs.values()).reduce((a, b) => a + b, 0)
		const normalized = new Map()
		for (const [state, prob] of weightedProbs) {
			normalized.set(state, prob / total)
		}

		// Handle entanglement: ensure all entangled phenomena agree on a state
		if (this.entangledPhenomena.size > 0) {
			const sharedStates = Array.from(normalized.keys()).filter((state) => {
				return Array.from(this.entangledPhenomena).every((phenom) => {
					return phenom.probabilities.has(state)
				})
			})

			if (sharedStates.length > 0) {
				// Force all entangled phenomena to collapse to the same state
				const selectedState = sharedStates[0]
				normalized.set(selectedState, 1)
			}
		}

		// Select the state based on normalized probabilities
		let selectedState = this.initialState
		let cumulative = 0
		const random = Math.random()
		for (const [state, prob] of normalized) {
			cumulative += prob
			if (random <= cumulative) {
				selectedState = state
				break
			}
		}

		// Persist the collapsed state
		this.probabilities.clear()
		this.probabilities.set(selectedState, 1)

		observer.lastObservation = new Observation(selectedState, observer)
		return observer.lastObservation
	}

	uniqueHash(str) {
		let hash = 0
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i)
			hash |= 0
		}
		return Math.abs(hash % 100) / 100
	}
}

export default Phenomenon
