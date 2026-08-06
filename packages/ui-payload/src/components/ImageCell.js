import React from 'react'

export function ImageCell(props) {
	const src = props.cellData || props.value
	if (!src) return null
	return React.createElement('img', {
		src,
		alt: 'Thumbnail',
		style: { width: 32, height: 32, objectFit: 'cover', borderRadius: 4 },
	})
}
