import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { server } from '../ui/mcp.js';
import path from 'node:path';

describe('MCP Server User Stories (Scenarios)', () => {
    let client;
    let clientTransport;
    let serverTransport;

    before(async () => {
        const transports = InMemoryTransport.createLinkedPair();
        clientTransport = transports[0];
        serverTransport = transports[1];

        await server.connect(serverTransport);
        
        client = new Client(
            { name: 'test-client', version: '1.0.0' },
            { capabilities: {} }
        );
        await client.connect(clientTransport);
    });

    after(async () => {
        // await client.close();
        // await server.close();
    });

    it('should list all available tools', async () => {
        const { tools } = await client.listTools();
        const toolNames = tools.map(t => t.name);
        
        assert.ok(toolNames.includes('inspect_architecture'));
        assert.ok(toolNames.includes('inspect_domain'));
        assert.ok(toolNames.includes('inspect_hygiene'));
        assert.ok(toolNames.includes('inspect_phase'));
    });

    const scenarios = [
        { name: 'Seed Phase', dir: 'test_seed' },
        { name: 'Design Phase', dir: 'test_design' },
        { name: 'Stable Phase', dir: 'test_stable' },
        { name: 'Production Phase', dir: 'test_prod' },
        { name: 'UI Next Sandbox', dir: '../ui-next' }
    ];

    for (const scenario of scenarios) {
        describe(`User Story: ${scenario.name} Directory`, () => {
            it('inspect_phase should analyze the project phase', async () => {
                const result = await client.callTool({
                    name: 'inspect_phase',
                    arguments: { dir: scenario.dir }
                });
                
                assert.ok(result.content.length > 0);
                assert.strictEqual(result.content[0].type, 'text');
                
                const parsed = JSON.parse(result.content[0].text);
                assert.ok('success' in parsed);
                assert.ok(Array.isArray(parsed.logs));
            });

            it('inspect_hygiene should analyze package hygiene', async () => {
                const result = await client.callTool({
                    name: 'inspect_hygiene',
                    arguments: { dir: scenario.dir }
                });
                
                const parsed = JSON.parse(result.content[0].text);
                assert.ok('success' in parsed);
            });
            
            it('inspect_architecture should analyze Model-as-Schema compliance', async () => {
                const result = await client.callTool({
                    name: 'inspect_architecture',
                    arguments: { dir: scenario.dir }
                });
                
                const parsed = JSON.parse(result.content[0].text);
                assert.ok('success' in parsed);
            });
        });
    }
});
