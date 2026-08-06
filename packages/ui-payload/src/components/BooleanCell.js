import React from 'react'

export function BooleanCell(props) {
	const val = Boolean(props.cellData ?? props.value)
	return React.createElement('span', {
		style: { color: val ? '#22c55e' : '#ef4444', fontWeight: 600 },
	}, val ? '✓' : '✗')
}
