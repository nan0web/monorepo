/**
 * Parses human-readable delay strings into milliseconds.
 * Supported formats: 0, '30m', '2h', '1d', '1d 09:00', 'Mon 10:00'
 * @param {string|number} delay
 * @returns {number} milliseconds
 */
export function parseDelay(delay: string | number): number;
/**
 * Evaluates whether a content item matches a rule's conditions.
 * @param {Object} content - Content with properties: tags, type, lang, media
 * @param {Object} conditions - The `if` block from the rule
 * @returns {boolean}
 */
export function matchesConditions(content: any, conditions: any): boolean;
/**
 * The core dispatcher. Evaluates content against all rules
 * and returns a list of scheduled publish tasks.
 *
 * @param {Object} content - The content item to evaluate
 * @param {Array<Object>} rules - Array of rule definitions
 * @param {Map<string, import('../domain/SocialAdapter.js').SocialAdapter>} adapters - Registered adapters by id
 * @returns {Array<{ adapter: SocialAdapter, content: Object, delayMs: number, channel?: string, ruleName: string }>}
 */
export function evaluateRules(content: any, rules: Array<any>, adapters: Map<string, import("../domain/SocialAdapter.js").SocialAdapter>): Array<{
    adapter: SocialAdapter;
    content: any;
    delayMs: number;
    channel?: string;
    ruleName: string;
}>;
/**
 * Executes a list of publish tasks, respecting delays.
 *
 * @param {Array<Object>} tasks - Output of evaluateRules
 * @param {{ verify?: boolean, testMode?: boolean }} [opts]
 * @returns {Promise<Array<{ id: string, url: string, ruleName: string, adapter: string }>>}
 */
export function executeTasks(tasks: Array<any>, opts?: {
    verify?: boolean;
    testMode?: boolean;
}): Promise<Array<{
    id: string;
    url: string;
    ruleName: string;
    adapter: string;
}>>;
