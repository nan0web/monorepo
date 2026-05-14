import React from 'react'

export const Sidebar = ({ items: propItems = [], title: propTitle, className = '', doc }) => {
	const $sidebar = doc?.$sidebar || {}
	const sidebarData = doc?.sidebar

	let title = propTitle || $sidebar.title
	let items = propItems

	if (sidebarData && Array.isArray(sidebarData)) {
		items = sidebarData
	} else if (sidebarData && typeof sidebarData === 'object') {
		if (Array.isArray(sidebarData.items)) {
			items = sidebarData.items
		} else if (Array.isArray(sidebarData.children)) {
			items = sidebarData.children
		}
		if (sidebarData.title) title = sidebarData.title
	}

	const renderItem = (link, idx) => {
		if (link.children && link.children.length > 0) {
			return (
				<li key={idx} className="nav-item mt-3 list-unstyled">
					<div className="text-uppercase text-muted small fw-bold mb-2 ps-3">
						{link.label || link.title}
					</div>
					<ul className="nav flex-column ms-2 border-start ps-2 list-unstyled">
						{link.children.map((child, cIdx) => (
							<li key={cIdx} className="nav-item">
								<a
									href={child.url || '#'}
									className={`nav-link ${child.active ? 'fw-bold text-primary active py-1' : 'text-body py-1'}`}
								>
									{child.label || child.title}
								</a>
							</li>
						))}
					</ul>
				</li>
			)
		}
		return (
			<li className="nav-item list-unstyled" key={idx}>
				<a
					href={link.url || '#'}
					className={`nav-link ${link.active ? 'fw-bold text-primary active' : 'text-body fw-medium'}`}
				>
					{link.label || link.title}
				</a>
			</li>
		)
	}

	return (
		<div className={`sidebar ${className}`}>
			{title && (
				<div className="p-3 border-bottom mb-2">
					<h5 className="fw-bold mb-0">{title}</h5>
				</div>
			)}
			<ul className="nav flex-column p-2 gap-1 list-unstyled m-0">
				{items.map((item, idx) => renderItem(item, idx))}
			</ul>
		</div>
	)
}

Sidebar.inlineRenderer = true
Sidebar.displayName = 'Sidebar'
