import React from 'react'

/**
 * Files — renders doc.files as download links.
 * Equivalent to /_/content/files in product.ejs & standard.ejs.
 * @param {Object} props
 * @param {Object} props.doc
 * @param {string} [props.title] - Custom title for the files section
 * @param {string} [props.locale='uk']
 */
export function Files({ doc, title, locale = 'uk' }) {
	const files = doc?.files || doc?.doc?.files
	if (!files || !Array.isArray(files) || files.length === 0) return null
	const heading =
		title ||
		doc?.$files?.title ||
		doc?.doc?.$files?.title ||
		(locale === 'uk' ? 'Документи' : 'Documents')

	return (
		<section className="bg-info bg-gradient bg-opacity-10 py-4">
			<div className="container container-max">
				<h5 className="fw-bold mb-3">📎 {heading}</h5>
				<ul className="list-unstyled mb-0">
					{files.map((f, i) => {
						let href = '#'
						let name = href

						if (typeof f === 'string') {
							// Check if it matches markdown link [title](url)
							const match = f.match(/^\[(.*?)\]\((.*?)\)$/)
							if (match) {
								name = match[1]
								href = match[2]
							} else {
								href = f
								name = f.split('/').pop() || f
							}
						} else if (typeof f === 'object' && f !== null) {
							href = f.src || f.href || '#'
							name = f.name || f.title || href.split('/').pop() || href
						}

						const isExternal =
							href.startsWith('http') ||
							href.endsWith('.pdf') ||
							href.endsWith('.jpg') ||
							href.endsWith('.png')

						return (
							<li key={i} className="mb-2">
								<a
									href={href}
									className="text-decoration-none d-flex align-items-center gap-2"
									{...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
								>
									<span className="icon-file fs-5 text-primary" />
									<span>{name}</span>
								</a>
							</li>
						)
					})}
				</ul>
			</div>
		</section>
	)
}
