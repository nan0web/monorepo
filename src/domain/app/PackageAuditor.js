import { Model, ModelError } from '@nan0web/types'
import { progress, result } from '@nan0web/ui'
import { 
	CircularDependencyAuditor, 
	NoTypeScriptAuditor, 
	StructureAuditor, 
	StackDetector 
} from '@nan0web/inspect'

// 1. **Ніякого TypeScript** за межами `types/**/*.d.ts`
//    → Типізація через **JsDoc**, `tsc` тільки для валідації
// 2. **100% покриття тестами**
//    → `pnpm test:coverage` має падати, якщо <90%
// 3. **Довірена документація**
//    → `src/README.md.js` — виконується як **тест** і генерує:
//    - `./README.md` (англ)
//    - `.datasets/README.jsonl` (LLM-ready dataset)
// 4. **Деталі структури** — `system.md` в пакеті
//    → Тільки українською мовою, як свідомий фільтр
// 5. **Кожен пакет має `playground/`**
//    → Локальна CLI/SSG-демонстрація роботи, без build
// 6. **Немає примусу**
//    → Все працює локально, анонімно, без реєстрації
// 7. **Фізичний артефакт (реліз)**
//    → `release.json`, `vN.M.P.jsonl`, archive — в майбутньому доступний через датасет
// 8. **Циклічні залежності**
//   скануємо на відсутність циклічних залежностей

export class PackageAuditor extends Model {
	static $id = '@nan0web/nan0web/PackageAuditor'

	static UI = {
		errorDbConnection: 'Cannot connect to database',
		auditing: 'Auditing package in {dir}',
		complete: 'Audit complete for {dir}',
	}

	static dir = {
		help: 'Package directory',
		default: '.',
	}

	/**
	 * @param {Partial<PackageProtocol> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Package directory */ this.dir
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const t = this._.t
		if (!this._.db) {
			return result({ error: t(PackageAuditor.UI.errorDbConnection) })
		}

		yield progress(t(PackageAuditor.UI.auditing, { dir: this.dir }))

		// 0. Stack Detection
		const detector = new StackDetector({ dir: this.dir })
		const detectorResult = await detector.run().next()
		const stack = detectorResult.value.payload.stack
		
		// 1. No TypeScript in src (if JS stack)
		if (['npm', 'pnpm', 'yarn'].includes(stack)) {
			const noTsAuditor = new NoTypeScriptAuditor({ dir: this.dir })
			yield* noTsAuditor.run()
		}

		// 4, 5. Structure & Playground
		const structureAuditor = new StructureAuditor({ dir: this.dir })
		yield* structureAuditor.run()

		// 8. Circular Dependencies
		const circularAuditor = new CircularDependencyAuditor({ dir: `${this.dir}/src` })
		yield* circularAuditor.run()

		yield progress(t(PackageAuditor.UI.complete, { dir: this.dir }))
		return result({}, true)
	}
}
