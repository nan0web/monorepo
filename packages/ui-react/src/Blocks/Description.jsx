import React from 'react'

/**
 * Description — renders doc.doc.description or doc.description
 * Equivalent to /_/content/description in standard.ejs
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Description({ doc }) {
	const desc = doc?.doc?.description || doc?.description
	if (!desc) return null

	return (
		<section className="bg-body-secondary py-5 text-center text-md-start">
			<div className="container container-max">
				<h2
					className="lead fs-3 m-0 text-body-secondary"
					dangerouslySetInnerHTML={{ __html: desc }}
				/>
			</div>
		</section>
	)
}
