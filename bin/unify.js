import { bootstrapApp } from '@nan0web/ui-cli'
import UnifyMonorepoApp from '../src/domain/app/UnifyMonorepoApp.js'

bootstrapApp(UnifyMonorepoApp, {}).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
