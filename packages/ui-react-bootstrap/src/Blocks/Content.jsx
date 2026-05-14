import React from 'react'
import { renderItem } from '../renderItem.jsx'

/**
 * Content — renders doc.doc.content via renderItem mapping.
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Content({ doc, ...sharedProps }) {
	const content = doc?.doc?.content || doc?.content
	if (!content || !Array.isArray(content)) return null
	return (
		<section className="container container-max py-5">
			{content.map((item, i) => renderItem(item, i, sharedProps))}
		</section>
	)
}
