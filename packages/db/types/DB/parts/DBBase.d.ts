/**
 * Base database class providing core infrastructure for document storage and retrieval.
 * Handles configuration, events, mounting, path resolution, and directory operations.
 * Serves as the foundation layer in the layered inheritance chain.
 *
 * Key features:
 * - URI-based path resolution and normalization
 * - Caching via in-memory Maps for data and metadata
 * - Event system with on/emit/watch/unwatch
 * - Mount/unmount support for federated databases
 * - Directory traversal with indexing support
 *
 * @abstract
 * @class
 */
export default class DBBase {
    /**
     * Duck-typing check for DB instances.
     * Works across package boundaries where instanceof may fail
     * due to duplicate module copies (npm + workspace:*).
     * @param {any} obj
     * @returns {boolean}
     */
    static isDB(obj: any): boolean;
    /**
     * Creates a new DB instance from input object.
     * Supports DB instances, plain objects with constructor options, or undefined.
     * @param {object | any} [input] - Input object or DB instance
     * @returns {any} New DB instance
     */
    static from(input?: object | any): any;
    /**
     * Creates a new DB instance from input object
     * that can include configuration for:
     * - root directory,
     * - working directory,
     * - data and metadata maps,
     * - connection status,
     * - attached databases,
     * - console for the debug, silent = true by default.
     * - auth context for access control.
     *
     * @param {object} input
     * @param {string} [input.cwd="."] - Current working directory (base for absolute paths)
     * @param {string} [input.root="."] - Root path for URI resolution
     * @param {DBDriverProtocol} [input.driver=new DBDriverProtocol()] - Access control driver
     * @param {boolean} [input.connected=false] - Connection status
     * @param {Map<string, any | false>} [input.data=new Map()] - In-memory data cache
     * @param {Map<string, DocumentStat>} [input.meta=new Map()] - Metadata cache
     * @param {number} [input.ttl=0] - Cache life time.
     * @param {AuthContext | object} [input.context=new AuthContext()] - Authentication/authorization context
     * @param {Map<string, any> | Array<readonly [string, any]>} [input.predefined=new Map()] - Data for memory operations.
     * @param {DB[]} [input.dbs=[]] - Attached sub-databases
     * @param {Function | Map<string, Function>} [input.models] - Model class(es) for hydration
     * @param {Function} [input.Model] - Shorthand: single Model class for all URIs
     * @param {Record<string, string>} [input.aliases={}] - URI aliases for virtual projection
     * @param {Console | NoConsole} [input.console=new NoConsole()] - Logging console
     * @param {FormatRegistry} [input.registry] - Format registry instance
     * @param {Array<{ext: string, load: (str: string, ext: string) => any, save: (doc: any, ext: string) => string}>} [input.formats] - Custom format registrations
     */
    constructor(input?: {
        cwd?: string | undefined;
        root?: string | undefined;
        driver?: DBDriverProtocol | undefined;
        connected?: boolean | undefined;
        data?: Map<string, any> | undefined;
        meta?: Map<string, DocumentStat> | undefined;
        ttl?: number | undefined;
        context?: AuthContext | object;
        predefined?: Map<string, any> | (readonly [string, any])[] | undefined;
        dbs?: DB[] | undefined;
        models?: Function | Map<string, Function> | undefined;
        Model?: Function | undefined;
        aliases?: Record<string, string> | undefined;
        console?: Console | NoConsole | undefined;
        registry?: FormatRegistry | undefined;
        formats?: {
            ext: string;
            load: (str: string, ext: string) => any;
            save: (doc: any, ext: string) => string;
        }[] | undefined;
    });
    /** @type {FormatRegistry} */
    registry: FormatRegistry;
    /** @type {DBDriverProtocol} */
    driver: DBDriverProtocol;
    /** @type {string} */
    encoding: string;
    /** @type {Map<string, any | false>} */
    data: Map<string, any | false>;
    /** @type {Map<string, DocumentStat>} */
    meta: Map<string, DocumentStat>;
    /** @type {number} */
    ttl: number;
    /** @type {AuthContext} */
    context: AuthContext;
    /** @type {boolean} */
    connected: boolean;
    /** @type {string} */
    root: string;
    /** @type {string} */
    cwd: string;
    /** @type {DB[]} */
    dbs: DB[];
    /** @type {Map<string, DB>} Sorted by prefix length descending for longest-match routing */
    mounts: Map<string, DB>;
    /** @type {Map<string, Function>} URI-prefix → Model class for hydration */
    models: Map<string, Function>;
    /** @type {Map} */
    predefined: Map<any, any>;
    /** @type {Record<string, string>} URI aliases for virtual projection */
    aliases: Record<string, string>;
    /** @type {Map<string, any>} */
    _inheritanceCache: Map<string, any>;
    /** @type {Map<string, DocumentEntry[]>} Directory entry cache for listDir/getGlobals */
    _dirCache: Map<string, DocumentEntry[]>;
    /**
     * Resolves a URI alias. If the URI matches a registered alias,
     * returns the real target URI. Otherwise returns the original URI unchanged.
     * Used for virtual projection of files (e.g., docs/en/README.md → ./README.md).
     * @param {string} uri - The URI to resolve
     * @returns {string} The resolved URI (alias target or original)
     */
    resolveAlias(uri: string): string;
    get Driver(): any;
    /**
     * Returns whether the database directory has been loaded
     * @returns {boolean}
     * Returns state of ?loaded marker in meta Map
     * After .connect() and .readDir() the marker is placed as {mtime: true}
     * Because we can load only once when depth=0, and every subsequent .readBranch() is depth>0
     * and works with fully loaded DocumentEntry or DocumentStat data
     */
    get loaded(): boolean;
    /**
     * Fetches the index document for a directory.
     * Returns empty object if index does not exist or Directory configuration is missing.
     * @param {string} [dir=''] - The directory path
     * @returns {Promise<Record<string, any>>}
     */
    fetchIndex(dir?: string): Promise<Record<string, any>>;
    /**
     * Returns constructor options to save and restore database instance later.
     * @returns {Record<string, any>}
     */
    get options(): Record<string, any>;
    /** @returns {Console | NoConsole} */
    get console(): Console | NoConsole;
    /**
     * Subscribes to an event (e.g. 'fallback').
     * @param {string} event
     * @param {Function} fn
     * @returns {void}
     */
    on(event: string, fn: Function): void;
    /**
     * Emits an event to all registered listeners.
     * @param {string} event
     * @param {any} data
     * @returns {void}
     */
    emit(event: string, data: any): void;
    /**
     * Watches a URI for changes. Callback receives change events for
     * the given URI or any URI under it (prefix match).
     * @param {string} uri - URI or prefix to watch
     * @param {Function} callback - Called with { uri, type, data }
     * @returns {Function} Unsubscribe function
     */
    watch(uri: string, callback: Function): Function;
    _watchers: Map<any, any> | undefined;
    /**
     * Stops watching a URI. If callback is provided, removes only that
     * specific watcher. Otherwise removes all watchers for the URI.
     * @param {string} uri - URI to unwatch
     * @param {Function} [callback] - Specific callback to remove
     */
    unwatch(uri: string, callback?: Function): void;
    /**
     * Registers a Model class for a URI prefix.
     * When fetch() returns data, it will be hydrated through the Model.
     * @param {string} prefix - URI prefix (e.g. 'users', 'config')
     * @param {Function} ModelClass - Class with `from(data)` or constructor(data)
     */
    model(prefix: string, ModelClass: Function): void;
    /**
     * Returns Data helper class that is assigned to DB or its extension.
     * Define your own Data provider to extend its logic, no need to extend getter.
     * ```js
     * class DataExtended extends DB {
     *   static OBJECT_DIVIDER = "."
     * }
     * class DBExtended extends DB {
     *   static Data = DataExtended
     * }
     * ```
     * @returns {typeof Data}
     */
    get Data(): typeof Data;
    /**
     * Returns static.Directory that is assigned to DB or its extension.
     * Define your own static.Directory, no need to extend getter.
     * ```js
     * class DirectoryExtended extends Directory {
     *   static FILE = "$"
     *   static DATA_EXTNAMES = [".md", ".csv"]
     * }
     * class DBExtended extends DB {
     *   static Directory = DirectoryExtended
     * }
     * ```
     * @returns {typeof Directory}
     */
    get Directory(): typeof Directory;
    /**
     * @returns {typeof DirectoryIndex}
     */
    get Index(): typeof DirectoryIndex;
    /**
     * Returns static.GetOptions that is assigned to DB or its extension.
     * Define your own static.GetOptions, no need to extend getter.
     * ```js
     * class GetOptionsExtended extends GetOptions {
     *   defaultValue = ""
     * }
     * class DBExtended extends DB {
     *   static GetOptions = GetOptionsExtended
     * }
     * ```
     * @returns {typeof GetOptions}
     */
    get GetOptions(): typeof GetOptions;
    /**
     * @param {string} abs
     * @returns {DocumentStat}
     */
    _statFromMeta(abs: string): DocumentStat;
    isRoot(dir: any): boolean;
    /**
     * Resolves the actual underlying URI for a path.
     * In the base abstract DB, this simply normalizes the URI.
     * Adapters like db-fs override this to resolve symlinks and firmlinks.
     * @param {string} uri The URI to resolve
     * @returns {string} The resolved real URI
     */
    realpath(uri: string): string;
    /**
     * Returns a public website or application route path for a data document.
     * Resolves document URIs to clean web routes relative to the database cwd:
     * - Root index ('index.md', 'index.yaml', '') resolves to '/'
     * - Directory index ('en/docs/index.md', 'en/docs/') resolves to '/en/docs/'
     * - Regular documents ('en/docs/architecture.yaml') resolve to '/en/docs/architecture'
     * - Supports appending a target output extension, e.g. ext='html' or '.html'
     * - Returns FALSE for directory configs ('_.yaml', '_.nan0'), globals ('_/analytics.yaml', '_/t.yaml'),
     *   or files that are not valid data documents (not in Directory.DATA_EXTNAMES).
     *
     * @param {string} uri Document URI or path
     * @param {string} [ext] Target route extension to add (e.g. 'html' or '.html')
     * @returns {string | false} Clean web route path or false if not a routable document
     */
    route(uri: string, ext?: string): string | false;
    /**
     * Returns a list of mounted database instances.
     * @returns {Array<{ prefix: string, db: DB }>} Array of mount records
     */
    getMounts(): Array<{
        prefix: string;
        db: DB;
    }>;
    /**
     * Returns a mounted database instance by prefix.
     * @param {string} prefix The path prefix to find the mounted database for
     * @returns {DB | undefined} The mounted database instance or undefined if not found
     */
    getMount(prefix: string): DB | undefined;
    /**
     * Returns available system volumes/disks as URIs.
     * Overridden by adapters that support physical drives.
     * @returns {Promise<string[]>} Array of volume URIs (e.g., ['/'])
     */
    getVolumes(): Promise<string[]>;
    /**
     * Mounts a database instance to a path prefix.
     * All requests to URIs starting with this prefix will be routed to the mounted DB.
     * @param {string} path - The virtual path prefix (e.g. '~', '@public')
     * @param {DB} db - The database instance to mount
     * @throws {TypeError} If non-DB instance is provided
     * @throws {Error} If mount registry has been sealed
     */
    mount(path: string, db: DB): void;
    /**
     * Unmounts a database from a path.
     * @param {string} path
     * @returns {boolean} TRUE if mount existed and was removed
     * @throws {Error} If mount registry has been sealed
     */
    unmount(path: string): boolean;
    /**
     * Seals the mount registry, preventing any further mount/unmount operations.
     * Call after all databases are mounted during initialization.
     * This prevents plugin or untrusted code from hijacking mount points.
     * @returns {void}
     */
    seal(): void;
    /**
     * Returns whether the mount registry is sealed.
     * @returns {boolean}
     */
    get sealed(): boolean;
    /**
     * Finds the mounted DB for a given URI.
     * Uses longest-prefix matching (most specific mount wins).
     * Throws a clear error if URI targets a reserved mount prefix
     * (tilde or at-sign) that has not been mounted — prevents silent null returns.
     * @param {string} uri
     * @returns {{ db: DB, subUri: string } | null}
     * @throws {Error} If URI targets an unmounted reserved prefix
     */
    _findMount(uri: string): {
        db: DB;
        subUri: string;
    } | null;
    /**
     * Attaches another DB instance to this database for fallback access.
     * When primary fetch fails, attached databases are tried in order.
     * @param {DB} db - Database to attach
     * @returns {void}
     * @throws {TypeError} If non-DB instance is provided
     */
    attach(db: DB): void;
    /**
     * Detaches a database instance from this database.
     * @param {DB} db - Database to detach
     * @returns {DB[]|boolean} Array of detached database or false if not found
     */
    detach(db: DB): DB[] | boolean;
    /**
     * Creates a new DB instance with a subset of the data and meta,
     * scoped to a specific URI prefix.
     *
     * The returned database works as if the supplied `uri` were its
     * virtual root:
     *   - `root` property reflects the new virtual root (`.../uri/`).
     *   - `cwd` is inherited from the parent so that `absolute()` still
     *     produces full URLs.
     *   - `resolveSync()` is overridden to return paths **relative** to the
     *     extracted root (i.e. the prefix is stripped).
     *
     * @param {string} uri The URI to extract from the current DB.
     * @returns {DB} New DB instance with filtered data and metadata.
     */
    extract(uri: string): DB;
    /**
     * Extracts file extension with leading dot from URI
     * @param {string} uri
     * @returns {string} Extension (e.g., ".txt") or empty string
     * @example
     * db.extname("file.TXT") // => .txt
     */
    extname(uri: string): string;
    /**
     * Relative path resolver for file systems.
     * Returns path relative to database root.
     * @param {string} to Target directory path
     * @param {string} [from=this.root] Base directory path
     * @returns {string} Relative path
     */
    relative(to: string, from?: string): string;
    /**
     * Get string representation of the database
     * @returns {string} Formatted string like "DB /root [utf-8]"
     */
    toString(): string;
    /**
     * Dumps current database into destination database.
     * Copies all documents and builds indexes in the destination.
     * @param {DB} dest - Destination database
     * @param {object} [options]
     * @param {({ uri, url, data, current, total }) => void} [options.onProgress] - Progress callback
     * @returns {Promise<{ total: number, processed: number, ignored: number, updatedURIs: string[] }>}
     */
    dump(dest: DB, options?: {
        onProgress?: (({ uri, url, data, current, total }: {
            uri: any;
            url: any;
            data: any;
            current: any;
            total: any;
        }) => void) | undefined;
    }): Promise<{
        total: number;
        processed: number;
        ignored: number;
        updatedURIs: string[];
    }>;
    /**
     * Build indexes inside the directory.
     * Generates `index.txt` and `index.txtl` files for efficient traversal.
     * @param {string} dir - Directory URI (default: '.')
     * @returns {Promise<void>}
     */
    buildIndexes(dir?: string): Promise<void>;
    /**
     *
     * @param {string} dirPath The directory path.
     * @param {Array<[string, DocumentStat]>} [entries=[]] Entries to extend with the files found.
     * @param {number} [depth=0] The depth level.
     * @returns
     */
    _buildRecursiveDirectoryTree(dirPath: string, entries?: Array<[string, DocumentStat]>, depth?: number): Promise<[string, DocumentStat][]>;
    /**
     * Reads the content of a directory at the specified URI.
     * For FetchDB it loads index.txt or manifest.json.
     * For NodeFsDB it uses readdirSync recursively.
     *
     * Supports filtering, depth limiting, and skipping stats/indexes for performance.
     *
     * @async
     * @generator
     * @param {string} uri - The URI of the directory to read
     * @param {object} [options] - Read directory options
     * @param {AuthContext | object} [options.context] - Auth context
     * @param {number} [options.depth=-1] - The depth to which subdirectories should be read (-1 means unlimited)
     * @param {boolean} [options.skipStat=false] - Whether to skip collecting file statistics
     * @param {boolean} [options.includeDirs=false] - Whether to skip or include directories.
     * @param {boolean} [options.skipSymbolicLink=false] - Whether to skip symbolic links
     * @param {boolean} [options.skipIndex=false] - Skip index files
     * @param {(string|RegExp)[]} [options.ignore=[]] - Patterns to ignore
     * @param {Function} [options.filter] - A filter function to apply to directory entries
     * @yields {DocumentEntry}
     * @returns {AsyncGenerator<DocumentEntry, void, unknown>}
     */
    readDir(uri: string, options?: {
        context?: AuthContext | object;
        depth?: number | undefined;
        skipStat?: boolean | undefined;
        includeDirs?: boolean | undefined;
        skipSymbolicLink?: boolean | undefined;
        skipIndex?: boolean | undefined;
        ignore?: (string | RegExp)[] | undefined;
        filter?: Function | undefined;
    }): AsyncGenerator<DocumentEntry, void, unknown>;
    /**
     * Reads a specific branch at given depth
     * @param {string} uri - URI for the branch
     * @param {number} [depth=-1] - Depth of read
     * @returns {Promise<AsyncGenerator<DocumentEntry, void, unknown>>}
     */
    readBranch(uri: string, depth?: number): Promise<AsyncGenerator<DocumentEntry, void, unknown>>;
    /**
     * Ensures DB is connected. Throws if connection fails.
     * @returns {Promise<void>}
     * @throws {Error} If connection cannot be established
     */
    requireConnected(): Promise<void>;
    /**
     * Searches for URI matching condition
     * @param {string | ((path: string) => boolean)} uri - Search pattern or callback
     * @param {number} [depth=0] - Maximum depth to search
     * @yields {string} Full URI path of found documents
     * @returns {AsyncGenerator<string, void, unknown>}
     */
    find(uri: string | ((path: string) => boolean), depth?: number): AsyncGenerator<string, void, unknown>;
    /**
     * Synchronize data with persistent storage
     * Saves changed documents where local mtime > remote stat mtime.
     * @param {string|undefined} [uri] Optional specific URI to save
     * @param {AuthContext | object} [context=this.context] - Auth context
     * @returns {Promise<string[]>} Array of saved URIs
     */
    push(uri?: string | undefined, context?: AuthContext | object): Promise<string[]>;
    /**
     * Invalidate in-memory data cache for a URI and its absolute path.
     * @param {string} uri - Document URI
     */
    _invalidateDataCache(uri: string): void;
    /**
     * Invalidate directory entry cache for a URI and all its parent directories.
     * @param {string} uri - Document URI
     */
    _invalidateDirCache(uri: string): void;
    /**
     * Checks if the given URI contains data in the in-memory cache.
     * @param {string} uri - Document URI
     * @returns {boolean}
     */
    isData(uri: string): boolean;
    /**
     * Resolves path segments to absolute path
     * @note Must be overwritten by platform-specific implementation
     * @param  {...string} args - Path segments
     * @returns {Promise<string>} Resolved absolute path
     */
    resolve(...args: string[]): Promise<string>;
    /**
     * Normalize path segments to absolute path
     * Handles .., ., and duplicate slashes.
     * @param  {...string} args - Path segments
     * @returns {string} Normalized path
     */
    normalize(...args: string[]): string;
    /**
     * Checks if current uri has scheme in it, such as http://, https://, ftp://, file://, etc.
     * @param {string} uri
     * @returns {boolean}
     */
    isRemote(uri: string): boolean;
    /**
     * Checks if current uri is absolute (started from /) or remote.
     * @param {string} uri
     * @returns {boolean}
     */
    isAbsolute(uri: string): boolean;
    /**
     * Resolves path segments to absolute path synchronously
     * Combines cwd, root, and args with normalization.
     * @param  {...string} args - Path segments
     * @returns {string} Resolved absolute path
     */
    resolveSync(...args: string[]): string;
    /**
     * Returns base name of URI with the removedSuffix (if provided).
     * If removeSuffix is true the extension will be removed.
     * @param {string} uri
     * @param {string | true} [removeSuffix] - Suffix to remove or true for extension
     * @returns {string}
     */
    basename(uri: string, removeSuffix?: string | true): string;
    /**
     * Returns directory name of URI
     * @param {string} uri
     * @returns {string}
     */
    dirname(uri: string): string;
    /**
     * Gets absolute path
     * @note Must be overwritten by platform-specific implementation
     * @param  {...string} args - Path segments
     * @returns {string} Absolute path
     */
    absolute(...args: string[]): string;
    /**
     * Returns physical location on the host filesystem for the provided uri.
     * Routes to mounts if possible.
     * @param {string} uri - Document URI
     * @returns {string} Absolute location on the drive.
     */
    location(uri: string): string;
    #private;
}
import FormatRegistry from '../../FormatRegistry.js';
import DBDriverProtocol from '../DriverProtocol.js';
import DocumentStat from '../../DocumentStat.js';
import AuthContext from '../AuthContext.js';
import DocumentEntry from '../../DocumentEntry.js';
import { NoConsole } from '@nan0web/log';
import DirectoryIndex from '../../DirectoryIndex.js';
