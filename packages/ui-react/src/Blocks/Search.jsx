import React, { useState, useEffect, useMemo } from 'react'
import { FaSearch } from 'react-icons/fa'

export const Search = ({
	show = false,
	inline = false,
	onClose,
	results = [], // Explicit results (overrides local search)
	index = null, // Can be array of objects or URL (string)
	query: initialQuery = '',
	onSearch,
	t = (k) => k,
	...props
}) => {
	const [query, setQuery] = useState(initialQuery)
	const initialLocalIndex = Array.isArray(index) ? index : []
	const [localIndex, setLocalIndex] = useState(initialLocalIndex)
	const [indexLoaded, setIndexLoaded] = useState(initialLocalIndex.length > 0)
	const [loading, setLoading] = useState(false)

	const inputRef = React.useRef(/** @type {HTMLInputElement|null} */ (null))
	const resultsRefs = React.useRef(/** @type {any[]} */ ([]))

	const flashCard = (el) => {
		if (!el) return
		el.style.transition = 'box-shadow 0.15s ease, transform 0.15s ease'
		el.style.boxShadow = '0 0 0 3px var(--bs-primary)'
		el.style.transform = 'scale(0.98)'
		setTimeout(() => {
			el.style.boxShadow = ''
			el.style.transform = ''
		}, 200)
	}

	const handleKeyDown = (e, index) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (index === -1) {
				resultsRefs.current[0]?.focus()
			} else if (index < displayedResults.length - 1) {
				resultsRefs.current[index + 1]?.focus()
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (index === 0) {
				inputRef.current?.focus()
			} else if (index > 0) {
				resultsRefs.current[index - 1]?.focus()
			}
		} else if (e.key === 'Enter' && index >= 0) {
			e.preventDefault()
			const el = resultsRefs.current[index]
			if (el) {
				flashCard(el)
				const target =
					el.querySelector('[data-action]') ||
					el.querySelector('a[href]') ||
					el.querySelector('button')
				if (target) target.click()
			}
		}
	}

	// Fetch index on focus if index is a URL
	const handleFocus = async () => {
		if (typeof index === 'string' && !indexLoaded && !loading) {
			setLoading(true)
			try {
				const res = await fetch(index)
				if (res.ok) {
					if ( /** @type {any} */ (index).endsWith('.jsonl')) {
						const text = await res.text()
						const data = text.split('\n').filter(Boolean).map( (s) => JSON.parse(s) )
						setLocalIndex(data)
					} else {
						const data = await res.json()
						setLocalIndex(data)
					}
				}
			} catch (e) {
				console.error('Failed to load search index', e)
			} finally {
				setIndexLoaded(true)
				setLoading(false)
			}
		}
	}

	const handleSearchChange = (e) => {
		const val = e.target.value
		setQuery(val)
		if (onSearch) onSearch(val)
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (onSearch) onSearch(query)
	}

	// Local filtering if we have a localIndex
	const displayedResults = useMemo(() => {
		// If explicit results are passed and it's greater than 0, use them.
		// Unless the parent is managing state, in which case it controls `results`.
		// But in our fast local search, we want `localIndex` to take precedence if parent isn't filtering.
		if (results.length > 0 && localIndex.length === 0) return results

		if (!query.trim()) return []

		const lowerQ = query.toLowerCase()
		return localIndex.filter(( /** @type {any} */ item ) => {
			const textValue = `${item.title || ''} ${item.desc || ''} ${item.content || ''}`.toLowerCase()
			return textValue.includes(lowerQ)
		})
	}, [query, localIndex, results])

	const isSearching = !!query.trim()
	const resultCount = displayedResults.length

	const HighlightText = ({ text, query }) => {
		if (!query || !text) return text
		const parts = text.split(new RegExp(`(${query})`, 'gi'))
		return (
			<>
				{parts.map((part, i) =>
					part.toLowerCase() === query.toLowerCase() ? (
						<mark key={i} className="bg-warning text-dark p-0">
							{part}
						</mark>
					) : (
						<span key={i}>{part}</span>
					),
				)}
			</>
		)
	}

	const searchContent = (
		<div className="search-body w-100">
			<form className="input-group mb-4" onSubmit={handleSubmit}>
				<input
					type="search"
					name="q"
					placeholder={t('searchPlaceholder') || 'Search...'}
					aria-label={t('search') || 'Search'}
					value={query}
					onChange={handleSearchChange}
					onFocus={handleFocus}
					onKeyDown={(e) => handleKeyDown(e, -1)}
					ref={inputRef}
					className="form-control form-control-lg border-primary shadow-none"
				/>
				<button
					type="button"
					className="btn btn-primary btn-lg d-flex align-items-center gap-2"
					style={{ pointerEvents: 'none' }}
				>
					{React.createElement(/** @type {any} */ (FaSearch))}
					<span className="d-none d-sm-inline">{t('searchBtn') || 'Search'}</span>
				</button>
			</form>

			<div className="search-results">
				<header className={`summary mb-3 ${resultCount > 0 ? 'found' : 'not-found'}`}>
					{resultCount > 0 ? (
						<div className="on-found fw-bold">
							<span className="badge bg-success me-2">{resultCount}</span>
							{t('resultsFound') || 'results found'}
						</div>
					) : isSearching ? (
						<div className="off-found text-muted">{t('noResults') || 'No results found'}</div>
					) : null}
				</header>

				{displayedResults.map(( /** @type {any} */ result, index ) => (
					<article
						key={index}
						className="card mb-3 border-0 shadow-sm transition"
						tabIndex={0}
						role="button"
						ref={(el) => { resultsRefs.current[index] = el; }}
						onKeyDown={(e) => handleKeyDown(e, index)}
						onClick={() => flashCard(resultsRefs.current[index])}
						style={{
							outlineColor: 'var(--bs-primary)',
							cursor: 'pointer',
							transition: 'box-shadow 0.15s ease, transform 0.15s ease',
						}}
					>
						{result.img && (
							<img
								className="card-img-top"
								src={result.img}
								alt={result.title}
								style={{ height: '200px', objectFit: 'cover' }}
							/>
						)}
						<div className="card-body">
							{result.path && result.path.length > 0 && (
								<nav aria-label="breadcrumb">
									<ol className="breadcrumb mb-2 small text-muted">
										{result.path.map(( /** @type {any} */ crumb, idx ) => {
											const isLast = idx === result.path.length - 1
											return (
												<li
													className={`breadcrumb-item ${isLast ? 'active fw-medium text-body' : ''}`}
													key={idx}
												>
													{crumb.url ? (
														<a href={crumb.url} className="text-decoration-none">
															{crumb.label}
														</a>
													) : (
														<span>{crumb.label}</span>
													)}
												</li>
											)
										})}
									</ol>
								</nav>
							)}
							<h5 className="card-title">
								<a href={result.url || '#'} className="text-decoration-none text-primary">
									<HighlightText text={result.title} query={query} />
								</a>
							</h5>
							{result.desc && (
								<p className="card-text text-muted small mb-2">
									<HighlightText text={result.desc} query={query} />
								</p>
							)}
							{result.url && !result.buttonHidden && (
								<a href={result.url} className="btn btn-outline-primary btn-sm mt-2">
									{t('searchReadMore') || 'Read more'}
								</a>
							)}
						</div>
					</article>
				))}
			</div>
		</div>
	)

	if (inline) {
		return (
			<div className="search-widget" {...props}>
				{searchContent}
			</div>
		)
	}

	if (!show) return null

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 bg-body"
			style={{ zIndex: 1050, overflowY: 'auto' }}
			{...props}
		>
			<div className="d-flex justify-content-between align-items-center p-3">
				<h5 className="text-muted small text-uppercase fw-bold m-0">
					{t('searchTitle') || 'Site Search'}
				</h5>
				<button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
			</div>
			<div className="p-4 p-md-5 d-flex justify-content-center pt-0">
				<div className="container" style={{ maxWidth: '800px' }}>
					{searchContent}
				</div>
			</div>
		</div>
	)
}

Search.inlineRenderer = true
Search.displayName = 'Search'
