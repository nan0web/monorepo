import { describe, it } from 'node:test';
import assert from 'node:assert';

export default function render() {
    return `
# @nan0web/ui-next

Next.js / React Adapter for the NaN0Web OLMUI ecosystem.

## Overview
This package provides a strict Zero-Hallucination Web Sandbox and UI Adapter using the OLMUI architectural patterns. It translates generator-based intents into fully interactive React interfaces.

## Features
- **OlmuiAdapter**: The master component that renders \`ask\`, \`show\`, \`progress\`, and \`render\` intents without hardcoded texts.
- **useOlmuiGenerator**: A React hook for running OLMUI models.
- **Playground (Web Sandbox)**: Isolated environment to verify Model-as-Schema scenarios.
`;
}

describe('ProvenDoc Verification', () => {
    it('should generate valid markdown', () => {
        const md = render();
        assert.ok(md.includes('# @nan0web/ui-next'));
        assert.ok(md.includes('OlmuiAdapter'));
    });
});
