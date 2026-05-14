import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

/** Walk up from current dir to find the package root (where package.json has name @nan0web/types) */
function findPkgRoot(dir) {
	const pkgPath = resolve(dir, 'package.json')
	if (existsSync(pkgPath)) {
		try {
			const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
			if (pkg.name === '@nan0web/types') return dir
		} catch {}
	}
	const parent = dirname(dir)
	if (parent === dir) throw new Error('Could not find @nan0web/types root')
	return findPkgRoot(parent)
}

const PKG_ROOT = findPkgRoot(import.meta.dirname)
const VSCODE_DIR = resolve(PKG_ROOT, 'src/ui/vscode')

describe('Release v1.6.0 — VS Code Extension & Documentation', () => {
	// ─── 1. Extension Structure ──────────────────────────────────────
	describe('Extension file structure', () => {
		it('index.js entry point exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'index.js')))
		})

		it('esbuild.config.js exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'esbuild.config.js')))
		})

		it('language-configuration.json exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'language-configuration.json')))
		})

		it('TextMate grammar exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'syntaxes/nan0.tmLanguage.json')))
		})

		it('logo.png exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'logo.png')))
		})

		it('README.md exists for Marketplace', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'README.md')))
		})

		it('LICENSE exists', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'LICENSE')))
		})
	})

	// ─── 2. Extension package.json Manifest ──────────────────────────
	describe('Extension package.json manifest', () => {
		const pkg = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'package.json'), 'utf-8'))

		it('has correct name', () => {
			assert.equal(pkg.name, 'nan0-vscode')
		})

		it('has vscode engine constraint', () => {
			assert.ok(pkg.engines?.vscode)
		})

		it('has icon field', () => {
			assert.equal(pkg.icon, 'logo.png')
		})

		it('has repository field', () => {
			assert.ok(pkg.repository?.url)
		})

		it('has files array for clean VSIX', () => {
			assert.ok(Array.isArray(pkg.files))
			assert.ok(pkg.files.includes('dist/extension.js'))
			assert.ok(pkg.files.includes('LICENSE'))
			assert.ok(pkg.files.includes('logo.png'))
		})

		it('registers "nan0" language with .nan0 and .n0 extensions', () => {
			const lang = pkg.contributes?.languages?.[0]
			assert.ok(lang)
			assert.equal(lang.id, 'nan0')
			assert.ok(lang.extensions.includes('.nan0'))
			assert.ok(lang.extensions.includes('.n0'))
		})

		it('registers TextMate grammar for nan0', () => {
			const grammar = pkg.contributes?.grammars?.[0]
			assert.ok(grammar)
			assert.equal(grammar.language, 'nan0')
			assert.equal(grammar.scopeName, 'source.nan0')
		})

		it('main points to bundled dist/extension.js', () => {
			assert.equal(pkg.main, './dist/extension.js')
		})

		it('has build and package scripts', () => {
			assert.ok(pkg.scripts?.build)
			assert.ok(pkg.scripts?.package)
		})
	})

	// ─── 3. TextMate Grammar Coverage ────────────────────────────────
	describe('TextMate grammar covers all NaN0 types', () => {
		const grammar = JSON.parse(
			readFileSync(resolve(VSCODE_DIR, 'syntaxes/nan0.tmLanguage.json'), 'utf-8'),
		)

		it('has scopeName "source.nan0"', () => {
			assert.equal(grammar.scopeName, 'source.nan0')
		})

		it('defines comment scope', () => {
			const repo = grammar.repository
			assert.ok(repo.comment)
		})

		it('defines key-value scope', () => {
			assert.ok(grammar.repository['key-value'])
		})

		it('defines array-item scope', () => {
			assert.ok(grammar.repository['array-item'])
		})

		it('defines value patterns (boolean, null, date, number, string, multiline)', () => {
			const value = grammar.repository.value
			assert.ok(value)
			const patterns = value.patterns
			const names = patterns.map((p) => p.name || p.captures?.['2']?.name).filter(Boolean)
			assert.ok(names.some((n) => n.includes('boolean')), 'missing boolean')
			assert.ok(names.some((n) => n.includes('null')), 'missing null')
			assert.ok(names.some((n) => n.includes('date')), 'missing date')
			assert.ok(names.some((n) => n.includes('numeric')), 'missing numeric')
			assert.ok(names.some((n) => n.includes('multiline')), 'missing multiline')
		})

		it('defines empty-collection scope', () => {
			assert.ok(grammar.repository['empty-collection'])
		})
	})

	// ─── 4. Formatter Logic ──────────────────────────────────────────
	describe('Formatter uses NaN0.parse + NaN0.stringify', () => {
		it('index.js imports NaN0 and exports activate/deactivate', () => {
			const code = readFileSync(resolve(VSCODE_DIR, 'index.js'), 'utf-8')
			assert.ok(code.includes('NaN0'), 'must import NaN0')
			assert.ok(code.includes('export function activate'), 'must export activate')
			assert.ok(code.includes('export function deactivate'), 'must export deactivate')
		})

		it('formatter calls NaN0.parse and NaN0.stringify', () => {
			const code = readFileSync(resolve(VSCODE_DIR, 'index.js'), 'utf-8')
			assert.ok(code.includes('NaN0.parse'), 'must call NaN0.parse')
			assert.ok(code.includes('NaN0.stringify'), 'must call NaN0.stringify')
		})

		it('formatter catches errors and shows them to user', () => {
			const code = readFileSync(resolve(VSCODE_DIR, 'index.js'), 'utf-8')
			assert.ok(code.includes('catch'), 'must have error handling')
			assert.ok(code.includes('showErrorMessage'), 'must display errors')
		})
	})

	// ─── 5. NPM Isolation ────────────────────────────────────────────
	describe('NPM isolation', () => {
		it('@nan0web/types package.json excludes src/ui/vscode/** from files', () => {
			const rootPkg = JSON.parse(
				readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf-8'),
			)
			assert.ok(rootPkg.files.includes('!src/ui/vscode/**'))
		})
	})

	// ─── 6. Documentation ───────────────────────────────────────────
	describe('Documentation updates', () => {
		it('README.md contains Table of Contents', () => {
			const readme = readFileSync(resolve(PKG_ROOT, 'README.md'), 'utf-8')
			assert.ok(readme.includes('Table of Contents'))
		})

		it('README.md contains VS Code Extension section', () => {
			const readme = readFileSync(resolve(PKG_ROOT, 'README.md'), 'utf-8')
			assert.ok(readme.includes('VS Code Extension'))
		})

		it('docs/uk/README.md contains "Розширення VS Code" section', () => {
			const ukReadme = readFileSync(
				resolve(PKG_ROOT, 'docs/uk/README.md'),
				'utf-8',
			)
			assert.ok(ukReadme.includes('Розширення VS Code'))
		})

		it('extension README.md describes features', () => {
			const extReadme = readFileSync(resolve(VSCODE_DIR, 'README.md'), 'utf-8')
			assert.ok(extReadme.includes('Syntax Highlighting'))
			assert.ok(extReadme.includes('Format Normalization'))
		})
	})

	// ─── 7. Build Artifact ───────────────────────────────────────────
	describe('Build artifact', () => {
		it('dist/extension.js exists (must run npm run build first)', () => {
			assert.ok(existsSync(resolve(VSCODE_DIR, 'dist/extension.js')))
		})
	})
})
