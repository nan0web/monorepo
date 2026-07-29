import { describe, it } from 'node:test';
import assert from 'node:assert';
import { useOlmuiGenerator } from '../../../../src/hooks/useOlmuiGenerator.js';
// Node test doesn't natively support react hooks testing without a renderer.
// But we can test the generator conceptually if we extract the logic, 
// or test using React test renderer if it's available. 
// For now we assert the structure.
// In actual task.spec.js we verify the API structure and exports.
import * as index from '../../../../src/index.js';

describe('OLMUI Next.js Adapter Contract Tests', () => {
    it('should export all required components and hooks', () => {
        assert.ok(index.useOlmuiGenerator, 'useOlmuiGenerator is missing');
        assert.ok(index.OlmuiAdapter, 'OlmuiAdapter is missing');
        assert.ok(index.OlmuiForm, 'OlmuiForm is missing');
        assert.ok(index.OlmuiShow, 'OlmuiShow is missing');
        assert.ok(index.OlmuiProgress, 'OlmuiProgress is missing');
    });
});
