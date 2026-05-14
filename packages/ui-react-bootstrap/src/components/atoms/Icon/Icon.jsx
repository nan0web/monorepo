import React from 'react'
import { reactIcon } from '@nan0web/icons/adapters/react'
import {
	BsTelegram,
	BsFacebook,
	BsInstagram,
	BsYoutube,
	BsSearch,
	BsTelephoneFill,
	BsEnvelopeFill,
	BsGlobe,
	BsGeoAltFill,
	BsPhoneFill,
	BsBank,
	BsCreditCardFill,
	BsShieldCheck,
	BsInfoCircleFill,
	BsChevronRight,
	BsChevronDown,
	BsHeadset,
	BsCalendar3,
	BsClockFill,
	BsPersonFill,
	BsLink45Deg,
	BsDownload,
	BsFileEarmarkPdfFill,
	BsCaretDownFill,
	BsArrowRight,
} from '@nan0web/icons/bs'
import { FaViber, FaWhatsapp } from '@nan0web/icons/fa'

export const iconMap = {
	telegram: reactIcon(BsTelegram),
	facebook: reactIcon(BsFacebook),
	instagram: reactIcon(BsInstagram),
	youtube: reactIcon(BsYoutube),
	viber: reactIcon(FaViber),
	whatsapp: reactIcon(FaWhatsapp),
	search: reactIcon(BsSearch),
	phone: reactIcon(BsTelephoneFill),
	mail: reactIcon(BsEnvelopeFill),
	language: reactIcon(BsGlobe),
	pin: reactIcon(BsGeoAltFill),
	mobile: reactIcon(BsPhoneFill),
	bank: reactIcon(BsBank),
	'credit-card': reactIcon(BsCreditCardFill),
	'shield-check': reactIcon(BsShieldCheck),
	'info-circle': reactIcon(BsInfoCircleFill),
	right: reactIcon(BsChevronRight),
	down: reactIcon(BsChevronDown),
	headset: reactIcon(BsHeadset),
	calendar: reactIcon(BsCalendar3),
	clock: reactIcon(BsClockFill),
	person: reactIcon(BsPersonFill),
	link: reactIcon(BsLink45Deg),
	download: reactIcon(BsDownload),
	pdf: reactIcon(BsFileEarmarkPdfFill),
	'caret-down': reactIcon(BsCaretDownFill),
	arrow: reactIcon(BsArrowRight),
}

/**
 * Icon component - renders Font Awesome icons from react-icons.
 * @param {Object} props
 * @param {string} props.name - Icon name from the iconMap
 * @param {number} [props.size=20] - Icon size in pixels
 * @param {string} [props.className] - Optional CSS class
 */
const Icon = ({ name, size = 20, className = '' }) => {
	const IconComponent = iconMap[name]

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found in iconMap`)
		return null
	}

	return <IconComponent size={size} className={className} />
}

export default Icon
