import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { UIContext } from '../../context/UIContext.jsx'

/**
 * Card – container with default theme-aware styling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside the card.
 * @param {Object} [props.style] - Additional inline styles.
 * @param {Object} [props.rest] - Other props passed to the div.
 * @returns {React.ReactNode} The card component.
 */
export default function Card({ children, style = {}, ...props }) {
	const context = useContext(UIContext)
	const theme = context?.theme

	const config = {
		borderRadius: '8px',
		boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
		padding: '1rem',
		backgroundColor: 'var(--color-background)',
		color: 'var(--color-text)',
		border: `1px solid var(--color-border)`,
		...style,
	}

	return (
		<div style={config} {...props}>
			{children}
		</div>
	)
}

Card.propTypes = {
	children: PropTypes.node.isRequired,
	style: PropTypes.object,
}
