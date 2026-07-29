import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runGenerator } from '@nan0web/ui';
import { DEMO_MAP } from './scenarios.js';

describe('Sandbox Scenarios', () => {
    it('demoLogin should yield show, ask, show', async () => {
        const gen = DEMO_MAP.login();
        let intents = [];
        
        const handlers = {
            ask: async (intent) => {
                intents.push(intent.type);
                assert.strictEqual(intent.schema.username.type, 'string');
                return { value: { username: 'test@example.com' } };
            },
            show: async (intent) => {
                intents.push(intent.type);
            }
        };

        const result = await runGenerator(gen, handlers);
        assert.deepStrictEqual(intents, ['show', 'ask', 'show']);
        assert.strictEqual(result.username, 'test@example.com');
    });

    it('demoError should yield a single error show intent', async () => {
        const gen = DEMO_MAP.error();
        let intents = [];
        
        const handlers = {
            ask: async () => ({ value: null }),
            show: async (intent) => {
                intents.push(intent);
            }
        };

        await runGenerator(gen, handlers);
        assert.strictEqual(intents.length, 1);
        assert.strictEqual(intents[0].level, 'error');
        assert.strictEqual(intents[0].type, 'show');
    });

    it('demoProgress should yield multiple progress intents and finish with show', async () => {
        const gen = DEMO_MAP.progress();
        let intents = [];
        
        const handlers = {
            ask: async () => ({ value: null }),
            progress: async (intent) => {
                intents.push(intent);
            },
            show: async (intent) => {
                intents.push(intent);
            }
        };

        await runGenerator(gen, handlers);
        
        assert.strictEqual(intents.length, 4); // 3 progress, 1 show
        assert.strictEqual(intents[0].type, 'progress');
        assert.strictEqual(intents[0].value, 10);
        
        assert.strictEqual(intents[1].type, 'progress');
        assert.strictEqual(intents[1].value, 42);
        
        assert.strictEqual(intents[2].type, 'progress');
        assert.strictEqual(intents[2].value, 100);
        
        assert.strictEqual(intents[3].type, 'show');
        assert.strictEqual(intents[3].level, 'success');
    });

    it('demoComplex should yield ask and show for nested model', async () => {
        const gen = DEMO_MAP.complex();
        let intents = [];
        
        const handlers = {
            ask: async (intent) => {
                intents.push(intent);
                return { value: { fullName: 'Jane Doe', role: 'Admin', notifications: true, address: { city: 'Kyiv' } } };
            },
            show: async (intent) => {
                intents.push(intent);
            }
        };

        await runGenerator(gen, handlers);
        
        assert.strictEqual(intents.length, 2);
        assert.strictEqual(intents[0].type, 'ask');
        assert.strictEqual(intents[0].schema.fullName.type, 'string');
        assert.strictEqual(intents[1].type, 'show');
        assert.ok(intents[1].message.includes('Jane Doe'));
        assert.ok(intents[1].message.includes('Admin'));
    });

    it('demoComponents should yield a render intent', async () => {
        const gen = DEMO_MAP.components();
        let intents = [];
        
        const handlers = {
            ask: async () => ({ value: null }),
            render: async (intent) => {
                intents.push(intent);
            }
        };

        await runGenerator(gen, handlers);
        
        assert.strictEqual(intents.length, 1);
        assert.strictEqual(intents[0].type, 'render');
        assert.strictEqual(intents[0].component, 'all_elements');
    });
});
