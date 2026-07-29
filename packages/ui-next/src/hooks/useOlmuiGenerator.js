'use client';

import { useState, useEffect, useRef } from 'react';
import { runGenerator } from '@nan0web/ui';

/**
 * React hook to manage the state of an OLMUI generator.
 * @param {Function} generatorFactory - A function that returns an async generator.
 * @param {Array} [initialArgs=[]] - Arguments to pass to the generatorFactory.
 * @returns {Object} { state, submit, cancel, acknowledge }
 */
export function useOlmuiGenerator(generatorFactory, initialArgs = []) {
    const [state, setState] = useState({ intent: null, done: false, data: null, error: null });
    const resolverRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const ac = new AbortController();

        async function start() {
            try {
                const generator = generatorFactory(...initialArgs);
                const handlers = {
                    ask: async (intent) => {
                        return new Promise((resolve) => {
                            if (isMounted) {
                                resolverRef.current = resolve;
                                setState({ intent, done: false, data: null, error: null });
                            }
                        });
                    },
                    show: async (intent) => {
                        return new Promise((resolve) => {
                            if (isMounted) {
                                resolverRef.current = resolve;
                                setState({ intent, done: false, data: null, error: null });
                            }
                        });
                    },
                    progress: async (intent) => {
                        if (isMounted) {
                            setState((prev) => ({ ...prev, intent }));
                        }
                    },
                    render: async (intent) => {
                        if (isMounted) {
                            setState((prev) => ({ ...prev, intent }));
                        }
                    },
                    result: async (intent) => {
                         if (isMounted) {
                            setState({ intent, done: true, data: intent?.data, error: null });
                         }
                    }
                };

                const data = await runGenerator(generator, handlers, { signal: ac.signal });
                if (isMounted) {
                    setState(prev => prev.done ? prev : { intent: { type: 'result', data }, done: true, data, error: null });
                }
            } catch (err) {
                if (err.name !== 'AbortError' && isMounted) {
                    setState({ intent: null, error: err, done: true, data: null });
                }
            }
        }
        
        start();

        return () => {
            isMounted = false;
            ac.abort();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount or when factory changes, assuming factory is stable

    const submit = (value) => {
        if (resolverRef.current) {
            const resolve = resolverRef.current;
            resolverRef.current = null;
            resolve({ value });
        }
    };

    const cancel = () => {
        if (resolverRef.current) {
            const resolve = resolverRef.current;
            resolverRef.current = null;
            resolve({ cancelled: true });
        }
    };

    const acknowledge = () => {
        if (resolverRef.current) {
            const resolve = resolverRef.current;
            resolverRef.current = null;
            resolve();
        }
    };

    return { state, submit, cancel, acknowledge };
}
