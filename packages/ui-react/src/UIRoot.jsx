// @nan0web/ui-react/src/UIRoot.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import DB from '@nan0web/db-browser'
import { NightTheme, Theme } from '@nan0web/ui'
import UIReact from './UIReact.jsx'
import { UIProvider } from './context/UIContext.jsx'
import defaultComponents from './components/index.jsx'
import defaultRenderers from './renderers/index.jsx'
import AppCore from '@nan0web/core'
import ActionLogger from './components/organisms/ActionLogger.jsx'

/**
 * Default registries for components, renderers, and apps.
 * @type {Map<string, () => Promise<any>>}
 */
const defaultAppsRegistry = new Map()

/**
 * UIRoot — root container for the @nan0web/ui-react system.
 * Manages:
 * - URI sync from browser location
 * - Theme state (localStorage + prefers-color-scheme)
 * - SPA navigation via pushState
 *
 * Accepts custom components, renderers, apps, and actions to fully override default behavior.
 *
 * @param {Object} props
 * @param {DB} [props.db] - Optional DB instance
 * @param {Map<string, React.Component>} [props.components] - Custom or override components
 * @param {Map<string, Function>} [props.renderers] - Custom or override renderers
 * @param {Map<string, Function>} [props.apps] - Lazy-loaded app modules
 * @param {Record<string, Function>} [props.actions] - Global action handlers
 * @param {Console} [props.console] - Logger instance
 * @param {boolean} [props.devMode=true] - Enable debug logging
 */
export function UIRoot({
	db,
	components: overrideComponents = new Map(),
	renderers: overrideRenderers = new Map(),
	apps: overrideApps = new Map(),
	actions: overrideActions = {},
	console: externalConsole = console,
	devMode = true,
}) {
	// Initialize URI from current path
	const [uri, setUri] = useState(getPath())

	// Initialize theme: from localStorage → OS preference → default
	const [theme, setTheme] = useState(getInitialTheme())

	// Use external console or disable logs in production-like mode
	const finalConsole = useMemo(() => /** @type {any} */(devMode ? externalConsole : createNoOpConsole()), [devMode, externalConsole])

	// Action logging state for the playground
	const [actionsLog, setActionsLog] = useState(/** @type {any[]} */([]))

	const handleAction = useCallback((type, data) => {
		const newAction = {
			id: Date.now() + Math.random(),
			type,
			data,
			timestamp: Date.now()
		}
		setActionsLog((/** @type {any[]} */ prev) => [newAction, ...prev].slice(0, 50))
		finalConsole.debug(`[Action] ${type}`, data)
	}, [finalConsole])

	finalConsole.debug('UIRoot initialized', { uri, hasDb: !!db })

	// Initialize DB if not provided
	const finalDb = useMemo(() => {
		if (db) return db
		const opts = { host: window.location.origin, console: finalConsole }
		return new DB(opts)
	}, [db, finalConsole])

	// Subscribe to browser navigation (back/forward)
	useEffect(() => {
		const handler = () => {
			finalConsole.debug('Location change detected, updating URI')
			setUri(getPath())
		}
		window.addEventListener('popstate', handler)
		return () => window.removeEventListener('popstate', handler)
	}, [])

	// Persist theme changes to localStorage
	useEffect(() => {
		setThemeInStorage(theme)
	}, [theme])

	// Inject theme CSS variables
	useEffect(() => {
		const root = document.documentElement
		const isDark = theme === NightTheme
		const colors = isDark
			? {
				'--color-text': '#ffffff',
				'--color-background': '#1a1a1a',
				'--color-primary': '#0d6efd',
				'--color-secondary': '#6c757d',
				'--color-success': '#198754',
				'--color-warning': '#ffc107',
				'--color-error': '#dc3545',
				'--color-border': '#2d2d2d',
				'--color-border-muted': '#1f1f1f',
			}
			: {
				'--color-text': '#212529',
				'--color-background': '#ffffff',
				'--color-primary': '#0d6efd',
				'--color-secondary': '#6c757d',
				'--color-success': '#198754',
				'--color-warning': '#ffc107',
				'--color-error': '#dc3545',
				'--color-border': '#dee2e6',
				'--color-border-muted': '#ced4da',
			}

		for (const [key, value] of Object.entries(colors)) {
			root.style.setProperty(key, value)
		}

		// Apply global styles to body to ensure theme is visible
		document.body.style.backgroundColor = 'var(--color-background)'
		document.body.style.color = 'var(--color-text)'
		document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease'
	}, [theme])

	// Handle internal link clicks to enable SPA navigation
	useEffect(() => {
		/** @param {MouseEvent} e */
		const handleClick = (e) => {
			if (!(e.target instanceof Element)) return
			const link = e.target.closest('a[href]')
			if (!link) return
			const href = link.getAttribute('href')
			finalConsole.debug('Navigation link intercepted', href)

			// Skip special links
			if (
				!href ||
				href.startsWith('#') ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:') ||
				href.startsWith('https://') ||
				href.startsWith('http://')
			)
				return

			e.preventDefault()
			window.history.pushState({}, '', href)
			// Trigger UI update
			window.dispatchEvent(new PopStateEvent('popstate'))
		}

		document.addEventListener('click', handleClick)
		return () => document.removeEventListener('click', handleClick)
	}, [])

	// Merge default and custom context values
	// Pass theme/setTheme here to propagate UIRoot state to children via UIReact
	const mergedContext = useMemo(() => ({
		components: new Map([...defaultComponents, ...overrideComponents]),
		renderers: new Map([...defaultRenderers, ...overrideRenderers]),
		apps: new Map([...defaultAppsRegistry, ...overrideApps]),
		actions: overrideActions,
		console: finalConsole,
		theme,
		setTheme,
		onAction: handleAction,
	}), [overrideComponents, overrideRenderers, overrideApps, overrideActions, finalConsole, theme, setTheme, handleAction])

	finalConsole.debug('UIRoot: Merged context', {
		components: Array.from(mergedContext.components.keys()),
		renderers: Array.from(mergedContext.renderers.keys()),
		apps: Array.from(mergedContext.apps.keys()),
		actions: Object.keys(mergedContext.actions),
		theme: theme === NightTheme ? 'NightTheme' : 'Theme',
	})

	return (
		<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			{/* We don't need to pass theme/setTheme explicitly to value if they are in mergedContext */}
			<UIProvider value={{ db: finalDb, ...mergedContext }}>
				<UIReact db={finalDb} uri={uri} context={mergedContext} console={finalConsole} />
				<ActionLogger
					actions={actionsLog}
					onClear={() => setActionsLog([])}
				/>
			</UIProvider>
		</div>
	)
}

