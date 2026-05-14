import React from 'react'
import { Nav as BsNav } from 'react-bootstrap'

export const Sidebar = ({ items = [], title, className = '' }) => {
	const renderItem = (link, idx) => {
		if (link.children && link.children.length > 0) {
			return (
				<BsNav.Item key={idx} className="mt-3">
					<div className="text-uppercase text-muted small fw-bold mb-2 ps-3">
						{link.label || link.title}
					</div>
					<BsNav className="flex-column ms-2 border-start ps-2">
						{link.children.map((child, cIdx) => (
							<BsNav.Link
								key={cIdx}
								href={child.url || '#'}
								className={child.active ? 'fw-bold text-primary active py-1' : 'text-body py-1'}
							>
								{child.label || child.title}
							</BsNav.Link>
						))}
					</BsNav>
				</BsNav.Item>
			)
		}
		return (
			<BsNav.Item key={idx}>
				<BsNav.Link
					href={link.url || '#'}
					className={link.active ? 'fw-bold text-primary active' : 'text-body fw-medium'}
				>
					{link.label || link.title}
				</BsNav.Link>
			</BsNav.Item>
		)
	}

	return (
		<div className={`sidebar ${className}`}>
			{title && (
				<div className="p-3 border-bottom mb-2">
					<h5 className="fw-bold mb-0">{title}</h5>
				</div>
			)}
			<BsNav className="flex-column p-2 gap-1">
				{items.map((item, idx) => renderItem(item, idx))}
			</BsNav>
		</div>
	)
}

Sidebar.inlineRenderer = true
Sidebar.displayName = 'Sidebar'
