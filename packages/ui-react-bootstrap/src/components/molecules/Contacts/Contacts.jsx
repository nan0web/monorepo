import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Telephone from '../../atoms/Telephone/Telephone'
import Email from '../../atoms/Email/Email'
import Address from '../../atoms/Address/Address'
import Icon from '../../atoms/Icon/Icon'

/**
 * Single contact item component.
 */
const Contact = ({ name, title, phone, email, address, active = false }) => (
	<div
		className={`p-4 rounded-4 border ${active ? 'border-primary bg-body-secondary' : 'bg-body shadow-sm'}`}
	>
		{title && <div className="text-primary x-small fw-bold text-uppercase mb-1">{title}</div>}
		{name && <h5 className="fw-bold mb-3">{name}</h5>}
		<div className="d-flex flex-column gap-2">
			{phone && (
				<div className="d-flex align-items-start gap-2">
					<div className="mt-1 flex-shrink-0">
						<Icon name="phone" size={18} />
					</div>
					<Telephone value={phone} />
				</div>
			)}
			{email && (
				<div className="d-flex align-items-start gap-2">
					<div className="mt-1 flex-shrink-0">
						<Icon name="mail" size={18} />
					</div>
					<Email value={email} />
				</div>
			)}
			{address && (
				<div className="d-flex align-items-start gap-2">
					<div className="mt-1 flex-shrink-0">
						<Icon name="pin" size={18} />
					</div>
					<Address value={address} />
				</div>
			)}
		</div>
	</div>
)

/**
 * Contacts component - grid of contact blocks with title and map link.
 */
const Contacts = ({ items = [], title, map, className = '' }) => {
	return (
		<section className={`contacts ${className}`}>
			<div className="container">
				{title && <h2 className="display-6 fw-bold mb-5">{title}</h2>}
				{map && (
					<div className="mb-5 d-flex align-items-center gap-3 p-4 rounded-4 bg-body-secondary border">
						<Icon name="pin" size={40} className="text-primary" />
						<div>
							<h4 className="fw-bold mb-1">{map.title || 'Наш офіс'}</h4>
							<a href={map.url} target="_blank" rel="noreferrer" className="text-decoration-none">
								{map.address || 'Відкрити на карті'} &rsaquo;
							</a>
						</div>
					</div>
				)}
				<Row className="g-4">
					{items.map((item, idx) => (
						<Col key={idx} lg={4} md={6}>
							<Contact {...item} />
						</Col>
					))}
				</Row>
			</div>
		</section>
	)
}

export default Contacts
export { Contact }
