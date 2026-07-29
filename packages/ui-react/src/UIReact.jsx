/**
 * UIReact – top‑level component that loads a document, resolves translations,
 * builds the UI context and renders the document content using the nan0 element system.
 */

import React, { useEffect, useState, StrictMode } from 'react'
import DB from '@nan0web/db-browser'
import { UIContext } from './context/UIContext.jsx'
import UIContextValue from './context/UIContextValue.jsx'
import components from './components/index.jsx'
import renderers from './renderers/index.jsx'
import Document from './models/Document.js'
import Element from './Element.jsx'
import { LogConsole } from '@nan0web/log'
import { I18nDb } from '@nan0web/i18n'
import { normalizeDocumentUrl } from '@nan0web/ui-web'

/**
 * @param {Object} props
 * @param {DB} props.db                             database instance
 * @param {string} [props.uri='']                   document URI (e.g. “uk/index”)
 * @param {Partial<UIContextValue>} [props.context] extra context (apps, actions,…)
 * @param {Console|LogConsole} [props.console]      logger (default: window.console)
 */
export default function UIReact({
	db,
	uri = '',
	context = {},
	console = typeof window !== 'undefined' ? window.console : new LogConsole(),
	...rest
}) {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(/** @type {Error|null} */(null))
	const [document, setDocument] = useState(new Document())
	const [t, setT] = useState(() => (k) => k)

	// Handle Redirects
	useEffect(() => {
		if (document.$redirect) {
			console.debug('UIReact: redirecting to', document.$redirect)
			if (typeof window !== 'undefined') {
				// Use navigate action if available, otherwise fallback to location.replace
				if (context.actions?.navigate) {
					context.actions.navigate(document.$redirect)
				} else {
					window.location.replace(document.$redirect)
				}
			}
		}
	}, [document, context.actions])

	// -------------------------------------------------------------------------
	// Load document + optional language map
	// -------------------------------------------------------------------------
	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				setError(null)
				console.log('UIReact: START LOADING DOCUMENT', uri)

				// Use shared web normalization logic
				const url = normalizeDocumentUrl(uri, db)

				console.debug('UIReact: normalized URL', url, 'for URI', uri)
				console.log('UIReact: START LOADING DOCUMENT FROM URL:', url)

				const data = await db.fetch(url)
				console.debug('UIReact: received data', JSON.stringify(data).substring(0, 200))

				const doc = Document.from(data)
				console.debug('UIReact: parsed document', {
					contentLen: doc.$content.length,
					title: doc.title,
					redirect: doc.$redirect
				})
				setDocument(doc)

				// Create translation helper using I18nDb
				let locale = doc.$lang || 'uk'
				const i18n = new I18nDb({
					// @ts-ignore
					db,
					locale,
				})
				const translationFn = await i18n.createT(locale, url)
				setT(() => translationFn)

				setError(null)
			} catch (/** @type {any} */ err) {
				console.error('UIReact: document load error', err)
				setError(err)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [uri, db, console])

	// -------------------------------------------------------------------------
	// Build merged UI context (components, renderers, apps, actions, …)
	// -------------------------------------------------------------------------
	const mergedContext = UIContextValue.from({
		components,
		renderers,
		console,
		document, // Add document to context
		apps: context.apps ?? new Map(),
		lang: document.$lang ?? 'en',
		db,
		uri,
		t,
		...rest,
		...context,
	})

	// -------------------------------------------------------------------------
	// Render states
	// -------------------------------------------------------------------------
	if (error) {
		return (
			<div className="ui-error" role="alert">
				{t('Failed to load document')}: {error.message || String(error)}
			</div>
		)
	}

	if (loading) {
		return <div className="ui-loading">Loading…</div>
	}

	return (
		<StrictMode>
			<UIContext.Provider value={mergedContext}>
				<div className="ui-react-root" role="main">
					{document.title && !document.$hideTitle && (
						<h1 className="ui-document-title">{document.title}</h1>
					)}
					{document.$content.map((block, i) => Element.render(block, i, mergedContext))}
				</div>
			</UIContext.Provider>
		</StrictMode>
	)
}
