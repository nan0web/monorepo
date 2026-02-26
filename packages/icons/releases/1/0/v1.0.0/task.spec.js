import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../../..')

// ─── 1. Core API ────────────────────────────────────────

describe('Core API: toSvg()', () => {
	it('renders valid SVG string from icon data', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/index.js'))
		const data = {
			tag: 'svg',
			attr: { fill: 'currentColor', viewBox: '0 0 16 16' },
			child: [{ tag: 'path', attr: { d: 'M0 0h16v16H0z' }, child: [] }],
		}
		const svg = toSvg(data)
		assert.ok(svg.startsWith('<svg'))
		assert.ok(svg.includes('viewBox'))
		assert.ok(svg.endsWith('</svg>'))
	})

	it('respects size option', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/index.js'))
		const data = {
			tag: 'svg',
			attr: { fill: 'currentColor', viewBox: '0 0 16 16' },
			child: [],
		}
		const svg = toSvg(data, { size: 24 })
		assert.ok(svg.includes('width="24"'))
		assert.ok(svg.includes('height="24"'))
	})

	it('respects class option', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/index.js'))
		const data = {
			tag: 'svg',
			attr: { fill: 'currentColor', viewBox: '0 0 16 16' },
			child: [],
		}
		const svg = toSvg(data, { class: 'icon-test' })
		assert.ok(svg.includes('class="icon-test"'))
	})

	it('respects color option', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/index.js'))
		const data = {
			tag: 'svg',
			attr: { fill: 'currentColor', viewBox: '0 0 16 16' },
			child: [],
		}
		const svg = toSvg(data, { color: 'red' })
		assert.ok(svg.includes('fill="red"'))
	})

	it('returns empty string for invalid data', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/index.js'))
		assert.equal(toSvg(null), '')
		assert.equal(toSvg({}), '')
	})
})

// ─── 2. Icon Sets ───────────────────────────────────────

describe('Icon Sets', () => {
	const SETS = ['bs', 'fa', 'fa6', 'fi', 'md', 'hi', 'hi2', 'ib']

	for (const set of SETS) {
		it(`${set}.js exports icon objects`, async () => {
			const mod = await import(resolve(ROOT, `src/sets/${set}.js`))
			const exports = Object.keys(mod)
			assert.ok(exports.length > 0, `${set} should have exports`)

			// Verify first export has correct structure
			const firstIcon = mod[exports[0]]
			assert.equal(firstIcon.tag, 'svg', `${set}: first icon tag should be svg`)
			assert.ok(firstIcon.attr, `${set}: first icon should have attr`)
			assert.ok(Array.isArray(firstIcon.child), `${set}: first icon should have child array`)
		})
	}
})

// ─── 3. Adapters ────────────────────────────────────────

describe('Adapter: string', () => {
	it('re-exports toSvg from core', async () => {
		const { toSvg } = await import(resolve(ROOT, 'src/adapters/string.js'))
		assert.equal(typeof toSvg, 'function')
	})
})

describe('Adapter: cli', () => {
	it('iconChar returns unicode for known icons', async () => {
		const { iconChar } = await import(resolve(ROOT, 'src/adapters/cli.js'))
		assert.equal(iconChar({ _name: 'BsBank2' }), '🏦')
	})

	it('iconChar returns fallback for unknown icons', async () => {
		const { iconChar } = await import(resolve(ROOT, 'src/adapters/cli.js'))
		assert.equal(iconChar({}), '●')
	})
})

// Note: Lit and React adapters require their respective runtimes,
// so we test that the modules exist and export functions
describe('Adapter: lit (module structure)', () => {
	it('lit.js file exists', () => {
		assert.ok(existsSync(resolve(ROOT, 'src/adapters/lit.js')))
	})
})

describe('Adapter: react (module structure)', () => {
	it('react.js exports Icon and reactIcon', async () => {
		// Dynamic import to check exports without requiring react
		const source = (await import('node:fs')).readFileSync(
			resolve(ROOT, 'src/adapters/react.js'),
			'utf-8',
		)
		assert.ok(source.includes('export function Icon'))
		assert.ok(source.includes('export function reactIcon'))
	})
})

// ─── 4. Package exports map ─────────────────────────────

describe('Package exports', () => {
	it('package.json has correct exports map', async () => {
		const pkg = JSON.parse(
			(await import('node:fs')).readFileSync(resolve(ROOT, 'package.json'), 'utf-8'),
		)
		assert.ok(pkg.exports['.'], 'missing root export')
		assert.ok(pkg.exports['./bs'], 'missing bs export')
		assert.ok(pkg.exports['./adapters/lit'], 'missing lit adapter export')
		assert.ok(pkg.exports['./adapters/react'], 'missing react adapter export')
		assert.ok(pkg.exports['./adapters/string'], 'missing string adapter export')
		assert.ok(pkg.exports['./adapters/cli'], 'missing cli adapter export')
	})
})

// ─── 5. Sandboxes ───────────────────────────────────────

describe('Sandboxes', () => {
	it('play/ui-cli sandbox exists', () => {
		assert.ok(existsSync(resolve(ROOT, 'play/ui-cli/index.js')))
	})

	it('play/ui-lit sandbox exists', () => {
		assert.ok(existsSync(resolve(ROOT, 'play/ui-lit/index.html')))
	})

	it('play/ui-react sandbox exists', () => {
		assert.ok(existsSync(resolve(ROOT, 'play/ui-react/index.html')))
	})
})

// ─── 6. Package Hygiene ─────────────────────────────────

describe('Package Hygiene', () => {
	it('.npmignore exists', () => {
		assert.ok(existsSync(resolve(ROOT, '.npmignore')))
	})

	it('knip.json exists', () => {
		assert.ok(existsSync(resolve(ROOT, 'knip.json')))
	})

	it('package.json has test:all script', async () => {
		const pkg = JSON.parse(
			(await import('node:fs')).readFileSync(resolve(ROOT, 'package.json'), 'utf-8'),
		)
		assert.ok(pkg.scripts['test:all'], 'missing test:all script')
		assert.ok(pkg.scripts.knip, 'missing knip script')
		assert.ok(pkg.scripts.audit, 'missing audit script')
		assert.ok(pkg.scripts['release:spec'], 'missing release:spec script')
	})

	it('version is 1.0.0', async () => {
		const pkg = JSON.parse(
			(await import('node:fs')).readFileSync(resolve(ROOT, 'package.json'), 'utf-8'),
		)
		assert.equal(pkg.version, '1.0.0')
	})
})
