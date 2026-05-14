import React from 'react'
import PropTypes from 'prop-types'
import Card from '../components/molecules/Card.jsx'

import ReactElement from '../Element.jsx'

/**
 * Renderer for Card component
 *
 * @param {object} input
 * @param {object} input.element - Component block definition
 * @param {any} input.context - UI Context
 * @param {any} [input.children] - React children
 * @returns {React.ReactNode} Rendered card
 */
export default function renderCard({ element, context, ...props }) {
	let rawContent = element.Card || element.content || props.children || []
	const style = element.$style || {}

	// Ensure rawContent is array
	if (!Array.isArray(rawContent)) rawContent = [rawContent]

	const content = rawContent.map((c, i) => {
		// If it's an image definition, we might want to ensure it has sane defaults
		if (typeof c === 'object' && c !== null) {
			const tag = Object.keys(c).find(k => k === 'img')
			if (tag) {
				// Inject default styles for images in cards if not provided
				c.$style = {
					width: '100%',
					maxHeight: '300px',
					height: 'auto',
					objectFit: 'contain',
					borderRadius: '8px 8px 0 0',
					...c.$style
				}
			}
			return ReactElement.render(c, i, context)
		}
		return c
	})

	return <Card style={style} {...props}>{content}</Card>
}

renderCard.propTypes = {
	element: PropTypes.object.isRequired,
}
