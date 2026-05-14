import React, { useState, useEffect } from 'react'
import DB from '@nan0web/db'
import MonacoEditor from '@monaco-editor/react'

/**
 * Monaco-based code editor for structured documents.
 *
 * @component
 * @param {object} props - Component props
 * @param {object} props.value - Current document value
 * @param {Function} props.onChange - Value change handler
 * @param {DB} props.db - Database instance
 * @returns {JSX.Element} Code editor component
 */
export default function CodeEditor({ value, onChange, db }) {
	const [code, setCode] = useState(JSON.stringify(value, null, 2))

	useEffect(() => {
		setCode(JSON.stringify(value, null, 2))
	}, [value])

	const handleEditorChange = (newCode) => {
		setCode(newCode)
		try {
			const parsed = JSON.parse(newCode)
			onChange(parsed)
		} catch (e) {
			// invalid JSON - don't update
		}
	}

	return (
		<MonacoEditor
			height="40vh"
			language="json"
			value={code}
			onChange={handleEditorChange}
			beforeMount={setupAutoCompletion}
		/>
	)
}

/**
 * Setup Monaco auto-completion for known components
 * @param {any} monaco - Monaco namespace
 */
function setupAutoCompletion(monaco) {
	// Setup component-based auto-completion here
	// This would use the registered components to provide suggestions
}
