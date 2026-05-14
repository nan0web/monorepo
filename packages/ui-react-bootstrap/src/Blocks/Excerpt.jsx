import React from 'react'
import { renderItem } from '../renderItem.jsx'

/**
 * Excerpt — renders doc.doc.excerpt (array of objects for nano2html)
 * Equivalent to /_/content/excerpt logic.
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Excerpt({ doc, ...sharedProps }) {
	const excerpt = doc?.doc?.excerpt || doc?.excerpt
	if (!excerpt || !Array.isArray(excerpt)) return null

	return (
		<section className="container container-max py-4 lead">
			{excerpt.map((item, i) => renderItem(item, i, sharedProps))}
		</section>
	)
}
