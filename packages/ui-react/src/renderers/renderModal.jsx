import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../components/organisms/Modal.jsx'
import Button from '../components/atoms/Button.jsx'
import ReactElement from '../Element.jsx'

/**
 * Renderer for Modal component.
 * Manages isOpen state and renders a trigger button + the Modal component.
 *
 * @param {object} [props]
 * @param {object} [props.element] - Raw element input
 * @param {object} [props.context] - UI Context
 * @param {any} [props.data] - Data prop for the modal
 * @param {boolean} [props.isOpen] - Initial open state
 * @param {Function} [props.onClose] - Callback for closing the modal
 * @param {string} [props.triggerText] - Text for the trigger button
 * @param {React.ReactNode} [props.children] - Children to render inside the modal
 * @param {React.ReactNode} [props.content] - Content to render inside the modal
 * @param {React.ReactNode} [props.$content] - Content to render inside the modal (alternative)
 * @returns {React.ReactNode} Rendered modal with trigger
 */
export default function renderModal(props) {
	const p = /** @type {any} */ (props)
	const { element, context, data, isOpen: initialOpen = false, onClose } = p
	const [isOpen, setIsOpen] = React.useState(initialOpen)

	const handleClose = () => {
		if (context?.onAction) {
			context.onAction('Modal Close', { trigger: 'close_button' })
		}
		setIsOpen(false)
		if (onClose) onClose()
	}

	const handleOpen = () => {
		if (context?.onAction) {
			context.onAction('Modal Open', { triggerText })
		}
		setIsOpen(true)
	}

	// Extract content from props (Element extracts $content -> props.content)
	// Support multiple sources:
	// 1. Direct props (p.children, p.content, p.$content)
	// 2. Element structure (element.Modal.$content or element.$content)
	// 3. Value from element (if element is the Modal object itself)
	let rawContent = p.children || p.content || p.$content

	if (!rawContent && element) {
		// Try to extract from element structure
		if (typeof element === 'object') {
			// element might be {Modal: {$triggerText, $content}}
			const modalData = element.Modal || element.modal || element
			rawContent = modalData.$content || modalData.content || modalData.children
		}
	}

	// Map content using the Element renderer to support data-driven children
	// Pass handleClose to context actions so children can use 'action:closeModal'
	const childContext = {
		...context,
		actions: {
			...context?.actions,
			closeModal: handleClose,
		},
	}

	const content = Array.isArray(rawContent)
		? rawContent.map((c, i) => ReactElement.render(c, i, childContext))
		: (typeof rawContent === 'object' && rawContent !== null ? ReactElement.render(rawContent, 0, childContext) : rawContent)

	// Extract triggerText from multiple sources:
	// 1. Direct prop (p.triggerText)
	// 2. Element prop from YAML (element.$triggerText or element.triggerText)
	// 3. Default text
	let triggerText = p.triggerText

	if (!triggerText && element) {
		if (typeof element === 'object') {
			const modalData = element.Modal || element.modal || element
			triggerText = modalData.$triggerText || modalData.triggerText
		}
	}

	triggerText = triggerText || 'Open Modal Window'

	return (
		<>
			<Button onClick={handleOpen} style={{ marginBottom: '1rem' }} variant="primary" outline>
				{triggerText}
			</Button>
			<Modal {...p} isOpen={isOpen} onClose={handleClose}>
				{content}
			</Modal>
		</>
	)
}

renderModal.propTypes = {
	element: PropTypes.any,
	context: PropTypes.object,
	data: PropTypes.any,
	isOpen: PropTypes.bool,
	onClose: PropTypes.func,
	triggerText: PropTypes.string,
	children: PropTypes.node,
	content: PropTypes.node,
	$content: PropTypes.node,
}
