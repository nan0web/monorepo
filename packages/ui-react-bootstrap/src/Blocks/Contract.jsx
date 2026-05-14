import React, { useState } from 'react'
import { renderItem } from '../renderItem.jsx'

/**
 * Contract — renders doc.doc.contract (array of sections with title, id, content).
 * Equivalent to contract.ejs layout.
 * Includes a sticky dropdown navigator and full document sections.
 * @param {Object} props
 * @param {Object} props.doc
 * @param {Function} [props.onNavigate]
 * @param {string} [props.locale]
 * @param {Object} [props.db]
 * @param {Object} [props.globals]
 * @param {Object} [props.duty]
 */
export function Contract({ doc, onNavigate, locale, db, globals, duty }) {
	const contract = doc?.doc?.contract || doc?.contract
	const nav = doc?.$docNavigator || doc?.doc?.$docNavigator
	if (!contract || !Array.isArray(contract)) return null
	const sharedProps = { locale, doc, globals, db, onNavigate, duty }
	const [navOpen, setNavOpen] = useState(false)

	return (
		<section className="section contract py-5">
			{/* Section navigator */}
			{nav && (
				<nav className="sticky-top container container-max d-flex gap-3 justify-content-center flex-column justify-content-md-between flex-md-row bg-body p-3 mb-4 rounded shadow-sm d-print-none">
					<div className="dropdown">
						<button
							className="btn btn-outline-primary dropdown-toggle"
							type="button"
							data-bs-toggle="dropdown"
							aria-expanded={navOpen ? 'true' : 'false'}
							onClick={() => setNavOpen((v) => !v)}
						>
							{nav.text || 'Розділ'}
						</button>
						<ul className={`dropdown-menu ${navOpen ? 'show' : ''}`}>
							{contract.map((p, i) => (
								<li key={i}>
									<a
										className="dropdown-item"
										href={`#${p.id}`}
										onClick={(e) => {
											e.preventDefault()
											setNavOpen(false)
											document.getElementById(p.id)?.scrollIntoView({ behavior: 'smooth' })
										}}
									>
										{p.title}
									</a>
								</li>
							))}
						</ul>
					</div>
					<button className="btn btn-outline-success" type="button" onClick={() => window.print()}>
						<span className="icon-printer" />
						<span className="ms-2">
							{locale === 'uk' ? 'Друкувати документ' : 'Print document'}
						</span>
					</button>
				</nav>
			)}

			{/* Contract sections */}
			<article className="contract container container-max" style={{ textAlign: 'justify' }}>
				{contract.map((p, i) => (
					<div key={i}>
						<h3 className="mt-4" id={p.id} style={{ scrollMarginTop: '100px' }}>
							{p.title}
						</h3>
						{p.content && Array.isArray(p.content)
							? p.content.map((item, j) => renderItem(item, `contract-${i}-${j}`, sharedProps))
							: null}
					</div>
				))}
			</article>
		</section>
	)
}
