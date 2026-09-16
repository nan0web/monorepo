import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ReleaseDashboard } from './ReleaseDashboard.js'

describe('ReleaseDashboard Web Component & HTML Renderer', () => {
	it('escapes HTML strings safely', () => {
		const escaped = ReleaseDashboard.escapeHtml('<script>alert("xss")</script>')
		assert.equal(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
	})

	it('renders complete dashboard HTML with summary stats and project cards', () => {
		const dashboard = new ReleaseDashboard({
			summary: {
				totalProjects: 2,
				totalHours: 14.5,
				totalIterations: 32,
				wipCount: 1,
				closedCount: 1,
			},
			projects: [
				{
					path: 'packages/release',
					name: '@nan0web/release',
					version: '3.3.0',
					hours: 8.5,
					iterations: 20,
					rrs: 340,
					status: 'wip',
					tasks: [
						{ content: 'Implement StatusCommand', status: 'Done', slug: 'status-cmd' },
						{ content: 'Add Web UI', status: 'todo', slug: 'web-ui' },
					],
				},
				{
					path: 'apps/bank',
					name: 'industrialbank',
					version: '3.3.0',
					hours: 6.0,
					iterations: 12,
					rrs: 360,
					status: 'closed',
					tasks: [{ content: 'All Green Tests', status: 'Done', slug: 'all-green' }],
				},
			],
		})

		const html = dashboard.render()

		assert.ok(html.includes('PM-as-Code Release'))
		assert.ok(html.includes('@nan0web/release'))
		assert.ok(html.includes('industrialbank'))
		assert.ok(html.includes('14.5'))
		assert.ok(html.includes('32'))
		assert.ok(html.includes('status-wip'))
		assert.ok(html.includes('status-closed'))
		assert.ok(html.includes('Implement StatusCommand'))
		assert.ok(html.includes('task-done'))
		assert.ok(html.includes('task-todo'))
	})
})
