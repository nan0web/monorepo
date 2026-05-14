import React from 'react'

/**
 * renderHTML – renders raw HTML block from nan0web engine.
 * @param {Object} props
 * @param {Object} props.element  Block data containing 'ui-html'
 * @param {Object} props.context  UI Context
 */
export default function renderHTML({ element, context }) {
	const html = element['ui-html'] || ''
	
	if (!html) return null

	return (
		<div 
			className="ui-html-block markdown-content prose"
			dangerouslySetInnerHTML={{ __html: html }} 
		/>
	)
}
