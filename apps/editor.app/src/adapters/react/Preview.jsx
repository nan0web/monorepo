import React from 'react'
import { UIReact } from '@nan0web/ui-react'

/**
 * Preview component that renders editor content.
 *
 * @component
 * @param {object} props - Component props
 * @param {Array} props.content - Content to preview
 * @param {object} props.components - Component registry
 * @returns {JSX.Element} Preview component
 */
export default function Preview({ content, components }) {
	// Create a temporary document structure for preview
	const previewDoc = {
		$content: content,
		$lang: 'en',
	}

	return (
		<div className="editor-preview">
			<UIReact content={previewDoc} context={{ renderers: components }} />
		</div>
	)
}
