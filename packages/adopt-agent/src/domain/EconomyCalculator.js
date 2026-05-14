import { Model } from '@nan0web/core'

export class EconomyCalculator extends Model {
	static mission = {
		help: 'Навіщо ми це створюємо? Яка фундаментальна місія для людства? (Фільтр на рабство грошей)',
		default: 'Покращення життя та свободи',
	}

	static developmentCost = {
		help: 'Очікувані витрати на розробку (в годинах або USDT)',
		default: 1000,
	}

	static monthlyPrice = {
		help: 'Вартість підписки (USDT) для суверенного користувача',
		default: 18,
	}

	static expectedUsers = {
		help: 'Очікувана кількість суверенних користувачів (Аудиторія)',
		default: 100,
	}

	/** @param {any} [data] */
	constructor(data = {}) {
		super(data)
		/** @type {string|undefined} */ this.mission
		/** @type {number|undefined} */ this.developmentCost
		/** @type {number|undefined} */ this.monthlyPrice
		/** @type {number|undefined} */ this.expectedUsers
	}

	evaluate() {
		const isMoneySlavery =
			this.mission.toLowerCase().includes('заробити') ||
			this.mission.toLowerCase().includes('гроші') ||
			this.mission.toLowerCase().includes('money')

		const monthlyRevenue = this.monthlyPrice * this.expectedUsers
		const monthsToROI = this.developmentCost / monthlyRevenue

		return {
			aligned: !isMoneySlavery,
			monthlyRevenue,
			monthsToROI: isFinite(monthsToROI) ? Number(monthsToROI.toFixed(1)) : '∞',
			verdict: isMoneySlavery
				? '🚨 УВАГА: Продукт схожий на рабство заради грошей. Відхилено місією.'
				: '✅ Місія прийнята. Проєкт має фундаментальну цінність.',
		}
	}
}
