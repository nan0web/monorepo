import { bootstrapApp } from '@nan0web/ui-cli'
import BumpMonorepoApp from '../src/domain/app/BumpMonorepoApp.js'

bootstrapApp(BumpMonorepoApp, {}).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
