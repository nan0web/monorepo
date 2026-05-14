import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

/**
 * Modal – overlay dialog with sensible defaults.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 * @param {Object} [props.style] - additional inline styles for the modal window
 */
export default function Modal({ isOpen, onClose, children, style = {}, ...props }) {
	if (!isOpen) return null

	const { theme } = useUI()
	const config = theme?.organisms?.Modal ?? {
		overlayBackground: 'rgba(0, 0, 0, 0.5)',
		borderRadius: '0.5rem',
		boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		padding: '1.5rem',
		backgroundColor: '#ffffff',
	}

	const overlayStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: config.overlayBackground,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1050,
	}

	const modalStyle = {
		borderRadius: config.borderRadius,
		boxShadow: config.boxShadow,
		padding: config.padding,
		backgroundColor: config.backgroundColor,
		width: '90vw',
		maxWidth: '500px',
		maxHeight: '90vh',
		overflow: 'auto',
		...style,
	}

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) onClose(e)
	}

	return (
		<div>
			{/* @ts-ignore */}
			<div data-testid="modal-overlay" style={overlayStyle} onClick={handleOverlayClick}>
				<div
					data-testid="modal-content"
					style={modalStyle}
					onClick={(e) => e.stopPropagation()}
					{...props}
				>
					{children}
				</div>
			</div>
		</div>
	)
}

Modal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	style: PropTypes.object,
}
