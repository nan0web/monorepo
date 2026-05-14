import React from 'react'
import ComponentPalette from './ComponentPalette.jsx'

/**
 * Visual editor with drag-n-drop component editing.
 *
 * @component
 * @param {object} props - Component props
 * @param {Array} props.value - Current content value
 * @param {Function} props.onChange - Value change handler
 * @param {object} props.components - Component registry
 * @returns {JSX.Element} Visual editor component
 */
export default function VisualEditor({ value, onChange, components }) {
	const handleComponentEdit = (index, props) => {
		const newData = [...value]
		newData[index] = { ...newData[index], ...props }
		onChange(newData)
	}

	const handleAddComponent = (type) => {
		onChange([...value, { [type]: {} }])
	}

	const handleDeleteComponent = (index) => {
		const newData = [...value]
		newData.splice(index, 1)
		onChange(newData)
	}

	return (
		<div className="visual-editor">
			<ComponentPalette onAdd={handleAddComponent} components={components} />

			{value.map((block, index) => {
				const ComponentType = Object.keys(block)[0]
				const props = block[ComponentType]
				const RealComponent = components[ComponentType]

				return (
					<div key={index} className="editor-block" style={{ position: 'relative' }}>
						<div className="block-controls">
							<button onClick={() => handleDeleteComponent(index)}>×</button>
						</div>
						{RealComponent ? (
							<RealComponent
								{...props}
								editable
								onUpdate={(newProps) => handleComponentEdit(index, newProps)}
							/>
						) : (
							<div>Unknown component: {ComponentType}</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
