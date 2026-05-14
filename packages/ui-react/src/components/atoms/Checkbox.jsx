import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Checkbox({ checked, defaultChecked, onChange, disabled = false, ...props }) {
	const { theme } = useUI()
	const [internalChecked, setInternalChecked] = React.useState(checked ?? defaultChecked ?? false)

	React.useEffect(() => {
		if (checked !== undefined) setInternalChecked(checked)
	}, [checked])

	const handleChange = (e) => {
		setInternalChecked(e.target.checked)
		if (onChange) onChange(e)
	}

	const isChecked = checked !== undefined ? checked : internalChecked
	const themeDefaults = theme?.atoms?.Checkbox || {}
	const defaults = {
		size: '16px',
		borderWidth: '1px',
		borderColor: '#cccccc',
		borderRadius: '3px',
		backgroundColor: '#ffffff',
		checkedColor: '#0d6efd',
		cursor: 'pointer',
		...themeDefaults,
	}

	const style = {
		width: defaults.size,
		height: defaults.size,
		border: `${defaults.borderWidth} solid ${defaults.borderColor}`,
		borderRadius: defaults.borderRadius,
		backgroundColor: isChecked ? defaults.checkedColor : defaults.backgroundColor,
		appearance: 'none',
		position: 'relative',
		cursor: disabled ? 'not-allowed' : defaults.cursor,
		opacity: disabled ? 0.5 : 1,
		...props.style,
	}

	return (
		<span style={{ position: 'relative', display: 'inline-block', width: defaults.size, height: defaults.size }}>
			<input
				type="checkbox"
				checked={isChecked}
				onChange={handleChange}
				style={style}
				disabled={disabled}
				{...props}
			/>
			{isChecked && (
				<svg
					viewBox="0 0 24 24"
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						fill: 'none',
						stroke: 'white',
						strokeWidth: 3,
						strokeLinecap: 'round',
						strokeLinejoin: 'round',
					}}
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			)}
		</span>
	)
}

Checkbox.propTypes = {
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
	style: PropTypes.object,
}
