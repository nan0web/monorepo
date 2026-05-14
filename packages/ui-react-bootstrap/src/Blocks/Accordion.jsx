import React from 'react'

/**
 * Accordion — renders doc.doc.accordion (array of `{q, a}` or `{title, content}`)
 * as a fully interactive Bootstrap accordion with standard unique ID generation.
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Accordion({ doc }) {
	const accordion = doc?.doc?.accordion || doc?.accordion
	if (!accordion || !Array.isArray(accordion)) return null

	// Generate a unique ID for this instance in case of multiple accordions
	const uid = React.useId().replace(/:/g, '')
	const accId = `accordion-${uid}`

	return (
		<section className="bg-body-secondary py-5">
			<div className="container container-max">
				<div className="accordion accordion-flush" id={accId}>
					{accordion.map((item, i) => {
						const headingId = `heading-${uid}-${i}`
						const collapseId = `collapse-${uid}-${i}`
						return (
							<div className="accordion-item bg-transparent" key={i}>
								<h2 className="accordion-header" id={headingId}>
									<button
										className="accordion-button collapsed fw-bold bg-transparent"
										type="button"
										data-bs-toggle="collapse"
										data-bs-target={`#${collapseId}`}
										aria-expanded="false"
										aria-controls={collapseId}
									>
										{item.q || item.title}
									</button>
								</h2>
								<div
									id={collapseId}
									className="accordion-collapse collapse"
									aria-labelledby={headingId}
									data-bs-parent={`#${accId}`}
								>
									<div
										className="accordion-body text-body-secondary"
										dangerouslySetInnerHTML={{ __html: item.a || item.content }}
									/>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
