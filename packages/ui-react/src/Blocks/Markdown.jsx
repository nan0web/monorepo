import React from 'react'
import { marked } from 'marked'

export const Markdown = ({ content, html, children, doc, className = '' }) => {
	const rawText = content || doc?.Markdown || doc?.markdown

	if (html) {
		return (
			<div
				className={`markdown-content prose ${className}`}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		)
	}

	if (rawText && typeof rawText === 'string') {
		return (
			<div
				className={`markdown-content prose ${className}`}
				dangerouslySetInnerHTML={{ __html: marked.parse(rawText) }}
			/>
		)
	}

	return <div className={`markdown-content prose ${className}`}>{children}</div>
}

Markdown.inlineRenderer = true
Markdown.displayName = 'Markdown'
