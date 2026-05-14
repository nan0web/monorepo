import React from 'react'
import { Nav } from './Nav.jsx'
import { Sidebar } from './Sidebar.jsx'

/**
 * @typedef {Object} PageProps
 * @property {React.ReactNode} children - Main content ($content)
 * @property {object} [nav] - Navigation config for Nav component { items, brand, right }
 * @property {object} [sidebar] - Sidebar config { items, title }
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [fluid] - Use fluid container
 * @property {'start'|'end'} [sidebarPosition] - Sidebar placement (default: 'start')
 * @property {any} [doc] - The document object
 */

/**
 * Layout.Page — Structural skeleton (Layout) component.
 * Composes Nav, Sidebar, and wraps the main $content (children).
 * Acts as the top-level page container for complex layouts.
 *
 * @param {PageProps} props
 */
export const Page = ({
children,
nav,
sidebar,
className = '',
fluid = false,
sidebarPosition = 'start',
doc,
}) => {
	const hasSidebar = sidebar && sidebar.items && sidebar.items.length > 0
	const sidebarCol = hasSidebar ? (
<div
			className={`col-md-3 col-lg-2 d-none d-md-block bg-body-secondary border-end overflow-auto`}
			style={{
				position: 'sticky',
				top: nav ? '56px' : '0',
				height: nav ? 'calc(100vh - 56px)' : '100vh',
			}}
		>
			<Sidebar items={sidebar.items} title={sidebar.title} doc={doc} />
		</div>
	) : null

	const mainCol = (
<main className={`col-md-${hasSidebar ? '9' : '12'} col-lg-${hasSidebar ? '10' : '12'} py-4`}>
			{children}
		</main>
	)

	return (
<div
			className={`page-layout d-flex flex-column min-vh-100 ${className}`}
			data-testid="page-layout"
		>
			{nav && (
				<Nav
					items={nav.items || []}
					brand={nav.brand}
					right={nav.right}
					expand={nav.expand || 'lg'}
					className={nav.className || ''}
					doc={doc}
				/>
			)}

			<div className={`${fluid ? 'container-fluid' : 'container'} flex-grow-1 px-0`}>
				<div className="row g-0 flex-grow-1">
					{sidebarPosition === 'start' && sidebarCol}
					{mainCol}
					{sidebarPosition === 'end' && sidebarCol}
				</div>
			</div>
		</div>
	)
}

Page.inlineRenderer = true
Page.displayName = 'Page'
