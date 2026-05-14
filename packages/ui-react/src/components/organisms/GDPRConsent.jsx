import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'
import Modal from './Modal.jsx'

/**
 * Headless cookie consent logic
 */
const GDPRConsent = ({ onAccept, onDecline, children }) => {
	const { t, console } = useUI()
	const [show, setShow] = useState(false)
	const [consent, setConsent] = useState('')

	useEffect(() => {
		try {
			const stored = localStorage.getItem('gdpr-consent')
			if (stored) {
				setConsent(stored)
			} else {
				setShow(true)
			}
		} catch (err) {
			console.error('localStorage not available', err)
			setShow(true)
		}
	}, [console])

	const handleAction = (status, callback) => {
		setConsent(status)
		try {
			localStorage.setItem('gdpr-consent', status)
		} catch (err) {
			console.error(err)
		}
		const w = /** @type {any} */ (window); w.dataLayer = w.dataLayer || []
		w.dataLayer.push({ event: 'gdpr_consent', consent: status })
		setShow(false)
		if (callback) callback()
	}

	const handleAccept = () => handleAction('accepted', onAccept)
	const handleDecline = () => handleAction('declined', onDecline)

	if (children) {
		return typeof children === 'function'
			? children({ show, handleAccept, handleDecline, t })
			: children
	}

	return (
		<Modal isOpen={show} onClose={handleDecline}>
			<header>
				<h2 style={{ marginTop: 0 }}>{t('Privacy Agreement')}</h2>
			</header>
			<div>
				<p>
					{t(
						'We use cookies and similar technologies to enhance your browsing experience, analyze traffic, and provide tailored content.',
					)}
				</p>
				<p>{t('Do you consent to the use of cookies?')}</p>
			</div>
			<footer
				style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}
			>
				<button
					onClick={handleDecline}
					style={{
						padding: '0.5rem 1rem',
						cursor: 'pointer',
						border: '1px solid #ccc',
						background: 'transparent',
						borderRadius: '4px',
					}}
				>
					{t('Decline')}
				</button>
				<button
					onClick={handleAccept}
					style={{
						padding: '0.5rem 1rem',
						background: '#007bff',
						color: 'white',
						border: 'none',
						cursor: 'pointer',
						borderRadius: '4px',
					}}
				>
					{t('Accept')}
				</button>
			</footer>
		</Modal>
	)
}

GDPRConsent.propTypes = {
	onAccept: PropTypes.func,
	onDecline: PropTypes.func,
	children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
}

export default GDPRConsent
