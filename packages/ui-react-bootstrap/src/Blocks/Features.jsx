import React from 'react'
import { renderItem } from '../renderItem.jsx'

/**
 * Features — renders doc.doc.features as a list with checkmarks.
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Features({ doc, ...sharedProps }) {
	const features = doc?.doc?.features || doc?.features
	if (!features || !Array.isArray(features) || features.length === 0) return null

	return (
		<section className="bg-body-secondary bg-gradient py-5">
			<div className="container container-max">
				<div className="row g-4">
					{features.map((item, i) => (
						<div className="col-md-6 d-flex align-items-start gap-3" key={i}>
							<div className="text-success fs-4">
								<i className="icon-check-circle-o" />
							</div>
							<div className="fs-5 mt-1 text-body-secondary">
								{typeof item === 'string' ? item : renderItem(item, i, sharedProps)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
