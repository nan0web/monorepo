import { describe, it } from 'node:test'
import assert from 'node:assert'
import { BuildWorkflowsApp } from './BuildWorkflowsApp.js'
import { DBFS } from '@nan0web/db-fs'
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('BuildWorkflowsApp', () => {
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
      - "docs/en/workflows/test.md"
      - "docs/pl/workflows/test.md"
      - "docs/de/workflows/test.md"
`
			await writeFile(path.join(pkgDir, 'nan0web.nan0'), nan0Config, 'utf8')

			const langs = ['uk', 'en', 'pl', 'de']
			for (const lang of langs) {
				const wfDir = path.join(pkgDir, 'docs', lang, 'workflows')
				await mkdir(wfDir, { recursive: true })
				const langLine = lang === 'pl' ? '' : `lang: "${lang}"\n`
				const wfMd = `---
id: "test-wf-${lang}"
name: "Test Workflow ${lang}"
${langLine}anchors:
  - "src/domain/Model.js"
inspectors:
  - "prop-welder"
---
# Workflow description`
				await writeFile(path.join(wfDir, 'test.md'), wfMd, 'utf8')
			}

			const db = new DBFS({ cwd: tempRoot, root: '' })
			const res = await BuildWorkflowsApp.execute({ dir: tempRoot }, { db })
			assert.strictEqual(res.ok, true)
			assert.deepStrictEqual(res.counts, { uk: 1, en: 1, pl: 1, de: 1 })
			assert.strictEqual(res.ukCount, 1)
			assert.strictEqual(res.enCount, 1)

			// Read compiled manifests for all languages
			for (const lang of langs) {
				const manifestPath = path.join(tempRoot, '.llimo', `workflows_manifest.${lang}.json`)
				const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

				assert.strictEqual(manifest.length, 1)
				assert.strictEqual(manifest[0].id, `test-wf-${lang}`)
				assert.strictEqual(manifest[0].name, `Test Workflow ${lang}`)
				assert.strictEqual(manifest[0].file, `packages/ui/docs/${lang}/workflows/test.md`)
				assert.deepStrictEqual(manifest[0].anchors, ['packages/ui/src/domain/Model.js'])
				assert.deepStrictEqual(manifest[0].inspectors, ['prop-welder'])
			}

			// Cleanup
			await rm(tempRoot, { recursive: true, force: true })
		})
	})
})
