import { Model } from '@nan0web/types'

/**
 * DomeModel — Domain Model for Geodesic Dome calculations.
 */
export class DomeModel extends Model {
	static radius = { help: 'Радіус купола (м)', type: 'number', default: 4.5 }
	static floors = { help: 'Кількість поверхів (1-3)', type: 'number', default: 2 }
	static hasBasement = { help: 'Облаштувати підвал (так/ні)', type: 'boolean', default: true }

	/** @type {number} */ radius
	/** @type {number} */ floors
	/** @type {boolean} */ hasBasement

	constructor(data = {}) {
		super(data)
		this.radius = Number(data.radius ?? DomeModel.radius.default)
		this.floors = Number(data.floors ?? DomeModel.floors.default)
		this.hasBasement = Boolean(data.hasBasement ?? DomeModel.hasBasement.default)
	}

	/**
	 * Performs full geodesic dome structural calculations.
	 */
	calculate() {
		const r = this.radius
		const d = r * 2
		const height = r
		const domeVolume = (2 / 3) * Math.PI * Math.pow(r, 3)
		const domeSurface = 2 * Math.PI * Math.pow(r, 2)

		// Calculate areas of floors based on sphere curvature at 3m height intervals
		const floorsList = []
		for (let i = 0; i < this.floors; i++) {
			const z = 3 * i
			if (z < r) {
				const floorRadius = Math.sqrt(r * r - z * z)
				const area = Math.PI * floorRadius * floorRadius
				floorsList.push({ index: i + 1, radius: floorRadius, area })
			} else {
				floorsList.push({ index: i + 1, radius: 0, area: 0 })
			}
		}

		const basementArea = this.hasBasement ? Math.PI * r * r : 0
		const basementVolume = this.hasBasement ? Math.PI * r * r * 3 : 0 // 3m depth

		const totalArea = floorsList.reduce((acc, curr) => acc + curr.area, 0) + basementArea
		const totalVolume = domeVolume + basementVolume

		return {
			diameter: d,
			height,
			domeVolume,
			domeSurface,
			floorsList,
			basementArea,
			basementVolume,
			totalArea,
			totalVolume,
		}
	}
}
