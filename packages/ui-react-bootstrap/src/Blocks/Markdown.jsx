import React from 'react'

export const Markdown = ({ content, html, children, className = '' }) => {
	const markup = html || content

	if (markup) {
		return (
			<div
				className={`markdown-content prose ${className}`}
				dangerouslySetInnerHTML={{ __html: markup }}
			/>
		)
	}

	return <div className={`markdown-content prose ${className}`}>{children}</div>
}

Markdown.inlineRenderer = true
Markdown.displayName = 'Markdown'
