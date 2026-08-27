/**
 * @file GeneratorRunner — Universal Adapter Loop with Timeout, Abort, and Contract Enforcement.
 *
 * This is the core engine that runs any OLMUI async generator (Model.run())
 * through a set of adapter handlers. It enforces:
 *
 * 1. Intent validation (the "Judge" — Ярослав Мудрий).
 * 2. Timeout / Abort support (Іван Сірко).
 * 3. Type-safe handler dispatch (Борис Патон).
 *
 * Every UI Adapter (CLI, Lit, Chat, Test) uses this runner
 * instead of writing its own while(true) loop.
 */
export type AdapterHandlers = {
    /**
     *   Handler for 'ask' intents. Must return { value: ... }.
     */
    ask: (intent: import('./Intent.js').AskIntent) => Promise<import('./Intent.js').AskResponse>;
    /**
     * Handler for 'progress' intents. Optional (defaults to no-op).
     */
    progress?: (intent: import('./Intent.js').ProgressIntent) => void | Promise<void>;
    /**
     * Handler for 'show' intents. Optional (defaults to no-op).
     */
    show?: (intent: import('./Intent.js').ShowIntent) => void | Promise<void>;
    /**
     * Handler for 'log' intents. Optional.
     */
    log?: (intent: import('./Intent.js').LogIntent) => void | Promise<void>;
    /**
     * Handler for 'agent' intents (AI Subagents). Optional (fallback to show if not implemented).
     */
    agent?: (intent: import('./Intent.js').AgentIntent) => Promise<import('./Intent.js').AgentResponse>;
    /**
     * Handler for 'render' intents (visual component injection). Optional.
     */
    render?: (intent: import('./Intent.js').RenderIntent) => void | Promise<void>;
    /**
     * Handler for the final 'result'. Optional (defaults to no-op).
     */
    result?: (intent: import('./Intent.js').ResultIntent) => void | Promise<void>;
};
export type RunnerOptions = {
    /**
     * Maximum milliseconds to wait for an adapter handler to respond.
     * Default is 0 (disabled) — web forms may wait indefinitely.
     * Set to a positive value for CLI/Chat adapters where hanging is unacceptable.
     */
    timeoutMs?: number;
    /**
     * External AbortSignal for cancellation from outside.
     */
    signal?: AbortSignal;
    /**
     * Array where all executed intents will be sequentially recorded.
     * Useful for generating 'crash reports' or Nan0Spec files on failure.
     */
    trace?: import('./Intent.js').Intent[];
};
/**
 * Runs an OLMUI async generator through the provided adapter handlers.
 *
 * This function is the SINGLE point of execution for all adapters.
 * It guarantees:
 * - Every yielded intent is validated (contract enforcement).
 * - Every 'ask' intent gets a response or times out (if timeoutMs > 0).
 * - External abort signals are respected.
 * - The final result is returned.
 *
 * @template T
 * @param {AsyncGenerator<import('./Intent.js').Intent, import('./Intent.js').ResultIntent, import('./Intent.js').IntentResponse>} generator
 *   The model's async generator (from Model.run()).
 * @param {AdapterHandlers} handlers
 *   Platform-specific handlers for each intent type.
 * @param {RunnerOptions} [options={}]
 *   Runner configuration (timeout, abort signal).
 * @returns {Promise<T>}
 *   The final result data from the generator.
 */
export declare function runGenerator<T>(generator: AsyncGenerator<import('./Intent.js').Intent, import('./Intent.js').ResultIntent, import('./Intent.js').IntentResponse>, handlers: AdapterHandlers, options?: RunnerOptions): Promise<T>;
