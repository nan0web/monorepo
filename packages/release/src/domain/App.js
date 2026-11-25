import { ModelAsApp } from "@nan0web/ui"
import InitCommand from './InitCommand.js'
import CheckCommand from './CheckCommand.js'
import CloseCommand from './CloseCommand.js'
import DepsCommand from './DepsCommand.js'
import PublishCommand from './PublishCommand.js'
import SpecCommand from './SpecCommand.js'
import StatusCommand from './StatusCommand.js'
import BumpCommand from './BumpCommand.js'
import WebCommand from './WebCommand.js'
import PreviewCommand from './PreviewCommand.js'
import ViewCommand from './ViewCommand.js'
import ListCommand from './ListCommand.js'
import ServeCommand from './ServeCommand.js'
import ValidateCommand from './ValidateCommand.js'
import ExampleCommand from './ExampleCommand.js'
import TodoCommand from './TodoCommand.js'
import TrayCommand from './TrayCommand.js'
import TodoServeCommand from './TodoServeCommand.js'
import SyncCommand from './SyncCommand.js'
import BatchCommand from './BatchCommand.js'

export class ReleaseApp extends ModelAsApp {
	static alias = 'release'

	/**
	 * @param {Partial<ReleaseApp>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {any} */ this.command
	}

	static UI = {
		title: 'PM-as-Code Release Protocol (nan0release)',
	}

	static command = {
		help: 'Subcommand to run',
		options: [
			InitCommand,
			CheckCommand,
			ValidateCommand,
			TodoCommand,
			TrayCommand,
			TodoServeCommand,
			SyncCommand,
			BatchCommand,
			CloseCommand,
			DepsCommand,
			PublishCommand,
			SpecCommand,
			StatusCommand,
			BumpCommand,
			WebCommand,
			PreviewCommand,
			ViewCommand,
			ListCommand,
			ServeCommand,
			ExampleCommand,
		],
		positional: true,
		default: ViewCommand,
	}
}

export default ReleaseApp

