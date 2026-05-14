#!/usr/bin/env node

import { HTMLTransformer } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

/**
 * Demonstrates Bootstrap-compatible HTML layout rendering
 * @param {Logger} console
 */
export async function runHTMLBootstrapDemo(console) {
	console.clear()
	console.success('Bootstrap Layout Demo')

	const tr = new HTMLTransformer()

	const bootstrapPage = [
		{ '!DOCTYPE': true, $html: true },
		{
			lang: 'en',
			html: [
				{
					head: [
						{ meta: true, $charset: 'UTF-8' },
						{ meta: true, $name: 'viewport', $content: 'width=device-width, initial-scale=1.0' },
						{ title: 'Bootstrap Demo with nan0web' },
						{
							$href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
							$rel: 'stylesheet',
							link: true,
						},
						{
							style: `
								.container { max-width: 1200px; }
								.card { transition: transform 0.2s; }
								.card:hover { transform: translateY(-2px); }
							`,
						},
					],
				},
				{
					body: [
						{
							$class: 'container py-5',
							div: [
								{
									h1: 'Welcome to Bootstrap Demo',
								},
								{
									$class: 'row',
									div: [
										{
											$class: 'col-md-6 mb-4',
											div: [
												{
													$class: 'card',
													div: [
														{
															$class: 'card-body',
															div: [
																{
																	h5: { $class: 'card-title', text: 'Feature 1' },
																},
																{
																	p: {
																		$class: 'card-text',
																		text: 'This demonstrates how nan0web can generate Bootstrap-compatible markup.',
																	},
																},
																{
																	a: {
																		$class: 'btn btn-primary',
																		$href: '#',
																		text: 'Learn More',
																	},
																},
															],
														},
													],
												},
											],
										},
										{
											$class: 'col-md-6 mb-4',
											div: [
												{
													class: 'card',
													div: [
														{
															class: 'card-body',
															div: [
																{
																	h5: { class: 'card-title', text: 'Feature 2' },
																},
																{
																	p: {
																		class: 'card-text',
																		text: 'The transformation preserves all necessary classes and structure.',
																	},
																},
																{
																	a: {
																		class: 'btn btn-success',
																		href: '#',
																		text: 'Get Started',
																	},
																},
															],
														},
													],
												},
											],
										},
									],
								},
								{
									$class: 'text-center mt-4',
									div: [
										{
											a: {
												$class: 'btn btn-outline-secondary',
												$href: 'https://github.com/nan0web/html',
												text: 'View Source on GitHub',
											},
										},
									],
								},
							],
						},
						{
							$class: 'mt-5 pt-4 border-top',
							footer: [
								{
									$class: 'text-center text-muted',
									p: '© 2024 nan0web. Built with resonance.',
								},
							],
						},
						{
							script: true,
							$src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
						},
					],
				},
			],
		},
	]

	console.info('Bootstrap page structure (truncated):')
	const truncated =
		JSON.stringify(bootstrapPage, null, 2).split('\n').slice(0, 20).join('\n') + '\n...'
	console.info(truncated)

	await pressAnyKey(console)

	const html = await tr.encode(bootstrapPage)
	console.info('\nFull rendered HTML (first 30 lines):')
	const htmlLines = html.split('\n').slice(0, 30).join('\n') + '\n...'
	console.info(htmlLines)

	validateBootstrapStructure(html)
	console.success('\nBootstrap layout demo complete! 🎨')
}

/**
 * Validates Bootstrap-specific structure rendering
 * @param {string} html
 */
function validateBootstrapStructure(html) {
	const requiredPatterns = [
		/<meta[^>]+viewport[^>]+width=device-width/,
		/bootstrap\.min\.css/,
		/class="container/,
		/class="row/,
		/class="col-md-6/,
		/class="card/,
		/class="btn btn-primary/,
		/class="btn btn-success/,
		/class="text-center/,
		/class="border-top/,
		/class="text-muted/,
		/bootstrap\.bundle\.min\.js/,
	]

	for (const pattern of requiredPatterns) {
		if (!pattern.test(html)) {
			throw new Error(`Missing Bootstrap pattern: ${pattern}`)
		}
	}
}
