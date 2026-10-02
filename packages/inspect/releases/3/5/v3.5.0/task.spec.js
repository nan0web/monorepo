import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { JsHygieneAuditor } from '../../../../src/domain/app/js/JsHygieneAuditor.js'
import { JsExportAuditor } from '../../../../src/domain/app/js/JsExportAuditor.js'

/**
 * @param {AsyncGenerator} gen
 * @returns {Promise<{intents: object[], result: object}>}
 */
async function drainGenerator(gen) {
	const intents = []
	let last = null
	while (true) {
		const step = await gen.next()
		if (step.done) {
			last = step.value
			break
		}
		intents.push(step.value)
	}
	return { intents, result: last }
}

const minScripts = {
	test: 'node --test',
	'test:all': 'npm run test && npm run build && npm run knip',
	build: 'tsc',
	knip: 'knip --production',
	play: 'node play/main.js',
	'test:docs': 'node --test src/README.md.js',
	'test:release': 'node --test src/test/releases/**/*.test.js',
	'release:spec': 'node --test releases/**/*.spec.js',
	'test:coverage': 'c8 node --test',
	prebuild: 'rm -rf dist types',
}

describe('Release v3.5.0: Standardized TSConfig Profiles & Zero-Hallucination Package Auditors', () => {
	describe('§1 Result Intent Contract & Profile Detection', () => {
		it('detects node profile by default and returns ok: true', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: '@nan0web/node-pkg',
							scripts: minScripts,
							files: ['src/**/*.js', 'types/**/*.d.ts', '!src/**/*.spec.js'],
							devDependencies: {
								typescript: 'latest',
								knip: 'latest',
								c8: 'latest',
							},
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								target: 'esnext',
								module: 'nodenext',
								moduleResolution: 'nodenext',
								lib: ['esnext'],
								declaration: true,
								emitDeclarationOnly: true,
								outDir: './types',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.type, 'result')
			assert.equal(result.data.ok, true)
			assert.equal(result.data.success, true)
			assert.equal(result.data.profile, 'node')
			assert.equal(result.data.errors.length, 0)
		})

		it('detects react profile and validates compilerOptions (jsx, moduleResolution: bundler)', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: '@nan0web/react-pkg',
							dependencies: { react: '^18.0.0' },
							scripts: minScripts,
							files: ['src/**/*.js', 'types/**/*.d.ts'],
							devDependencies: {
								typescript: 'latest',
								knip: 'latest',
								c8: 'latest',
							},
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								target: 'esnext',
								module: 'esnext',
								moduleResolution: 'bundler',
								lib: ['dom', 'dom.iterable', 'esnext'],
								jsx: 'react-jsx',
								declaration: true,
								emitDeclarationOnly: true,
								outDir: './types',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, true)
			assert.equal(result.data.profile, 'react')
		})

		it('detects lit profile and validates dom lib without jsx', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: '@nan0web/lit-pkg',
							dependencies: { lit: '^3.0.0' },
							scripts: minScripts,
							files: ['src/**/*.js', 'types/**/*.d.ts'],
							devDependencies: {
								typescript: 'latest',
								knip: 'latest',
								c8: 'latest',
							},
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								target: 'esnext',
								module: 'esnext',
								moduleResolution: 'bundler',
								lib: ['esnext', 'dom', 'dom.iterable'],
								declaration: true,
								emitDeclarationOnly: true,
								outDir: './types',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, true)
			assert.equal(result.data.profile, 'lit')
		})
	})

	describe('§2 JsHygieneAuditor: tsconfig validation & auto-fix', () => {
		it('detects and reports incorrect tsconfig declaration flags', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'bad-tsconfig',
							scripts: minScripts,
							devDependencies: { typescript: 'latest', knip: 'latest', c8: 'latest' },
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								target: 'esnext',
								// missing declaration, emitDeclarationOnly, outDir
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, false)
			assert.ok(result.data.errors.some((e) => e.check === 'tsconfig.compilerOptions.declaration'))
			assert.ok(result.data.errors.some((e) => e.check === 'tsconfig.compilerOptions.emitDeclarationOnly'))
			assert.ok(result.data.errors.some((e) => e.check === 'tsconfig.compilerOptions.outDir'))
		})

		it('auto-fixes missing tsconfig compilerOptions when fix: true is set', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'fix-tsconfig',
							scripts: minScripts,
							devDependencies: { typescript: 'latest', knip: 'latest', c8: 'latest' },
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								target: 'esnext',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db, fix: true, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, true)
			const updatedTsconfig = await db.loadDocument('tsconfig.json')
			assert.equal(updatedTsconfig.compilerOptions.declaration, true)
			assert.equal(updatedTsconfig.compilerOptions.emitDeclarationOnly, true)
			assert.equal(updatedTsconfig.compilerOptions.outDir, './types')
		})
	})

	describe('§3 package.json#files hygiene audit', () => {
		it('detects missing types and unexcluded test files in package.json files array', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'bad-files',
							scripts: minScripts,
							files: ['src/**/*.js', 'src/**/*.test.js'], // missing types, includes tests
							devDependencies: { typescript: 'latest', knip: 'latest', c8: 'latest' },
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								declaration: true,
								emitDeclarationOnly: true,
								outDir: './types',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, false)
			assert.ok(result.data.errors.some((e) => e.check === 'package.json#files.types'))
			assert.ok(result.data.errors.some((e) => e.check === 'package.json#files.tests'))
		})

		it('auto-fixes package.json#files when fix: true is set', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'fix-files',
							scripts: minScripts,
							files: ['src/**/*.js', 'src/**/*.test.js'],
							devDependencies: { typescript: 'latest', knip: 'latest', c8: 'latest' },
						},
					],
					[
						'tsconfig.json',
						{
							compilerOptions: {
								declaration: true,
								emitDeclarationOnly: true,
								outDir: './types',
							},
						},
					],
					['knip.json', {}],
				],
			})
			await db.connect()

			const auditor = new JsHygieneAuditor({ dir: '.' }, { db, fix: true, t: (k) => k })
			await drainGenerator(auditor.run())

			const updatedPkg = await db.loadDocument('package.json')
			assert.ok(updatedPkg.files.includes('types/**/*.d.ts'))
			assert.ok(!updatedPkg.files.includes('src/**/*.test.js'))
		})
	})

	describe('§4 JsExportAuditor: subpath types verification', () => {
		it('detects missing types in package.json exports', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'test-exports',
							exports: {
								'.': './src/index.js', // missing types
								'./feature': {
									import: './src/feature.js', // missing types
								},
							},
						},
					],
					['src/index.js', 'export const a = 1'],
				],
			})
			await db.connect()

			const auditor = new JsExportAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, false)
			assert.ok(result.data.errors.some((e) => e.check === 'exports["."].types'))
			assert.ok(result.data.errors.some((e) => e.check === 'exports["./feature"].types'))
		})

		it('passes when each export subpath has types and import', async () => {
			const db = new DB({
				predefined: [
					[
						'package.json',
						{
							name: 'valid-exports',
							exports: {
								'.': {
									types: './types/index.d.ts',
									import: './src/index.js',
								},
								'./feature': {
									types: './types/feature.d.ts',
									import: './src/feature.js',
								},
							},
						},
					],
					['src/index.js', 'export const a = 1'],
				],
			})
			await db.connect()

			const auditor = new JsExportAuditor({ dir: '.' }, { db })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.ok, true)
			assert.equal(result.data.errors.length, 0)
		})
	})
})
