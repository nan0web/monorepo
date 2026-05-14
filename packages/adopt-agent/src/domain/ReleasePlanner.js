import { Model } from '@nan0web/core'

export class ReleasePlanner extends Model {
	static version = {
		help: 'Версія релізу (напр. 1.0.0)',
		default: '1.0.0',
	}

	static focus = {
		help: 'Головний фокус релізу (Архітектура, Fixes, UI)',
		default: 'Архітектура',
	}

	static verified = {
		help: 'Чи пройшов код TDD та Contract Verify? (true/false)',
		default: 'false',
	}

	/** @param {any} [data] */
	constructor(data = {}) {
		super(data)
		/** @type {string|undefined} */ this.version
		/** @type {string|undefined} */ this.focus
		/** @type {boolean|undefined} */ this.verified

		// Map string booleans if typed from cli
		if (typeof this.verified === 'string') {
			this.verified = this.verified === 'true'
		}
	}

	generateMarkdown() {
		return [
			`# 📦 Release Plan: v${this.version}`,
			``,
			`**🎯 Focus:** ${this.focus}`,
			`**🛡️ Verified:** ${this.verified ? '✅ Так' : '❌ Ні (Потрібен Contract Verify)'}`,
			``,
			`## Задачі пулу:`,
			`- [ ] Оновлені тести`,
			`- [ ] Оновлена документація (README.md.js / Docs Site)`,
		].join('\n')
	}
}
