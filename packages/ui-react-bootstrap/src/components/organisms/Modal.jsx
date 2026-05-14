import React from 'react'
import PropTypes from 'prop-types'
import { Modal as BootstrapModal } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'

export default function Modal({ isOpen, onClose, children, ...props }) {
	const { theme } = useUI()
	if (theme.name === 'bootstrap') {
		// Disable ui-core theme for Bootstrap, rely on default styles
		return (
			<BootstrapModal show={isOpen} onHide={onClose} {...props}>
				<BootstrapModal.Body>{children}</BootstrapModal.Body>
			</BootstrapModal>
		)
	}
	// Fallback
	const config = theme.organisms?.Modal || {}
	return (
		<BootstrapModal show={isOpen} onHide={onClose} {...props}>
			<BootstrapModal.Body style={config}>{children}</BootstrapModal.Body>
		</BootstrapModal>
	)
}

Modal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
}
