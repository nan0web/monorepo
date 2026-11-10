import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { FastApiDiscovery } from '../../../../src/domain/ast/FastApiDiscovery.js'
import { FastApiApp } from '../../../../src/domain/app/FastApiApp.js'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'

/**
 * @param {AsyncGenerator<any, any, any>} gen
 * @returns {Promise<{ intents: any[], result: any }>}
 */
async function drainGenerator(gen) {
  const intents = []
  let next = await gen.next()
  while (!next.done) {
    intents.push(next.value)
    next = await gen.next()
  }
  return { intents, result: next.value }
}

describe('v3.9.0: Fast API Discovery (AST Contractor)', () => {
  it('should parse a d.ts file and extract class signatures without implementation', async () => {
    const sampleDts = `
      /** Auditor model description */
      export class AuditorModel {
        static alias: string;
        /** Initializes auditor */
        async init(): Promise<void>;
        fileExists(rel: string): Promise<boolean>;
      }
    `
    const discovery = new FastApiDiscovery()
    const result = discovery.extractFromSource(sampleDts, { fileName: 'AuditorModel.d.ts' })

    assert.ok(result.exports.AuditorModel, 'Should contain AuditorModel export')
    assert.equal(result.exports.AuditorModel.description, 'Auditor model description')
    assert.ok(result.exports.AuditorModel.methods.find(m => m.name === 'init' && m.isAsync))
  })

  it('should filter by level and only options', async () => {
    const sampleDts = `
      export class TestService {
        static config: object;
        async fetchData(): Promise<string>;
        syncHelper(): void;
      }
    `
    const discovery = new FastApiDiscovery()
    
    // Test --only async
    const asyncOnly = discovery.extractFromSource(sampleDts, { only: 'async' })
    const methods = asyncOnly.exports.TestService.methods
    assert.equal(methods.length, 1)
    assert.equal(methods[0].name, 'fetchData')

    // Test --only static
    const staticOnly = discovery.extractFromSource(sampleDts, { only: 'static' })
    assert.equal(staticOnly.exports.TestService.fields.length, 1)
    assert.equal(staticOnly.exports.TestService.fields[0].name, 'config')
    assert.equal(staticOnly.exports.TestService.methods.length, 0)

    // Test --level classes
    const classesOnly = discovery.extractFromSource(sampleDts, { level: 'classes' })
    assert.equal(classesOnly.exports.TestService.methods, undefined)
    assert.equal(classesOnly.exports.TestService.fields, undefined)

    // Test --level methods
    const methodsOnly = discovery.extractFromSource(sampleDts, { level: 'methods' })
    assert.ok(methodsOnly.exports.TestService.methods.length > 0)
    assert.equal(methodsOnly.exports.TestService.fields, undefined)
  })

  it('should extract dependencies when --include-deps is enabled', async () => {
    const sampleDts = `
      import type { Model } from '@nan0web/types'
      import { DB } from '@nan0web/db'

      export class RepoService {
        db: DB;
        getModel(): Model;
      }
    `
    const discovery = new FastApiDiscovery()
    const result = discovery.extractFromSource(sampleDts, { includeDeps: true })

    assert.ok(result.deps, 'Should include dependencies list')
    assert.ok(result.deps.includes('@nan0web/types'))
    assert.ok(result.deps.includes('@nan0web/db'))
  })

  it('should format output as concise Nano/YAML outline', async () => {
    const sampleDts = `
      export class MiniModel {
        /** Name of model */
        name: string;
        /** Save data */
        async save(): Promise<void>;
      }
    `
    const discovery = new FastApiDiscovery()
    const outline = discovery.stringify(discovery.extractFromSource(sampleDts))

    assert.match(outline, /MiniModel:/)
    assert.match(outline, /save\(\):/)
  })

  it('should extract API from file using DB in FastApiDiscovery.extractFromFile', async () => {
    const sampleDts = `
      export class FileModel {
        path: string;
      }
    `
    const db = new DB({
      predefined: [['types/FileModel.d.ts', sampleDts]],
    })
    await db.connect()

    const discovery = new FastApiDiscovery({ db })
    const result = await discovery.extractFromFile('types/FileModel.d.ts')

    assert.ok(result.exports.FileModel)
    assert.equal(result.exports.FileModel.fields[0].name, 'path')
  })

  it('should run FastApiApp subcommand and integrate with InspectorApp', async () => {
    const sampleDts = `
      export class CliModel {
        version: string;
        run(): void;
      }
    `
    const db = new DB({
      predefined: [['types/CliModel.d.ts', sampleDts]],
    })
    await db.connect()

    // Test FastApiApp standalone
    const apiApp = new FastApiApp(
      { path: 'types/CliModel.d.ts', level: 'all', format: 'nano' },
      { db }
    )
    const res = await drainGenerator(apiApp.run())
    assert.equal(res.result.data.ok, true)
    assert.match(res.result.data.outline, /CliModel:/)

    // Test InspectorApp with 'api' subcommand
    const inspector = new InspectorApp(
      { command: 'api', dir: 'types/CliModel.d.ts' },
      { db }
    )
    const inspRes = await drainGenerator(inspector.run())
    assert.equal(inspRes.result.data.ok, true)
    assert.ok(inspRes.result.data.outline)
  })
})
