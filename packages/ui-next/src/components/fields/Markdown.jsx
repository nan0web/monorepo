'use client'

import React from 'react'
import MDEditor from '@uiw/react-md-editor'

export function Markdown({ value, onChange, placeholder, ...rest }) {
	return (
		<div className="olmui-markdown-wrapper" style={{ width: '100%', boxSizing: 'border-box' }}>
			<MDEditor
				value={value || ''}
				onChange={onChange}
				textareaProps={{
					placeholder: placeholder,
				}}
				{...rest}
			/>
		</div>
	)
}
