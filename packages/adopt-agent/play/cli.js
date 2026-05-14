import { render, Form } from '@nan0web/ui-cli'
import { Engine } from '../src/index.js'
import { EconomyCalculator } from '../src/domain/EconomyCalculator.js'
import { ReleasePlanner } from '../src/domain/ReleasePlanner.js'

async function run() {
	const argDemo = process.argv.find((a) => a.startsWith('--demo='))
	console.log('🤖 Starting Terminal Interface...')

	const engine = new Engine()
	await engine.boot()

	if (argDemo) {
		console.log('\n✅ Initialized AI Configuration Snapshot:')
		render({ data: engine.config })
		return
	}

	console.log(`\n======================================`)
	console.log(` 🏛️ Етап 1: Оцінка місії та економіки`)
	console.log(`======================================\n`)

	const ecoForm = Form.createFromBodySchema(EconomyCalculator)
	await ecoForm.requireInput()
	const calc = new EconomyCalculator(ecoForm.body)

	const evaluation = calc.evaluate()
	render({ data: evaluation })

	if (!evaluation.aligned) {
		console.log('\n❌ Розробку зупинено. Знайдіть справжню мету.')
		process.exit(1)
	}

	console.log(`\n======================================`)
	console.log(` 📅 Етап 2: Планувальник релізу`)
	console.log(`======================================\n`)

	const relForm = Form.createFromBodySchema(ReleasePlanner)
	await relForm.requireInput()
	const planner = new ReleasePlanner(relForm.body)

	console.log('\n📝 Auto-generated Markdown Plan:')
	console.log(planner.generateMarkdown())
}

run().catch(console.error)