// --- Utilities ---

/**
 * Extract path and convert .html → .json for document fetching
 * @returns {string}
 */
function getPath() {
	const path = window.location.pathname
	return path.replace(/\.html$/, '.json')
}

/**
 * Get initial theme from localStorage or OS preference
 * @returns {object} Theme object
 */
function getInitialTheme() {
	const saved = localStorage.getItem('theme')
	if (saved === 'night') return NightTheme
	if (saved === 'light') return Theme

	const mql =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-color-scheme: dark)')
			: { matches: false }

	return mql.matches ? NightTheme : Theme
}

/**
 * Persist theme selection to localStorage
 * @param {object} theme
 */
function setThemeInStorage(theme) {
	localStorage.setItem('theme', theme === NightTheme ? 'night' : 'light')
}

/**
 * Create silent console when devMode is off
 */
function createNoOpConsole() {
	const noOp = () => { }

	return {
		debug: noOp,
		info: noOp,
		warn: noOp,
		error: noOp,
		assert: noOp,
		clear: noOp,
		count: noOp,
		countReset: noOp,
		dir: noOp,
		dirxml: noOp,
		group: noOp,
		groupCollapsed: noOp,
		groupEnd: noOp,
		log: noOp,
		table: noOp,
		time: noOp,
		timeEnd: noOp,
		timeLog: noOp,
		trace: noOp,
		timeStamp: noOp,
		profile: noOp,
		profileEnd: noOp,
		Console: undefined,
	}
}

// Export for reuse in custom setups
export {
	defaultComponents as components,
	defaultRenderers as renderers,
	defaultAppsRegistry as apps,
}
