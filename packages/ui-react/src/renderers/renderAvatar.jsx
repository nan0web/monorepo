import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '../components/atoms/Avatar.jsx'

/**
 * Renderer for Avatar component
 *
 * @param {object} block - Component block definition
 * @returns {React.ReactNode} Rendered avatar
 */
export default function renderAvatar({ element, ...props }) {
	return <Avatar {...props} />
}

renderAvatar.propTypes = {
	element: PropTypes.object.isRequired,
}
