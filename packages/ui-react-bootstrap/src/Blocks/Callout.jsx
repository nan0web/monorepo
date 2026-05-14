import React from 'react'
import { Alert } from 'react-bootstrap'
import { reactIcon } from '@nan0web/icons/adapters/react'
import {
	FaInfoCircle as _FaInfoCircle,
	FaExclamationTriangle as _FaExclamationTriangle,
	FaExclamationCircle as _FaExclamationCircle,
	FaCheckCircle as _FaCheckCircle,
	FaLightbulb as _FaLightbulb,
} from '@nan0web/icons/fa'

const FaInfoCircle = reactIcon(_FaInfoCircle)
const FaExclamationTriangle = reactIcon(_FaExclamationTriangle)
const FaExclamationCircle = reactIcon(_FaExclamationCircle)
const FaCheckCircle = reactIcon(_FaCheckCircle)
const FaLightbulb = reactIcon(_FaLightbulb)

export const Callout = ({ type = 'info', title, content, children, className = '' }) => {
	let variant = 'info'
	let Icon = FaInfoCircle

	switch (type) {
		case 'warning':
			variant = 'warning'
			Icon = FaExclamationTriangle
			break
		case 'danger':
		case 'error':
			variant = 'danger'
			Icon = FaExclamationCircle
			break
		case 'success':
			variant = 'success'
			Icon = FaCheckCircle
			break
		case 'tip':
			variant = 'success'
			Icon = FaLightbulb
			break
		case 'info':
		default:
			variant = 'info'
			Icon = FaInfoCircle
			break
	}

	return (
		<Alert variant={variant} className={`d-flex align-items-start ${className}`}>
			<Icon className="me-3 mt-1 flex-shrink-0" size="1.2em" />
			<div>
				{title && <Alert.Heading className="h6 mb-1">{title}</Alert.Heading>}
				<div className="mb-0">{content || children}</div>
			</div>
		</Alert>
	)
}

Callout.inlineRenderer = true
Callout.displayName = 'Callout'
