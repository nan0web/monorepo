import React from 'react'
import { resolveContext } from '@nan0web/ui'

/**
 * Renderer for form elements with dynamic field resolution.
 *
 * @param {object} input - Renderer input object
 * @param {object} input.element - Form element definition
 * @param {object} input.context - UI context with data, actions and translation function
 * @returns {React.ReactNode} Rendered form
 */
export default function renderForm(input) {
	const { element, context } = input
	const { form: fields, ...props } = element

	return (
		<form {...props} role="form">
			{fields.map((field, i) => {
				const inputId = `${props.id || 'form'}-input-${i}`
				return (
					<div key={i} className="form-floating">
						{field.label && <label htmlFor={inputId}>{resolveContext(context, field.label)}</label>}
						{field.input && (
							<input
								id={inputId}
								value={resolveContext(context, field.input.$value)}
								onChange={resolveContext(context, field.input.$onChange)}
								{...Object.fromEntries(
									Object.entries(field.input).filter(([key]) => !key.startsWith('$')),
								)}
							/>
						)}

						{field.select && (
							<select
								id={inputId}
								value={resolveContext(context, field.select.$value)}
								onChange={resolveContext(context, field.select.$onChange)}
								{...Object.fromEntries(
									Object.entries(field.select).filter(([key]) => !key.startsWith('$')),
								)}
							>
								{(resolveContext(context, field.select.$options) || []).map((option, j) => {
									if (typeof option === 'string') {
										return (
											<option key={j} value={option}>
												{option}
											</option>
										)
									}
									return (
										<option key={j} value={option.value}>
											{option.label}
										</option>
									)
								})}
							</select>
						)}
					</div>
				)
			})}
		</form>
	)
}
