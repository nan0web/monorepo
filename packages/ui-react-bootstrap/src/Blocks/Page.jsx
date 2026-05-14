import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
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
}) => {
	const hasSidebar = sidebar && sidebar.items && sidebar.items.length > 0
	const sidebarCol = hasSidebar ? (
		<Col
			md={3}
			lg={2}
			className={`d-none d-md-block bg-body-secondary border-end overflow-auto`}
			style={{
				position: 'sticky',
				top: nav ? '56px' : '0',
				height: nav ? 'calc(100vh - 56px)' : '100vh',
			}}
		>
			<Sidebar items={sidebar.items} title={sidebar.title} />
		</Col>
	) : null

	const mainCol = (
		<Col md={hasSidebar ? 9 : 12} lg={hasSidebar ? 10 : 12} className="py-4" as="main">
			{children}
		</Col>
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
				/>
			)}

			<Container fluid={fluid} className="flex-grow-1 px-0">
				<Row className="g-0 flex-grow-1">
					{sidebarPosition === 'start' && sidebarCol}
					{mainCol}
					{sidebarPosition === 'end' && sidebarCol}
				</Row>
			</Container>
		</div>
	)
}

Page.inlineRenderer = true
Page.displayName = 'Page'
