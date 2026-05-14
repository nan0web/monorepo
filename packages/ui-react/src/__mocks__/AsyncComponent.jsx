import React from 'react'

export default function AsyncComponent({ children }) {
	return <div data-testid="async-comp">{children}</div>
}
