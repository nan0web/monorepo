import React, { useState, useEffect, useMemo } from 'react'
import { Modal, Form, Button, Badge, Card } from 'react-bootstrap'
import { reactIcon } from '@nan0web/icons/adapters/react'
import { FaSearch as _FaSearch } from '@nan0web/icons/fa'
const FaSearch = reactIcon(_FaSearch)

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

	const inputRef = React.useRef(null)
	const resultsRefs = React.useRef([])

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
					if (index.endsWith('.jsonl')) {
						const text = await res.text()
						const data = text.split('\n').filter(Boolean).map(JSON.parse)
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
		return localIndex.filter((item) => {
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
			<Form className="input-group mb-4" onSubmit={handleSubmit}>
				<Form.Control
					type="search"
					name="q"
					placeholder={t('searchPlaceholder') || 'Search...'}
					aria-label={t('search') || 'Search'}
					value={query}
					onChange={handleSearchChange}
					onFocus={handleFocus}
					onKeyDown={(e) => handleKeyDown(e, -1)}
					ref={inputRef}
					className="form-control-lg border-primary shadow-none"
				/>
				<Button
					type="button"
					variant="primary"
					className="btn-lg d-flex align-items-center gap-2"
					style={{ pointerEvents: 'none' }}
				>
					<FaSearch />
					<span className="d-none d-sm-inline">{t('searchBtn') || 'Search'}</span>
				</Button>
			</Form>

			<div className="search-results">
				<header className={`summary mb-3 ${resultCount > 0 ? 'found' : 'not-found'}`}>
					{resultCount > 0 ? (
						<div className="on-found fw-bold">
							<Badge bg="success" className="me-2">
								{resultCount}
							</Badge>
							{t('resultsFound') || 'results found'}
						</div>
					) : isSearching ? (
						<div className="off-found text-muted">{t('noResults') || 'No results found'}</div>
					) : null}
				</header>

				{displayedResults.map((result, index) => (
					<Card
						key={index}
						className="mb-3 border-0 shadow-sm hover-shadow transition"
						as="article"
						tabIndex={0}
						role="button"
						ref={(el) => (resultsRefs.current[index] = el)}
						onKeyDown={(e) => handleKeyDown(e, index)}
						onClick={() => flashCard(resultsRefs.current[index])}
						style={{
							outlineColor: 'var(--bs-primary)',
							cursor: 'pointer',
							transition: 'box-shadow 0.15s ease, transform 0.15s ease',
						}}
					>
						{result.img && (
							<Card.Img
								variant="top"
								src={result.img}
								alt={result.title}
								style={{ height: '200px', objectFit: 'cover' }}
							/>
						)}
						<Card.Body>
							{result.path && result.path.length > 0 && (
								<nav aria-label="breadcrumb">
									<ol className="breadcrumb mb-2 small text-muted">
										{result.path.map((crumb, idx) => {
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
							<Card.Title>
								<a href={result.url || '#'} className="text-decoration-none text-primary">
									<HighlightText text={result.title} query={query} />
								</a>
							</Card.Title>
							{result.desc && (
								<Card.Text className="text-muted small mb-2">
									<HighlightText text={result.desc} query={query} />
								</Card.Text>
							)}
							{result.url && !result.buttonHidden && (
								<Button href={result.url} variant="outline-primary" size="sm" className="mt-2">
									{t('searchReadMore') || 'Read more'}
								</Button>
							)}
						</Card.Body>
					</Card>
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

	return (
		<Modal show={show} onHide={onClose} fullscreen className="search-modal" {...props}>
			<Modal.Header closeButton className="border-0 pb-0">
				<Modal.Title className="text-muted small text-uppercase fw-bold">
					{t('searchTitle') || 'Site Search'}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-4 p-md-5 d-flex justify-content-center pt-0">
				<div className="container" style={{ maxWidth: '800px' }}>
					{searchContent}
				</div>
			</Modal.Body>
		</Modal>
	)
}

Search.inlineRenderer = true
Search.displayName = 'Search'
