import React from 'react'
import { Navbar, Nav as BsNav, Container, Offcanvas, NavDropdown } from 'react-bootstrap'

export const Nav = ({ items = [], brand, right, className = '', expand = 'lg' }) => {
	const renderItem = (link, idx) => {
		if (link.children && link.children.length > 0) {
			return (
				<NavDropdown title={link.label || link.title} id={`nav-dropdown-${idx}`} key={idx}>
					{link.children.map((child, cIdx) => (
						<NavDropdown.Item key={cIdx} href={child.url || '#'}>
							{child.label || child.title}
						</NavDropdown.Item>
					))}
				</NavDropdown>
			)
		}
		return (
			<BsNav.Link key={idx} href={link.url || '#'}>
				{link.label || link.title}
			</BsNav.Link>
		)
	}

	return (
		<Navbar expand={expand} className={`bg-body-tertiary mb-3 ${className}`}>
			<Container fluid>
				{brand && (
					<Navbar.Brand href={brand.url || '#'}>
						{brand.logo ? (
							<img src={brand.logo} alt={brand.title} height="30" className="me-2" />
						) : null}
						{brand.title}
					</Navbar.Brand>
				)}
				<Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
				<Navbar.Offcanvas
					id={`offcanvasNavbar-expand-${expand}`}
					aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
					placement="end"
				>
					<Offcanvas.Header closeButton>
						<Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
							{brand?.title || 'Меню'}
						</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body>
						<BsNav className="justify-content-start flex-grow-1 pe-3">
							{items.map((item, idx) => renderItem(item, idx))}
						</BsNav>
						{right && <div className="d-flex align-items-center mt-3 mt-lg-0 gap-2">{right}</div>}
					</Offcanvas.Body>
				</Navbar.Offcanvas>
			</Container>
		</Navbar>
	)
}

Nav.inlineRenderer = true
Nav.displayName = 'Nav'
