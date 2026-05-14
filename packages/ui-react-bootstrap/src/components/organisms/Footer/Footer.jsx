import React from 'react'
import { useUI } from '@nan0web/ui-react'
import { Container, Row, Col } from 'react-bootstrap'
import { reactIcon } from '@nan0web/icons/adapters/react'
import {
	BsTelegram as _BsTelegram,
	BsFacebook as _BsFacebook,
	BsInstagram as _BsInstagram,
	BsYoutube as _BsYoutube,
	BsTelephone as _BsTelephone,
	BsEnvelopeAt as _BsEnvelopeAt,
} from '@nan0web/icons/bs'

const BsTelegram = reactIcon(_BsTelegram)
const BsFacebook = reactIcon(_BsFacebook)
const BsInstagram = reactIcon(_BsInstagram)
const BsYoutube = reactIcon(_BsYoutube)
const BsTelephone = reactIcon(_BsTelephone)
const BsEnvelopeAt = reactIcon(_BsEnvelopeAt)
import Icon from '../../atoms/Icon/Icon'
import './Footer.v2.scss'
import './Nav.v2.scss'

const SocialLinks = ({ social, t }) => {
	if (!social) return null
	return (
		<div className="social mb-4">
			<h6 className="fw-bold mb-3">{t('Ми в соціальних мережах')}</h6>
			<nav className="d-flex gap-3 flex-wrap">
				{social.telegram && (
					<a href={social.telegram} target="_blank" className="text-body fs-4" title="Telegram">
						<BsTelegram />
					</a>
				)}
				{social.facebook && (
					<a href={social.facebook} target="_blank" className="text-body fs-4" title="Facebook">
						<BsFacebook />
					</a>
				)}
				{social.instagram && (
					<a href={social.instagram} target="_blank" className="text-body fs-4" title="Instagram">
						<BsInstagram />
					</a>
				)}
				{social.youtube && (
					<a href={social.youtube} target="_blank" className="text-body fs-4" title="YouTube">
						<BsYoutube />
					</a>
				)}
			</nav>
		</div>
	)
}

const StoreApps = ({ apps, t }) => {
	if (!apps || !Array.isArray(apps)) return null
	return (
		<div className="apps mt-3 mt-md-0 mb-4">
			<h6 className="fw-bold mb-3">{t('Мобільні додатки')}</h6>
			<nav className="d-flex flex-column gap-3">
				{apps.map((app, idx) => (
					<div key={idx} className="d-flex flex-column gap-1">
						<span className="fw-bold small">{app.title}</span>
						<div className="d-flex flex-wrap gap-2">
							{app.ios && (
								<a
									href={app.ios}
									target="_blank"
									className="btn btn-dark btn-sm d-flex align-items-center gap-2 py-2 px-3"
								>
									<span>App Store</span>
								</a>
							)}
							{app.android && (
								<a
									href={app.android}
									target="_blank"
									className="btn btn-dark btn-sm d-flex align-items-center gap-2 py-2 px-3"
								>
									<span>Google Play</span>
								</a>
							)}
						</div>
					</div>
				))}
			</nav>
		</div>
	)
}

const FooterSignIn = ({ t }) => (
	<div className="signin-footer mb-4">
		<h6 className="fw-bold mb-3">{t('Вхід в систему')}</h6>
		<div className="d-flex flex-column gap-2">
			<a
				href="https://ibank.ua/private"
				className="btn btn-outline-primary w-100 text-start d-flex justify-content-between align-items-center fw-bold"
			>
				{t('Приватним особам')} <span>›</span>
			</a>
			<a
				href="https://ibank.ua/business"
				className="btn btn-primary w-100 text-start d-flex justify-content-between align-items-center fw-bold"
			>
				{t('Бізнесу')} <span>›</span>
			</a>
		</div>
	</div>
)

