import React, { useState, useEffect } from 'react'
import CodeEditor from './CodeEditor.jsx'
import VisualEditor from './VisualEditor.jsx'
import Preview from './Preview.jsx'
import Toolbar from './Toolbar.jsx'

/**
 * React editor component with code and visual modes.
 * Uses EditorModel for core functionality.
 *
 * @component
 * @param {object} props - Component props
 * @param {EditorModel} props.model - Editor model instance
 * @returns {JSX.Element} Editor component
 */
export default function Editor({ model }) {
	const [data, setData] = useState(model.content)
	const [mode, setMode] = useState(model.mode)

	useEffect(() => {
		const unsubscribe = model.onChange((newData) => {
			setData(newData)
		})
		return unsubscribe
	}, [model])

	useEffect(() => {
		setMode(model.mode)
	}, [model.mode])

	return (
		<div className="editor-container">
			<Toolbar mode={mode} onChangeMode={model.switchMode.bind(model)} />
			{mode === 'code' ? (
				<CodeEditor value={data} onChange={model.updateContent.bind(model)} db={model.db} />
			) : (
				<VisualEditor
					value={data}
					onChange={model.updateContent.bind(model)}
					components={model.components}
				/>
			)}
			<Preview content={data} components={model.components} />
		</div>
	)
}
