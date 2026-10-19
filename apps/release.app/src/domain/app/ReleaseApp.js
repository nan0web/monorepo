import { ModelAsApp } from '@nan0web/ui'
import { StatusCommand } from '../StatusCommand.js'
import { WebCommand } from '../WebCommand.js'
import { PreviewCommand } from '../PreviewCommand.js'
import { CheckCommand, ValidateCommand, ExampleCommand, InitCommand } from '@nan0web/release'

/**
 * ReleaseApp - Main Application Controller for Global Release Hub.
 */
export class ReleaseApp extends ModelAsApp {
	static alias = 'release-app'

	static UI = {
		title: 'Global PM-as-Code Release Hub',
	}

	static command = {
		help: 'Command to execute',
		options: [
			StatusCommand,
			WebCommand,
			PreviewCommand,
			CheckCommand,
			ValidateCommand,
			ExampleCommand,
			InitCommand,
		],
		positional: true,
		default: StatusCommand,
	}
}

export default ReleaseApp


