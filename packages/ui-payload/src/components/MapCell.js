import React from 'react'

export function MapCell(props) {
	const val = props.cellData || props.value
	return React.createElement('span', null, String(val || ''))
}
