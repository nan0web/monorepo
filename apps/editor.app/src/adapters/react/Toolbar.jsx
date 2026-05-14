import React from 'react'

/**
 * Editor toolbar with mode switching buttons.
 *
 * @component
 * @param {object} props - Component props
 * @param {string} props.mode - Current editor mode
 * @param {Function} props.onChangeMode - Mode change handler
 * @returns {JSX.Element} Toolbar component
 */
export default function Toolbar({ mode, onChangeMode }) {
	return (
		<div className="editor-toolbar">
			<button className={mode === 'code' ? 'active' : ''} onClick={() => onChangeMode('code')}>
				Code View
			</button>
			<button className={mode === 'visual' ? 'active' : ''} onClick={() => onChangeMode('visual')}>
				Visual Editor
			</button>
		</div>
	)
}
