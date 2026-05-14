import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

export default function Radio({ checked, defaultChecked, onChange, disabled = false, ...props }) {
	const { theme } = useUI()
	const [internalChecked, setInternalChecked] = React.useState(checked ?? defaultChecked ?? false)

	React.useEffect(() => {
		if (checked !== undefined) setInternalChecked(checked)
	}, [checked])

	const inputRef = React.useRef(null)

	// Sync with radio group (uncheck if another radio with same name is checked)
	React.useEffect(() => {
		if (checked !== undefined || !props.name) return
		const handleGlobalClick = (e) => {
			const target = /** @type {HTMLInputElement} */ (e.target)
			if (target && target.type === 'radio' && target.name === props.name && target !== inputRef.current) {
				// If another radio in our group was clicked, we should be unchecked
				// We use click because 'change' doesn't fire on the radio that is getting unchecked
				setInternalChecked(false)
			}
		}
		document.addEventListener('click', handleGlobalClick, true)
		return () => document.removeEventListener('click', handleGlobalClick, true)
	}, [checked, props.name])

	const handleChange = (e) => {
		// In uncontrolled mode, handleClick manages state — skip to avoid race condition
		if (checked === undefined) return
		setInternalChecked(e.target.checked)
		if (onChange) onChange(e)
	}

	const handleClick = (e) => {
		if (checked !== undefined) return // Controlled mode, ignore internal toggle

		setInternalChecked(prev => {
			const next = !prev
			if (onChange) {
				// We need to notify about the change
				// Use setTimeout to ensure state is updated if parent relies on it
				setTimeout(() => {
					const event = {
						target: {
							checked: next,
							type: 'radio',
							name: props.name,
							value: props.value
						},
						currentTarget: e.currentTarget,
						persist: () => { }
					}
					onChange(event)
				}, 0)
			}
			return next
		})
	}

	const isChecked = checked !== undefined ? checked : internalChecked
	const themeDefaults = theme?.atoms?.Radio || {}
	const defaults = {
		size: '16px',
		borderWidth: '1px',
		borderColor: '#cccccc',
		borderRadius: '50%',
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
				ref={inputRef}
				type="radio"
				checked={isChecked}
				onChange={handleChange}
				onClick={handleClick}
				style={style}
				disabled={disabled}
				{...props}
			/>
			{isChecked && (
				<span
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '50%',
						height: '50%',
						borderRadius: '50%',
						backgroundColor: 'white',
						pointerEvents: 'none',
					}}
				/>
			)}
		</span>
	)
}

Radio.propTypes = {
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
	style: PropTypes.object,
}
