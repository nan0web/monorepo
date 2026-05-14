import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'

import { useMask } from '@react-input/mask'

/**
 * Bootstrap Input wrapper with mask support.
 */
export default function Input({ type = 'text', mask, label, help, ...props }) {
	const { theme } = useUI()

	// Default replacement for '9' is digit, matching react-input-mask behavior roughly
	const maskRef = useMask({
		mask: mask || '',
		replacement: { '9': /\d/ },
		showMask: false // @react-input/mask doesn't support showMask prop same way, but keeping safe defaults
	});

	const control = mask ? (
		<Form.Control ref={maskRef} type={type} {...props} />
	) : (
		<Form.Control type={type} {...props} />
	)

	return (
		<Form.Group className="mb-3">
			{label && <Form.Label>{label}</Form.Label>}
			{control}
			{help && <Form.Text className="text-muted">{help}</Form.Text>}
		</Form.Group>
	)
}

Input.propTypes = {
	type: PropTypes.string,
	placeholder: PropTypes.string,
	as: PropTypes.string,
	style: PropTypes.object,
}
