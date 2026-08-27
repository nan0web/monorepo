import React from 'react'

export function ImageCell(props) {
	const value = props.cellData || props.value
	if (!value) return null

	const srcValue = typeof value === 'object' ? value.url || value.thumbnailURL : value
	if (!srcValue) return null
	const src = srcValue.startsWith('http') || srcValue.startsWith('/') ? srcValue : `/${srcValue}`

	return React.createElement('img', {
		src,
		alt: 'Thumbnail',
		width: 192,
		height: 108,
		style: {
			width: 192,
			minWidth: 192,
			height: 108,
			minHeight: 108,
			objectFit: 'cover',
			borderRadius: 6,
			display: 'block',
		},
	})
}
