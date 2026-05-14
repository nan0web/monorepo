import React, { useState, useEffect, useMemo } from 'react'
import { Renderer } from '../../../renderItem.jsx'

/**
 * ComponentSandbox — ізольоване середовище для попереднього перегляду компонентів.
 *
 * Дозволяє:
 * - Рендерити $content у пісочниці з вибором джерела даних (document)
 * - Автоматично знаходити документи, що містять потрібні компоненти (auto-discovery)
 * - Перемикати джерело даних через select
 *
 * @param {Object} props
 * @param {Object} props.doc - Поточний документ (fallback)
 * @param {Object} props.node - Конфігурація Sandbox з YAML ($content, label, docs, selectDocs, style)
 * @param {Object} props.db - Інстанс BrowserDB для завантаження документів
 * @param {string} props.locale - Поточна локаль
 * @param {Function} props.t - Функція перекладу
 * @param {Function} [props.onNavigate] - Обробник навігації
 * @param {Object} [props.globals] - Глобальний контекст
 */
export default function Sandbox({ doc, node, db, locale, t, onNavigate, globals }) {
	const sandboxConfig = node || {}
	const sandboxContent = node.$content || node.content || []

	// Determine search keys (e.g. "Promo", "Blog") from the inner content
	const searchKeys = useMemo(() => {
		const keys = new Set()
		sandboxContent.forEach((item) => {
			const k = Object.keys(item)[0]
			if (k) keys.add(k.split(':')[0])
		})
		return Array.from(keys)
	}, [sandboxContent])

	// Auto-discovery of documents containing these components
	const discoveredDocs = useMemo(() => {
		if (sandboxConfig.selectDocs !== 'auto' || !db || searchKeys.length === 0) return []
		const docs = []

		const containsComponent = (val) => {
			if (!val || typeof val !== 'object') return false
			if (Array.isArray(val)) return val.some(containsComponent)

			const keys = Object.keys(val)
			for (const k of keys) {
				const baseKey = k.split(':')[0]
				if (searchKeys.includes(baseKey)) return true
				if (containsComponent(val[k])) return true
			}
			return false
		}

		for (const [path, data] of db.data.entries()) {
			if (path.startsWith('play/') || path.startsWith('_/') || path.endsWith('.d.json')) continue

			if (containsComponent(data)) {
				docs.push({ value: path, label: data.title || data.page?.title || path })
			}
		}
		return docs
	}, [db, sandboxConfig.selectDocs, searchKeys])

	const allDocs = sandboxConfig.docs || discoveredDocs || []
	const defaultDocSelection = allDocs[0]
		? typeof allDocs[0] === 'string'
			? allDocs[0]
			: allDocs[0].value
		: ''

	const [activeSource, setActiveSource] = useState(sandboxConfig.targetDoc || '')
	const [fetchedDoc, setFetchedDoc] = useState(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (activeSource && db) {
			db.fetch(activeSource)
				.then((data) => {
					setFetchedDoc(data)
					setError(null)
				})
				.catch((e) => {
					console.error('Sandbox fetch error', e)
					setError(t ? t('Failed to load') + ` ${activeSource}` : `Failed to load ${activeSource}`)
					setFetchedDoc(null)
				})
		} else {
			setFetchedDoc(null)
		}
	}, [activeSource, db])

	const currentDoc = activeSource ? fetchedDoc : doc
	const sourceLabel = t ? t('Source') : 'Source'
	const defaultLabel = t ? t('Default') : 'Default'

	return (
		<div className="sandbox border rounded-4 shadow-sm bg-body mb-5 p-4">
			<div className="bg-body-tertiary px-4 py-2 small fw-bold text-uppercase text-muted border-bottom mx-n4 mt-n4 mb-4 d-flex justify-content-between align-items-center">
				<span>{sandboxConfig.label || sandboxConfig.title || 'Sandbox Preview'}</span>

				{(sandboxConfig.selectDocs || allDocs.length > 0) && (
					<div className="d-flex align-items-center gap-2">
						<span className="fw-normal text-none" style={{ textTransform: 'none' }}>
							{sourceLabel}:
						</span>
						<select
							className="form-select form-select-sm w-auto"
							value={activeSource}
							onChange={(e) => setActiveSource(e.target.value)}
						>
							<option value="">({defaultLabel})</option>
							{allDocs.map((d, i) => {
								const val = typeof d === 'string' ? d : d.value
								const lbl = typeof d === 'string' ? d : d.label || d.value
								return (
									<option key={i} value={val}>
										{lbl}
									</option>
								)
							})}
						</select>
					</div>
				)}
			</div>

			{error && <div className="alert alert-danger mb-3">{error}</div>}

			<div className="sandbox-preview" style={sandboxConfig.style || { minHeight: '15rem' }}>
				{currentDoc ? (
					<Renderer
						doc={currentDoc}
						node={{ content: sandboxContent }}
						db={db}
						locale={locale}
						t={t}
						onNavigate={onNavigate}
						globals={globals}
					/>
				) : (
					<div className="text-center py-4">
						<div className="spinner-border text-primary" />
					</div>
				)}
			</div>
		</div>
	)
}
