import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(__dirname, '../../../../../dist')
const ideJsPath = path.join(siteDir, 'ui.js')
const mainJsPath = path.join(siteDir, 'ui.js')
const dataDir = path.resolve(__dirname, '../../../../../docs/uk/components')
const dataEnDir = path.resolve(__dirname, '../../../../../docs/en/components')

// ─── Task 1: Content vs Label ─────────────────────────────────

describe('Task 1: Content vs Label (YAML + Code Output)', () => {
	const yamlFiles = [
		'Button.yaml',
		'Badge.yaml',
		'Toggle.yaml',
		'Input.yaml',
		'Select.yaml',
		'Autocomplete.yaml',
	]

	for (const lang of ['uk', 'en']) {
		for (const file of yamlFiles) {
			it(`${lang}/${file}: config uses content: not label:`, () => {
				const dir = lang === 'uk' ? dataDir : dataEnDir
				const yaml = fs.readFileSync(path.join(dir, file), 'utf-8')
				const configMatch = yaml.match(/^\$\w+:\s*\n([\s\S]*?)^content:/m)
				if (configMatch) {
					const hasLabel = /^ {2}label:/m.test(configMatch[1])
					assert.ok(!hasLabel, `${lang}/${file} config should use content: not label:`)
				}
			})
		}
	}

	it('Button.yaml (uk) variants use "content:" not "label:"', () => {
		const yaml = fs.readFileSync(path.join(dataDir, 'Button.yaml'), 'utf-8')
		const contentSection = yaml.split(/^content:/m)[1]
		if (contentSection) {
			const hasLabel = /\blabel:/m.test(contentSection)
			assert.ok(!hasLabel, 'Button.yaml variants should use "content:" not "label:"')
		}
	})

	it('Button.yaml (en) variants use "content:" not "label:"', () => {
		const yaml = fs.readFileSync(path.join(dataEnDir, 'Button.yaml'), 'utf-8')
		const contentSection = yaml.split(/^content:/m)[1]
		if (contentSection) {
			const hasLabel = /\blabel:/m.test(contentSection)
			assert.ok(!hasLabel, 'en/Button.yaml variants should use "content:" not "label:"')
		}
	})

	it('Tree.yaml still uses "label:" (TreeNode model — not renamed)', () => {
		const yaml = fs.readFileSync(path.join(dataDir, 'Tree.yaml'), 'utf-8')
		assert.ok(yaml.includes('label:'), 'Tree.yaml should keep label: as part of TreeNode model')
	})

	it('main.js uses props.content for variant name fallback', () => {
		const code = fs.readFileSync(mainJsPath, 'utf-8')
		assert.ok(
			code.includes('props.content'),
			'main.js should use props.content for variant name resolution',
		)
	})

	it('_generateCode YAML maps label to content in output', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const yamlBranch = code.match(/codeFormat === 'yaml'[\s\S]*?trimEnd/m)
		assert.ok(yamlBranch, 'YAML branch should exist in _generateCode')
		assert.ok(
			yamlBranch[0].includes("'label'"),
			'YAML branch should handle label key (map to content in output)',
		)
	})
})

// ─── Task 2: NaN0 Spec Format ─────────────────────────────────

describe('Task 2: NaN0 Spec Code Generation', () => {
	it('_generateCode handles nan0 format branch', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes("'nan0'") || code.includes('"nan0"'),
			'_generateCode should have a nan0 format branch',
		)
	})

	it('nan0 format uses $ prefix for props', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// The nan0 branch should generate $ prefixed prop keys like $variant, $size
		// Look for a string template that literally outputs '$' as prop prefix
		const hasNan0Dollar = /nan0[\s\S]{0,500}\\\$|nan0[\s\S]{0,500}'\$|nan0[\s\S]{0,500}"\$/m.test(
			code,
		)
		assert.ok(hasNan0Dollar, '_generateCode nan0 branch should produce $-prefixed prop output')
	})

	it('_generateCode nan0 branch places content as element value', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// In nan0 format: `- Component: contentValue`
		// The code should format content as the value after component name
		const genCode = code.match(/_generateCode[\s\S]*?nan0[\s\S]*?activeComponent/m)
		assert.ok(
			genCode,
			'nan0 branch should use activeComponent for element key with content as value',
		)
	})
})

