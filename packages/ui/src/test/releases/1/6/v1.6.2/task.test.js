import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ideSource = readFileSync(
	new URL('../../../../../dist/ui.js', import.meta.url),
	'utf-8',
)

describe('v1.6.2: Professional Theme Editor & UI Integrity', () => {
	describe('Task 1: Full Bootstrap-like Theme Variables', () => {
		it('cssVars has primary, secondary, success, info, warning, danger, light, dark', () => {
			const colors = [
				'--ui-primary',
				'--ui-secondary',
				'--ui-success',
				'--ui-info',
				'--ui-warning',
				'--ui-danger',
				'--ui-light',
				'--ui-dark',
			]
			for (const color of colors) {
				assert.ok(ideSource.includes(`'${color}'`), `Missing CSS variable: ${color}`)
			}
		})

		it('cssVars has radius-sm, radius-md, radius-lg, radius-pill, radius-circle', () => {
			const radii = [
				'--ui-radius-sm',
				'--ui-radius-md',
				'--ui-radius-lg',
				'--ui-radius-pill',
				'--ui-radius-circle',
			]
			for (const r of radii) {
				assert.ok(ideSource.includes(`'${r}'`), `Missing geometry variable: ${r}`)
			}
		})

		it('cssVars has spacing variables', () => {
			const spaces = ['--ui-space-sm', '--ui-space-md', '--ui-space-lg']
			for (const s of spaces) {
				assert.ok(ideSource.includes(`'${s}'`), `Missing spacing variable: ${s}`)
			}
		})

		it('Theme Editor uses type="color" inputs', () => {
			assert.ok(
				ideSource.includes('type="color"') ||
					ideSource.includes("type='color'") ||
					ideSource.includes('type="${type}"') ||
					ideSource.includes('type=\\"${type}\\"'),
				'Theme editor should use type="color" for color inputs',
			)
		})

		it('Theme Editor has Palette and Geometry sections', () => {
			assert.ok(
				ideSource.includes('Palette') || ideSource.includes('palette'),
				'Theme editor should have Palette section',
			)
			assert.ok(
				ideSource.includes('Geometry') || ideSource.includes('geometry'),
				'Theme editor should have Geometry section',
			)
		})
	})

	describe('Task 2: Table renders actual content', () => {
		it('_renderPreview converts rows[][] + columns[] → data[] for ui-table', () => {
			assert.ok(
				ideSource.includes("tag === 'ui-table'"),
				'Should have special handling for ui-table',
			)
			assert.ok(
				ideSource.includes('el.data =') || ideSource.includes('el.data='),
				'Should set el.data from rows conversion',
			)
		})

		it('Table YAML has columns and rows in default props', () => {
			const tableYaml = readFileSync(
				new URL('../../../../../docs/uk/components/Table.yaml', import.meta.url),
				'utf-8',
			)
			assert.ok(tableYaml.includes('columns:'), 'Table YAML should define columns')
			assert.ok(tableYaml.includes('rows:'), 'Table YAML should define rows')
			assert.ok(tableYaml.includes('Yaro'), 'Table YAML should include sample data')
		})
	})

	describe('Task 3: Tree renders actual content', () => {
		it('_renderPreview maps data → items for ui-tree', () => {
			assert.ok(ideSource.includes("tag === 'ui-tree'"), 'Should have special handling for ui-tree')
			assert.ok(
				ideSource.includes('el.items =') || ideSource.includes('el.items='),
				'Should set el.items from data prop',
			)
		})

		it('Tree YAML has data with label/children structure', () => {
			const treeYaml = readFileSync(
				new URL('../../../../../docs/uk/components/Tree.yaml', import.meta.url),
				'utf-8',
			)
			assert.ok(treeYaml.includes('data:'), 'Tree YAML should define data')
			assert.ok(
				treeYaml.includes('Рослини') || treeYaml.includes('Plants'),
				'Tree YAML should have taxonomy root',
			)
			assert.ok(treeYaml.includes('children:'), 'Tree YAML should have children')
		})
	})

	describe('Task 4: ui-markdown renders HTML, not just text', () => {
		it('_renderPreview converts markdown → HTML for ui-markdown', () => {
			assert.ok(
				ideSource.includes("tag === 'ui-markdown'"),
				'Should have special handling for ui-markdown',
			)
			assert.ok(ideSource.includes('_md2html'), 'Should use md2html converter')
		})

		it('_md2html method exists and handles headings', () => {
			assert.ok(
				ideSource.includes('_md2html(md)') || ideSource.includes('_md2html (md)'),
				'Should define _md2html method',
			)
			assert.ok(ideSource.includes('<h1>$1</h1>'), 'Should convert # headings to <h1>')
		})

		it('_md2html handles bold and code', () => {
			assert.ok(ideSource.includes('<strong>$1</strong>'), 'Should convert **bold** to <strong>')
			assert.ok(ideSource.includes('<code>'), 'Should convert inline code to <code>')
		})
	})

	describe('Task 5: ui-toggle has no wrapper border', () => {
		it('CSS has ui-toggle border reset', () => {
			assert.ok(
				ideSource.includes('ui-toggle') && ideSource.includes('border: 0'),
				'Should reset border on ui-toggle host',
			)
		})
	})

	describe('Feedback: Alert has native content (not label)', () => {
		it('ui-alert is NOT in labelComponents', () => {
			// Alert should use its own .content prop, not be mapped to .label
			assert.ok(
				!ideSource.includes("'ui-alert',") ||
					ideSource.includes('// (ui-alert uses .content natively'),
				'ui-alert should not be in labelComponents set',
			)
		})
	})

	describe('Feedback: Table light theme text visibility', () => {
		it('light theme sets --fg-muted for Table cell colors', () => {
			assert.ok(
				ideSource.includes('--fg-muted'),
				'Light theme should propagate --fg-muted for table td text',
			)
		})
	})

	describe('Feedback: Modal/Confirm use el.open = true', () => {
		it('Modal/Confirm trigger sets open = true (not .show())', () => {
			assert.ok(
				ideSource.includes('el.open = true'),
				'Should use el.open = true to show modal/confirm',
			)
			assert.ok(!ideSource.includes('el.show()'), 'Should NOT call el.show() which does not exist')
		})
	})

	describe('Feedback: ProgressBar tag alias', () => {
		it('tagAliases maps ui-progress-bar to ui-progress', () => {
			assert.ok(
				ideSource.includes("'ui-progress-bar': 'ui-progress'"),
				'Should alias ui-progress-bar to ui-progress',
			)
		})
	})

	describe('Feedback: LangSelect data conversion', () => {
		it('LangSelect converts string[] langs to {code,title}[]', () => {
			assert.ok(
				ideSource.includes("tag === 'ui-lang-select'"),
				'Should have special handling for ui-lang-select',
			)
			assert.ok(ideSource.includes('el.langs ='), 'Should set el.langs with converted data')
		})
	})

	describe('Feedback: Tree has 4+ levels of depth', () => {
		it('Tree YAML has at least 4 nesting levels', () => {
			const treeYaml = readFileSync(
				new URL('../../../../../docs/uk/components/Tree.yaml', import.meta.url),
				'utf-8',
			)
			// Count indentation levels (each level is 2 or more spaces deeper)
			const lines = treeYaml.split('\n')
			const maxIndent = Math.max(...lines.map((l) => l.match(/^(\s*)/)?.[1].length || 0))
			// 4 levels × 2 spaces per level = at least 16 spaces of indentation
			assert.ok(maxIndent >= 16, `Tree should have 4+ levels (max indent: ${maxIndent})`)
		})

		it('Tree YAML has taxonomy structure', () => {
			const treeYaml = readFileSync(
				new URL('../../../../../docs/uk/components/Tree.yaml', import.meta.url),
				'utf-8',
			)
			assert.ok(treeYaml.includes('Рослини'), 'Should have Plants')
			assert.ok(treeYaml.includes('Тварини'), 'Should have Animals')
			assert.ok(treeYaml.includes('Гриби'), 'Should have Fungi')
		})
	})
})
