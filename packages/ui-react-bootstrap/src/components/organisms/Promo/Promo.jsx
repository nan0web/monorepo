import React from 'react'
import { Carousel, Button } from 'react-bootstrap'
import { useUI } from '@nan0web/ui-react'
import './Promo.v2.scss'

/**
 * Promo component - Displays a premium hero carousel (from V2 application).
 */
const Promo = ({ promo: propPromo, page: propPage }) => {
	const { t, document } = useUI()

	const promo = propPromo === true || !propPromo ? document?.promo : propPromo
	const page = propPage === true || !propPage ? document?.page : propPage

	const items =
		(promo &&
			(Array.isArray(promo.children)
				? promo.children
				: typeof promo.getElements === 'function'
					? promo.getElements()
					: [])) ||
		[]

	if (items.length === 0 && (page?.image || page?.imageUrl)) {
		return (
			<div
				className="promo-single-image"
				style={{ position: 'relative', height: '400px', overflow: 'hidden' }}
			>
				<img
					src={page.imageUrl || page.image}
					alt={page.title}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: '20%',
						left: '10%',
						color: 'white',
						textShadow: '0 2px 4px rgba(0,0,0,0.5)',
					}}
				>
					<h1 className="display-4 fw-bold mb-4">{page.title}</h1>
				</div>
			</div>
		)
	}

	return (
		<section className="header-slider">
			<Carousel fade interval={2000} pause={false}>
				{items.map((item, index) => (
					<Carousel.Item key={index}>
						<img className="bg-img d-block w-100" src={item.image} alt={item.title} />
						<Carousel.Caption className={item.cssBlock || ''}>
							<h2 className="display-4 fw-bold">{item.title}</h2>
							{item.text && (
								<div className="lead mb-4">
									{Array.isArray(item.text) ? (
										item.text.map((line, i) => <div key={i}>{line}</div>)
									) : (
										<p>{item.text}</p>
									)}
								</div>
							)}
							{item.href && (
								<Button href={item.href} variant={item.cssBtn || 'primary'} size="lg">
									{item.btnText || t('Learn More')}
								</Button>
							)}
						</Carousel.Caption>
					</Carousel.Item>
				))}
			</Carousel>
		</section>
	)
}

export default Promo
