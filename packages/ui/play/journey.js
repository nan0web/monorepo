import { ShowcaseAppModel } from '../src/domain/ShowcaseAppModel.js'
import { runGenerator } from '../src/index.js'
import { CLiInputAdapter as InputAdapter } from '../../ui-cli/src/index.js'
import Logger from '@nan0web/log'

const log = new Logger()
const model = new ShowcaseAppModel()
const adapter = new InputAdapter({ 
	console: log,
	// Automate input to avoid hanging in CI/Tests
	predefined: 'y,Yaroslav Lukyanenko,Developer,Node.js,y'
})

async function main() {
	console.log('--- STARTING JOURNEY SHOWCASE ---')
	await runGenerator(model.run(), adapter)
	console.log('--- JOURNEY COMPLETED ---')
}

main().catch(console.error)
