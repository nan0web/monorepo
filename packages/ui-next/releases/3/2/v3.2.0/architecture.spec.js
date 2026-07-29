import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as index from '../../../../src/index.js';

describe('OLMUI Next.js Adapter Architecture Tests (v3.2.0)', () => {
    it('should export NextUiRoot for routing mapping', () => {
        assert.ok(index.NextUiRoot, 'NextUiRoot is missing');
    });

    it('should export ServerElement for SSG rendering', () => {
        assert.ok(index.ServerElement, 'ServerElement is missing');
    });

    it('should export ClientAppLoader for interactive islands', () => {
        assert.ok(index.ClientAppLoader, 'ClientAppLoader is missing');
    });

    it('should export Sandbox layout or component', () => {
        // Will be used for the sandbox editor preview
        assert.ok(index.Sandbox, 'Sandbox is missing');
    });
});