const FooterNavItem = ({ item, level = 0 }) => {
	const children = item.items || item.children
	const hasChildren = children && children.length > 0

	if (level === 0) {
		return (
			<div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-5">
				<h6 className="text-uppercase fw-bold mb-4 small text-muted border-bottom pb-2">
					{item.title}
				</h6>
				<ul className="list-unstyled">
					{children?.map((child, idx) => (
						<FooterNavItem key={idx} item={child} level={level + 1} />
					))}
				</ul>
			</div>
		)
	}

	return (
		<li className={`${level > 1 ? 'ms-3' : ''} mb-2`}>
			<a
				href={item.href || '#'}
				className={`text-decoration-none text-body hover-primary d-flex align-items-start gap-2 ${level === 1 ? 'small' : 'x-small text-body-secondary'}`}
			>
				{item.icon && <Icon name={item.icon} size={14} className="mt-1" />}
				<span>{item.title}</span>
				{item.badge && (
					<span className={`badge bg-${item.badgeColor || 'danger'} ms-auto`}>{item.badge}</span>
				)}
			</a>
			{hasChildren && (
				<ul className="list-unstyled mt-2">
					{children.map((child, idx) => (
						<FooterNavItem key={idx} item={child} level={level + 1} />
					))}
				</ul>
			)}
		</li>
	)
}

const Footer = ({ nav, contact: propContact }) => {
	const { t, document } = useUI()

	let navData = nav
	if (typeof nav === 'string' && document && document[nav]) {
		navData = document[nav]
	}

	const items =
		(navData && typeof navData === 'object'
			? navData.items || navData.children
			: document?.footer?.items ||
				document?.footer?.children ||
				document?.nav?.items ||
				document?.nav?.children) || []
	const contact = propContact || document?.contact || {}
	const social = document?.social || {}
	const storeApps = document?.store_apps || []

	return (
		<footer className="root footer-v2 bg-body pt-5 mt-auto border-top">
			<Container>
				{/* Top Section: Contacts, Apps, Social, Signin */}
				<div className="info border-bottom mb-5 pb-4">
					<Row className="g-4">
						<Col lg={4} md={6}>
							<div className="contacts">
								<h6 className="fw-bold mb-3 text-primary">{t('Центр підтримки клієнтів')}</h6>
								<div className="d-flex flex-column gap-3">
									{contact?.tel && (
										<div>
											<small className="text-muted d-block mb-1">
												{t('Безкоштовно по Україні')}
											</small>
											<a
												href={`tel:${contact.tel.replace(/[^\d\+]+/g, '')}`}
												className="fs-3 fw-bold text-decoration-none text-body d-flex align-items-center gap-3"
											>
												<BsTelephone className="text-primary" /> {contact.tel}
											</a>
										</div>
									)}
									{contact?.email && (
										<div className="mt-2">
											<a
												href={`mailto:${contact.email}`}
												className="btn btn-outline-info d-flex align-items-center gap-2 w-fit px-3 py-2"
											>
												<BsEnvelopeAt /> {contact.email}
											</a>
										</div>
									)}
								</div>
							</div>
						</Col>
						<Col lg={3} md={6}>
							<StoreApps apps={storeApps} t={t} />
						</Col>
						<Col lg={2} md={6}>
							<SocialLinks social={social} t={t} />
						</Col>
						<Col lg={3} md={6}>
							<FooterSignIn t={t} />
						</Col>
					</Row>
				</div>

				{/* Main Nav Section */}
				<div className="nav-sections">
					<Row>
						{items.map((section, idx) => (
							<FooterNavItem key={idx} item={section} />
						))}
					</Row>
				</div>

				{/* Bottom Section: Copyright & Legal */}
				<div className="bottom-bar mt-4 py-4 border-top">
					<Row className="align-items-center">
						<Col md={12} className="text-center">
							<div className="copy">
								<p className="text-muted small mb-0">
									&copy; {new Date().getFullYear()} Industrialbank.{' '}
									{t('Універсальна ліцензія НБУ № 126 від 12 жовтня 2011 року')}.
									<br />
									{t('Всі права захищено.')}
								</p>
							</div>
						</Col>
					</Row>
				</div>
			</Container>
		</footer>
	)
}

export default Footer
