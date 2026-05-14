import React from 'react'
import PropTypes from 'prop-types'
import { Card as BootstrapCard } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'

import Icon from '../atoms/Icon/Icon'

/**
 * Enhanced Bootstrap Card for V2 design.
 */
export default function Card({
	title,
	subtitle,
	icon,
	header,
	footer,
	children,
	variant = 'v2',
	className = '',
	...props
}) {
	const { theme } = useUI()

	return (
		<BootstrapCard className={`border-0 shadow-sm ${variant === 'v2' ? 'rounded-4' : ''} ${className}`} {...props}>
			{(header || title || icon) && (
				<BootstrapCard.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
					<div className="d-flex align-items-center gap-3">
						{icon && <Icon name={icon} size={32} className="text-primary" />}
						<div>
							{title && <h5 className="mb-0 fw-bold">{title}</h5>}
							{subtitle && <small className="text-muted">{subtitle}</small>}
						</div>
					</div>
					{header}
				</BootstrapCard.Header>
			)}
			<BootstrapCard.Body className="p-4">
				{children}
			</BootstrapCard.Body>
			{footer && (
				<BootstrapCard.Footer className="bg-transparent border-top-0 pb-4 px-4 pt-0">
					{footer}
				</BootstrapCard.Footer>
			)}
		</BootstrapCard>
	)
}

Card.propTypes = {
	children: PropTypes.node.isRequired,
	style: PropTypes.object,
}
