import React from 'react'

export default function renderTable({ element }) {
	const { table: content, ...props } = element

	return <table {...props}>{content}</table>
}