// ─── Task 3: Three Code Tabs ──────────────────────────────────

describe('Task 3: Three Code Tabs in IDE', () => {
	it('render has 3 code tab buttons', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const tabMatches = code.match(/class="code-tab/g) || []
		// class=... pattern for code-tab should appear at least 3 times (3 tabs)
		assert.ok(tabMatches.length >= 3, `Expected 3+ code-tab buttons, found ${tabMatches.length}`)
	})

	it('NaN0 Spec tab sets codeFormat to nan0', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes("codeFormat = 'nan0'") || code.includes('codeFormat = "nan0"'),
			'NaN0 Spec tab should set codeFormat to nan0',
		)
	})

	it('code tabs include NaN0 Spec label text', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('NaN0 Spec') || code.includes('NaN0Spec'),
			'Code tabs should include "NaN0 Spec" label',
		)
	})
})

// ─── Feedback: Properties shows "content" not "label" ─────────

describe('Feedback: YAML config uses content: (IDE display)', () => {
	it('Button.yaml config uses content: not label:', () => {
		const yaml = fs.readFileSync(path.join(dataDir, 'Button.yaml'), 'utf-8')
		const configMatch = yaml.match(/^\$Button:\s*\n([\s\S]*?)^content:/m)
		if (configMatch) {
			const hasContent = /^ {2}content:/m.test(configMatch[1])
			assert.ok(hasContent, 'Button.yaml config must use content: for IDE display')
		}
	})

	it('Badge.yaml config uses content: not label:', () => {
		const yaml = fs.readFileSync(path.join(dataDir, 'Badge.yaml'), 'utf-8')
		const configMatch = yaml.match(/^\$Badge:\s*\n([\s\S]*?)^content:/m)
		if (configMatch) {
			const hasContent = /^ {2}content:/m.test(configMatch[1])
			assert.ok(hasContent, 'Badge.yaml config must use content: for IDE display')
		}
	})
})

// ─── Feedback: Preview maps content → label ──────────────────

describe('Feedback: Preview maps content to DOM label', () => {
	it('_renderPreview maps content prop to label on DOM element', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const previewMethod = code.match(/_renderPreview[\s\S]*?\n\t\}/m)
		assert.ok(previewMethod, '_renderPreview method should exist')
		assert.ok(
			previewMethod[0].includes('label') && previewMethod[0].includes('content'),
			'_renderPreview should map content prop to label for DOM element',
		)
	})
})

// ─── Feedback: Code output maps label/content correctly ──────

describe('Feedback: Code output handles content', () => {
	it('NaN0 format treats label as content-like (element value, not $label)', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const nan0Branch = code.match(/codeFormat === 'nan0'[\s\S]*?return res/m)
		assert.ok(nan0Branch, 'nan0 branch should exist')
		assert.ok(
			nan0Branch[0].includes("'label'") || nan0Branch[0].includes('"label"'),
			'nan0 branch must treat label as content-like prop (not output as $label)',
		)
	})
})

// ─── Feedback: Code tabs CSS ─────────────────────────────────

describe('Feedback: Code tabs styling', () => {
	it('.code-tab has border-radius: 0', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const tabBlock = code.match(/\.code-tab\s*\{([^}]+)\}/s)
		assert.ok(tabBlock, '.code-tab CSS block should exist')
		assert.ok(
			tabBlock[1].includes('border-radius: 0') || tabBlock[1].includes('border-radius:0'),
			'.code-tab should have border-radius: 0',
		)
	})

	it('.variant-pill has border-radius: 0', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const block = code.match(/\.variant-pill\s*\{([^}]+)\}/s)
		assert.ok(block, '.variant-pill CSS block should exist')
		assert.ok(
			block[1].includes('border-radius: 0') || block[1].includes('border-radius:0'),
			'.variant-pill should have border-radius: 0',
		)
	})

	it('.variants-list has no gap (tabs flush together)', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const block = code.match(/\.variants-list\s*\{([^}]+)\}/s)
		assert.ok(block, '.variants-list CSS block should exist')
		assert.ok(
			block[1].includes('gap: 0') || block[1].includes('gap:0'),
			'.variants-list should have gap: 0 for tab layout',
		)
	})
})

