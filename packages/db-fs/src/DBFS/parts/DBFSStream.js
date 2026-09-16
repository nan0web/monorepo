import DBFSDir from './DBFSDir.js'

/**
 * Streaming and file system traversal layer for filesystem database.
 * Serves as the top layer in the DBFS parts chain before the DBFS facade.
 *
 * @class
 * @extends {DBFSDir}
 */
export default class DBFSStream extends DBFSDir {
	// Specialized DBFS streaming extensions or overrides can be placed here.
	// DBBase/DBDir already provide base findStream capabilities.
}
