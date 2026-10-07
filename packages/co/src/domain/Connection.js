import { Model } from '@nan0web/types'

/**
 * Connection
 * 
 * Defines the relationship (role/context) between an Identity and a Context.
 * Extends standard Model.
 *
 * @class Connection
 * @extends Model
 */
export default class Connection extends Model {
	/** @type {string} */
	target_did = ''
	/** @type {string} */
	context = ''
	/** @type {string} */
	role = ''
	/** @type {object} */
	attributes = {}

	static target_did = { type: 'string', help: 'DID of the Community, Course, or Person' }
	static context = { type: 'string', help: 'Context ID (e.g., "school_of_architepics")' }
	static role = { type: 'string', help: 'Role in this context: "teacher", "student", "member"' }
	static attributes = { type: 'object', default: {}, help: 'Context-specific data' }
}
