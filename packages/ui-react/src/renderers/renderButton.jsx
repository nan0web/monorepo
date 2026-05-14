import React from 'react'
import PropTypes from 'prop-types'
import Button from '../components/atoms/Button.jsx'
import ReactElement from '../Element.jsx'

/**
 * Renderer for Button component.
 * Maps 'button' type from data to Button atom.
 * Handles content extraction from element value or props.
 *
 * @param {object} props
 * @param {object} props.element - Raw element definition (e.g. { button: "Click me" })
 * @param {object} props.context - UI Context
 * @returns {React.ReactNode} Rendered button
 */
export default function renderButton(props) {
	const p = /** @type {any} */ (props)
	const { element, context } = p
	// Extract content:
	// 1. props.children (if used as Component)
	// 2. props.content (explicit content prop)
	// 3. element value (if used as Renderer e.g. { button: "Text" })
	const rawContent = p.children || p.content || (element && typeof element === 'object' ? Object.values(element)[0] : element)

	// Map complex content if array
	const content = Array.isArray(rawContent)
		? rawContent.map((c, i) => ReactElement.render(c, i, context))
		: rawContent

	const handleClick = (e) => {
		if (context?.onAction) {
			context.onAction('Button Click', {
				label: typeof content === 'string' ? content : 'Button',
				variant: p.$variant || 'primary'
			})
		}
		if (p.onClick) p.onClick(e)
	}

	return <Button {...p} onClick={handleClick}>{content || 'Button'}</Button>
}

renderButton.propTypes = {
	element: PropTypes.any,
	context: PropTypes.object,
	children: PropTypes.node,
	content: PropTypes.node,
}
