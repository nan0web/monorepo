import React from 'react'

/**
 * Component palette for visual editor mode.
 *
 * @component
 * @param {object} props - Component props
 * @param {Function} props.onAdd - Add component handler
 * @param {object} props.components - Available components map
 * @returns {JSX.Element} Component palette
 */
export default function ComponentPalette({ onAdd, components }) {
	const componentNames = Object.keys(components)

	return (
		<div className="component-palette">
			<h4>Components</h4>
			{componentNames.map((name) => (
				<button key={name} onClick={() => onAdd(name)}>
					+ {name}
				</button>
			))}
		</div>
	)
}
