import { describe, it } from 'node:test'
import assert from 'node:assert'

import DBFS from '@nan0web/db-fs'

import { StrictBoundaryInterpreter } from '../src/utils/StrictBoundaryInterpreter.js'

describe('StrictBoundaryInterpreter', () => {
	it('should parse simple boundary', async () => {
		const db = new DBFS({ root: 'test' })
		const source = await db.loadDocumentAs('.txt', 'boundary-response-with-error.md')
		const result = StrictBoundaryInterpreter.parse(source)
		const expect = [
			['@get', undefined, undefined],
			['apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixStep.spec.nan0', undefined, undefined],
			[
				'apps/3rdparty/eaukraine.eu/src/domain/matrices/LogicMatrixStep.spec.nan0',
				undefined,
				undefined,
			],
			[
				'apps/3rdparty/eaukraine.eu/src/domain/matrices/IntentMatrixStep.spec.nan0',
				undefined,
				undefined,
			],
			[
				'apps/3rdparty/eaukraine.eu/src/domain/matrices/InterestsMatrixStep.spec.nan0',
				undefined,
				undefined,
			],
			[
				'apps/3rdparty/eaukraine.eu/src/domain/matrices/ThinkersMatrixStep.spec.nan0',
				undefined,
				undefined,
			],
			[
				'apps/3rdparty/eaukraine.eu/src/domain/matrices/MatrixSteps.spec.test.js',
				undefined,
				undefined,
			],
			['apps/3rdparty/eaukraine.eu/src/domain/matrices/index.js', undefined, undefined],
			['@validate', undefined, undefined],
		]
		const a = result.files.map((r) => [r.filename, r.startLine, r.lineCount])
		assert.deepStrictEqual(a, expect)
	})
})