// ─── Feedback: codeFormat localStorage ───────────────────────

describe('Feedback: codeFormat persistence', () => {
	it('constructor reads codeFormat from localStorage', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes("localStorage.getItem('ui-code-format')") ||
				code.includes('localStorage.getItem("ui-code-format")'),
			'Constructor should read codeFormat from localStorage',
		)
	})

	it('tab click saves codeFormat to localStorage', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes("localStorage.setItem('ui-code-format'") ||
				code.includes('localStorage.setItem("ui-code-format"'),
			'Tab click should persist codeFormat to localStorage',
		)
	})
})

// ─── Feedback: Add variation button ──────────────────────────

describe('Feedback: Add variation button text', () => {
	it('add-btn says "Додати варіацію" not "Зберегти"', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(!code.includes('+ Зберегти'), 'add-btn should not say "+ Зберегти"')
		assert.ok(
			code.includes('Додати варіацію') || code.includes('+ Додати'),
			'add-btn should say "Додати варіацію"',
		)
	})

	it('mobile hides full text, shows only "+"', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('add-btn-text') || code.includes('add-label'),
			'add-btn should have a separate text element for mobile hiding',
		)
	})
})

// ─── Feedback: sidebar-toggle sticky bottom ──────────────────

describe('Feedback: sidebar-toggle position', () => {
	it('sidebar-toggle is at bottom-right', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const block = code.match(/\.sidebar-toggle\s*\{([^}]+)\}/s)
		assert.ok(block, '.sidebar-toggle CSS block should exist')
		assert.ok(
			block[1].includes('bottom:') && block[1].includes('right:'),
			'sidebar-toggle should be positioned at bottom-right',
		)
	})

	it('sidebar-toggle has backdrop-filter blur', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const block = code.match(/\.sidebar-toggle\s*\{([^}]+)\}/s)
		assert.ok(block, '.sidebar-toggle CSS block should exist')
		assert.ok(
			block[1].includes('backdrop-filter'),
			'sidebar-toggle should have backdrop-filter for blur effect',
		)
	})

	it('sidebar-toggle uses theme-aware colors (not hardcoded dark)', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const block = code.match(/\.sidebar-toggle\s*\{([^}]+)\}/s)
		assert.ok(block, '.sidebar-toggle CSS block should exist')
		assert.ok(
			block[1].includes('var(--'),
			'sidebar-toggle should use CSS custom properties for theming',
		)
	})
})

// ─── Feedback: Mobile sidebar box-shadow ─────────────────────

describe('Feedback: Mobile sidebar styling', () => {
	it('mobile sidebar has no box-shadow when closed', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const mobileBlock = code.match(/@media[^{]*768px[^{]*\{([\s\S]*?\n\t\t\})/m)
		assert.ok(mobileBlock, 'mobile media query should exist')
		const sidebarMatch = mobileBlock[1].match(/\.sidebar\s*\{([^}]+)\}/s)
		if (sidebarMatch) {
			assert.ok(
				!sidebarMatch[1].includes('box-shadow') || sidebarMatch[1].includes('box-shadow: none'),
				'mobile sidebar should not have box-shadow when hidden',
			)
		}
	})
})

// ─── Feedback: i18n for IDE labels ───────────────────────────

describe('Feedback: i18n for IDE labels', () => {
	it('IDE has English text for Preview', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(code.includes('Preview'), 'IDE should contain English "Preview" text')
	})

	it('IDE has English text for Properties', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('Properties') || code.includes('PROPERTIES'),
			'IDE should contain English "Properties" text',
		)
	})

	it('IDE has English text for Reset', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(code.includes('Reset'), 'IDE should contain English "Reset" text')
	})

	it('IDE has English text for Copy', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('Copy code') || code.includes('Copy Code'),
			'IDE should contain English "Copy code" text',
		)
	})
})
