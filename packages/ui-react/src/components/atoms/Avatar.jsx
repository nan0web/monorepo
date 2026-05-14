import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Avatar({ src, alt = '', style = {}, className = '', ...props }) {
	const { theme } = useUI()
	const [useFallback, setUseFallback] = useState(!src)
	const [loading, setLoading] = useState(!!src)

	const handleLoad = useCallback(() => {
		setLoading(false)
	}, [])

	const handleError = useCallback(() => {
		setUseFallback(true)
		setLoading(false)
	}, [])

	const defaults = {
		size: '2.5rem',
		borderRadius: '50%',
		border: 'none',
		backgroundColor: '#f3f4f6',
		fallbackColor: '#9ca3af',
		fallbackTextColor: '#6b7280',
	}
	const themeDefaults = theme?.atoms?.Avatar || {}
	Object.assign(defaults, themeDefaults)

	const containerStyle = {
		width: defaults.size,
		height: defaults.size,
		borderRadius: defaults.borderRadius,
		border: defaults.border,
		overflow: 'hidden',
		display: 'inline-block',
		verticalAlign: 'middle',
		...style,
	}

	if (useFallback) {
		const initials = alt
			? alt
					.split(' ')
					.map((n) => n[0]?.toUpperCase())
					.join('')
					.slice(0, 2) || '?'
			: '?'
		return (
			<div className={className} style={containerStyle} role="img" aria-label={alt}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
						height: '100%',
						backgroundColor: defaults.fallbackColor,
						color: defaults.fallbackTextColor,
						fontSize: '0.875rem',
						fontWeight: 'bold',
					}}
				>
					{initials}
				</div>
			</div>
		)
	}

	return (
		<div className={className} style={containerStyle} {...props}>
			<img
				src={src}
				alt={alt}
				onLoad={handleLoad}
				onError={handleError}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					borderRadius: defaults.borderRadius,
					display: loading ? 'none' : 'block',
				}}
			/>
		</div>
	)
}

Avatar.propTypes = {
	src: PropTypes.string,
	alt: PropTypes.string,
	style: PropTypes.object,
	className: PropTypes.string,
}

Avatar.defaultProps = {
	src: '',
	alt: '',
	style: {},
	className: '',
}
