import Data from '../Data.js'
import Directory from '../Directory.js'
import DirectoryIndex from '../DirectoryIndex.js'
import GetOptions from './GetOptions.js'
import FetchOptions from './FetchOptions.js'
import DBDriverProtocol from './DriverProtocol.js'
import DBModel from './parts/DBModel.js'

/**
 * Main database class for document storage and retrieval.
 * This is a thin facade that extends the layered inheritance chain (DBModel → DBFetch → DBDir → DBDoc → DBAccess → DBBase).
 * Provides static fields, duck-typing, and factory methods for backward compatibility.
 *
 * @class
 * @extends {DBModel}
 */
export default class DB extends DBModel {
	static Data = Data
	static Directory = Directory
	static Driver = DBDriverProtocol
	static Index = DirectoryIndex
	static GetOptions = GetOptions
	static FetchOptions = FetchOptions
	static DATA_EXTNAMES = [
		'.json',
		'.csv',
		'.yaml',
		'.yml',
		'.nan0',
		'.nano',
		'.html',
		'.xml',
		'.md',
	]

	/**
	 * Duck-typing check for DB instances.
	 * Works across package boundaries where instanceof may fail
	 * due to duplicate module copies (npm + workspace:*).
	 * @param {any} obj
	 * @returns {boolean}
	 */
	static isDB(obj) {
		return (
			obj &&
			typeof obj.fetch === 'function' &&
			typeof obj.set === 'function' &&
			typeof obj.stat === 'function'
		)
	}

	/**
	 * Creates a new DB instance from input object.
	 * Supports DB instances, plain objects with constructor options, or undefined.
	 * @param {object | DB} input - Input object or DB instance
	 * @returns {DB} New DB instance
	 */
	static from(input) {
		if (!input) return new this()
		if (input instanceof this) return input
		return new this(input)
	}
}
