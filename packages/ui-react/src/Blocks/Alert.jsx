import React from 'react'

import {
	FaInfoCircle,
	FaExclamationTriangle,
	FaExclamationCircle,
	FaCheckCircle,
	FaLightbulb,
} from 'react-icons/fa'

const VARIANT_MAP = {
	warning: { variant: 'warning', Icon: FaExclamationTriangle },
	danger: { variant: 'danger', Icon: FaExclamationCircle },
	error: { variant: 'danger', Icon: FaExclamationCircle },
	success: { variant: 'success', Icon: FaCheckCircle },
	tip: { variant: 'success', Icon: FaLightbulb },
	info: { variant: 'info', Icon: FaInfoCircle },
}

export const Alert = ({ type, title, content, children, className = '' }) => {
	// Resolve variant: explicit type prop wins, otherwise scan className for known variants
	let resolvedType = type
	let extraClasses = className

	if (!resolvedType && className) {
		const classes = className.split(/\s+/)
		for (const cls of classes) {
			if (VARIANT_MAP[cls]) {
				resolvedType = cls
				// Remove variant class from the extra classes list
				extraClasses = classes.filter((c) => c !== cls).join(' ')
				break
			}
		}
	}

	const { variant, Icon } = VARIANT_MAP[resolvedType] || VARIANT_MAP.info

	return (
		<div className={`alert alert-${variant} d-flex align-items-start ${extraClasses}`} role="alert">
			<Icon className="me-3 mt-1 flex-shrink-0" size="1.2em" />
			<div>
				{title && <h6 className="alert-heading mb-1">{title}</h6>}
				<div className="mb-0">{content || children}</div>
			</div>
		</div>
	)
}

Alert.inlineRenderer = true
Alert.displayName = 'Alert'
