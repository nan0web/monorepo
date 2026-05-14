import React, { useState } from 'react'

export const Nav = ({
	items: propItems = [],
	brand: propBrand,
	right,
	className = '',
	expand = 'lg',
	doc,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [openDropdown, setOpenDropdown] = useState(null)

	// Combine or prefer doc configuration
	const $nav = doc?.$nav || {}
	const navData = doc?.nav
	let items = propItems
	let brand = propBrand || $nav.brand

	// Extract items from doc.nav if provided
	if (navData && Array.isArray(navData)) {
		items = navData
	} else if (navData && typeof navData === 'object' && Array.isArray(navData.items)) {
		items = navData.items
		if (navData.brand) brand = navData.brand
	} else if (navData && typeof navData === 'object' && Array.isArray(navData.children)) {
		items = navData.children
		if (navData.brand) brand = navData.brand
	}

	const renderItem = (link, idx) => {
		if (link.children && link.children.length > 0) {
			const isDropOpen = openDropdown === idx
			return (
				<li className="nav-item dropdown" key={idx}>
					<a
						className="nav-link dropdown-toggle"
						href="#"
						role="button"
						onClick={(e) => {
							e.preventDefault()
							setOpenDropdown(isDropOpen ? null : idx)
						}}
					>
						{link.label || link.title}
					</a>
					<ul className={`dropdown-menu ${isDropOpen ? 'show' : ''}`}>
						{link.children.map((child, cIdx) => (
							<li key={cIdx}>
								<a className="dropdown-item" href={child.url || '#'}>
									{child.label || child.title}
								</a>
							</li>
						))}
					</ul>
				</li>
			)
		}
		return (
			<li className="nav-item" key={idx}>
				<a className="nav-link" href={link.url || '#'}>
					{link.label || link.title}
				</a>
			</li>
		)
	}

	return (
		<nav
			className={`navbar navbar-expand-${$nav.expand || expand} bg-body-tertiary mb-3 ${className}`}
		>
			<div className="container-fluid">
				{brand && (
					<a className="navbar-brand" href={brand.url || '#'}>
						{brand.logo && (
							<img src={brand.logo} alt={brand.title || 'Logo'} height="30" className="me-2" />
						)}
						{brand.title}
					</a>
				)}
				<button className="navbar-toggler" type="button" onClick={() => setIsOpen(!isOpen)}>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						{items.map((item, idx) => renderItem(item, idx))}
					</ul>
					{right && <div className="d-flex align-items-center gap-2">{right}</div>}
				</div>
			</div>
		</nav>
	)
}

Nav.inlineRenderer = true
Nav.displayName = 'Nav'
