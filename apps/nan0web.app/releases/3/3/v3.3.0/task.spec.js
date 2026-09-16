// task.spec.js - Tests for lazy-loading feature

import { loadAdapter } from '../../src/ui/loadAdapter';

describe('Lazy Loading Adapters', () => {
  test('should load chat adapter dynamically', async () => {
    const module = await loadAdapter('chat');
    expect(module).toBeDefined();
    expect(typeof module.init).toBe('function');
  });

  test('should handle unknown adapter gracefully', async () => {
    await expect(loadAdapter('unknown')).rejects.toThrow();
  });
});
