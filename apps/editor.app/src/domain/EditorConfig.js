import { Model } from '@nan0web/types'
import { EditorPermissions } from './EditorPermissions.js'

/**
 * EditorConfig — Model-as-Schema for editor.app integration policy.
 *
 * Determines HOW the editor behaves within nan0web.app:
 *   - bundled: false → Host mode (local SSR only, git clone → npm start)
 *   - bundled: true  → Client mode (browser editing)
 *     - publicWrite: false → Sandbox (changes stay local, no server persistence)
 *     - publicWrite: true  → Wiki mode (anyone can save, no auth required)
 *     - When auth.app is present → publicWrite is overridden by auth policies
 */
export class EditorConfig extends Model {

	/** @type {string} */ static UI = {
		title: 'Editor Configuration',
		description: 'Integration policy for editor.app micro-app',
		icon: '✏️',
	}

	static bundled = {
		help: 'Pack editor into frontend build (false = host-only SSR editing)',
		type: 'boolean',
		default: false,
	}

	static publicWrite = {
		help: 'Allow unauthenticated saves via API (wiki mode). Overridden when auth.app is active',
		type: 'boolean',
		default: false,
	}

	static defaultExport = {
		help: 'Default export strategy for changes',
		type: 'enum',
		options: ['incremental', 'partial', 'full'],
		default: 'incremental',
	}

	static diffPreview = {
		help: 'Show structural diff before committing changes',
		type: 'boolean',
		default: true,
	}

	static importEnabled = {
		help: 'Allow importing patches and documents',
		type: 'boolean',
		default: true,
	}

	// UI Configuration (Configurable via Model)
	static uiShowStagedMarkers = {
		help: 'Highlight documents with uncommitted changes',
		type: 'boolean',
		default: true,
	}

	static uiStagedMarkerColor = {
		help: 'Color for staging indicators (CSS color or token)',
		type: 'string',
		default: 'var(--color-primary, #007aff)',
	}

	static uiShowInheritance = {
		help: 'Visually distinguish inherited values and paths',
		type: 'boolean',
		default: true,
	}

	static uiTreeNavigatorDepth = {
		help: 'Default expansion depth for the tree navigator',
		type: 'number',
		default: 2,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} */ this.bundled
		/** @type {boolean} */ this.publicWrite
		/** @type {'incremental'|'partial'|'full'} */ this.defaultExport
		/** @type {boolean} */ this.diffPreview
		/** @type {boolean} */ this.importEnabled
		/** @type {boolean} */ this.uiShowStagedMarkers
		/** @type {string} */ this.uiStagedMarkerColor
		/** @type {boolean} */ this.uiShowInheritance
		/** @type {number} */ this.uiTreeNavigatorDepth
	}

	/**
	 * Determines effective write access mode.
	 * @param {{ hasAuth: boolean }} context
	 * @returns {'host'|'sandbox'|'wiki'|'authenticated'}
	 */
	resolveAccessMode(context = {}) {
		if (!this.bundled) return 'host'
		if (context.hasAuth) return 'authenticated'
		if (this.publicWrite) return 'wiki'
		return 'sandbox'
	}

	/**
	 * Resolve permissions based on auth session.
	 * @param {object} [session] — session object from auth.app
	 * @returns {EditorPermissions}
	 */
	resolvePermissions(session) {
		// Host mode (bundled=false) always grants full access
		if (!this.bundled) {
			return new EditorPermissions({
				isAuthenticated: true,
				canEdit: true,
				canDelete: true,
				canManageUsers: true,
			})
		}

		if (!session || !session.isAuthenticated) {
			return new EditorPermissions({
				isAuthenticated: false,
				canEdit: this.publicWrite,
				canDelete: false,
				canManageUsers: false,
			})
		}

		const roles = session.roles || []
		const isAdmin = roles.includes('admin')
		const isEditor = roles.includes('editor') || roles.includes('moderator')

		return new EditorPermissions({
			isAuthenticated: true,
			canEdit: isAdmin || isEditor,
			canDelete: isAdmin,
			canManageUsers: isAdmin,
		})
	}

	/**
	 * @param {object} input
	 * @returns {EditorConfig}
	 */
	static from(input) {
		if (input instanceof EditorConfig) return input
		if (typeof input !== 'object' || input === null) return new EditorConfig()
		return new EditorConfig(input)
	}
}

