export default SubCommand
declare class SubCommand {
	constructor(options?: {})
	/** @type {Logger} */
	logger: Logger
	/** @type {ReleaseDB?} */
	db: ReleaseDB | null
}
import Logger from '@nan0web/log'
import ReleaseDB from '../db/ReleaseDB.js'
