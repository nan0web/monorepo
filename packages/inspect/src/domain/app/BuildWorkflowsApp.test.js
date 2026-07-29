import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseFrontMatter, parseNan0Config, BuildWorkflowsApp } from './BuildWorkflowsApp.js'
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('BuildWorkflowsApp', () => {
	describe('parseFrontMatter', () => {
		it('should parse standard FrontMatter', () => {
			const md = `---
id: "test-workflow"
name: "Test Workflow"
lang: "uk"
tags: ["ui", "test"]
anchors:
  - "src/domain/Model.js"
  - "src/domain/App.js"
inspectors:
  - "prop-welder"
---
# Content`

			const metadata = parseFrontMatter(md)
			assert.deepStrictEqual(metadata, {
				id: 'test-workflow',
				name: 'Test Workflow',
				lang: 'uk',
				tags: ['ui', 'test'],
				anchors: ['src/domain/Model.js', 'src/domain/App.js'],
				inspectors: ['prop-welder'],
			})
		})

		it('should parse FrontMatter with bracket arrays', () => {
			const md = `---
id: test-workflow
tags: [ui, test]
---`
			const metadata = parseFrontMatter(md)
			assert.deepStrictEqual(metadata, {
				id: 'test-workflow',
				tags: ['ui', 'test'],
			})
		})
	})

	describe('parseNan0Config', () => {
		it('should parse nan0web.nan0 structure', () => {
			const yaml = `name: "@nan0web/ui"
agents:
  - id: 'adapter-architect'
    description: 'UI Adapter Creation (Step 4)'
    workflows:
      - 'src/agents/workflows/pipeline-no4-adapter.md'
    inspectors:
      - 'src/agents/inspectors/prop-welder.md'`

			const config = parseNan0Config(yaml)
			assert.strictEqual(config.name, '@nan0web/ui')
			assert.strictEqual(config.agents.length, 1)
			assert.strictEqual(config.agents[0].id, 'adapter-architect')
			assert.strictEqual(config.agents[0].description, 'UI Adapter Creation (Step 4)')
			assert.deepStrictEqual(config.agents[0].workflows, ['src/agents/workflows/pipeline-no4-adapter.md'])
			assert.deepStrictEqual(config.agents[0].inspectors, ['src/agents/inspectors/prop-welder.md'])
		})
	})

	describe('Compilation integration', () => {
		it('should compile configurations into manifests', async () => {
			const tempRoot = await mkdtemp(path.join(tmpdir(), 'nan0web-test-'))
			
			// Setup package folder packages/ui
			const pkgDir = path.join(tempRoot, 'packages', 'ui')
			await mkdir(pkgDir, { recursive: true })

			const nan0Config = `name: "@nan0web/ui"
agents:
  - id: "ui-architect"
    workflows:
      - "docs/uk/workflows/test.md"
`
			await writeFile(path.join(pkgDir, 'nan0web.nan0'), nan0Config, 'utf8')

			const wfDir = path.join(pkgDir, 'docs', 'uk', 'workflows')
			await mkdir(wfDir, { recursive: true })

			const wfMd = `---
id: "test-wf"
name: "Test Workflow"
lang: "uk"
anchors:
  - "src/domain/Model.js"
inspectors:
  - "prop-welder"
---
# Workflow description`
			await writeFile(path.join(wfDir, 'test.md'), wfMd, 'utf8')

			const res = await BuildWorkflowsApp.execute({ dir: tempRoot }, {})
			assert.strictEqual(res.ok, true)
			assert.strictEqual(res.ukCount, 1)
			assert.strictEqual(res.enCount, 0)

			// Read compiled manifest
			const ukManifestPath = path.join(tempRoot, '.llimo', 'workflows_manifest.uk.json')
			const ukManifest = JSON.parse(await readFile(ukManifestPath, 'utf8'))

			assert.strictEqual(ukManifest.length, 1)
			assert.strictEqual(ukManifest[0].id, 'test-wf')
			assert.strictEqual(ukManifest[0].name, 'Test Workflow')
			assert.strictEqual(ukManifest[0].file, 'packages/ui/docs/uk/workflows/test.md')
			assert.deepStrictEqual(ukManifest[0].anchors, ['packages/ui/src/domain/Model.js'])
			assert.deepStrictEqual(ukManifest[0].inspectors, ['prop-welder'])

			// Cleanup
			await rm(tempRoot, { recursive: true, force: true })
		})
	})
})
