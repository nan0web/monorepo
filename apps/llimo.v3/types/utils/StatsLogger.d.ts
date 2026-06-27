/**
 * StatsLogger - logs AI model performance to ~/.llimo/stats.jsonl
 */
export class StatsLogger {
    /**
     * Get absolute path to the stats.jsonl file
     * @param {string} [customBase]
     * @returns {string}
     */
    static getStatsPath(customBase?: string): string;
    /**
     * Log a performance metric
     * @param {Object} metrics
     * @param {string} metrics.modelId
     * @param {string} metrics.provider
     * @param {number} metrics.inputTokens
     * @param {number} metrics.outputTokens
     * @param {number} metrics.speed - tokens / sec
     * @param {number} metrics.taskDuration - seconds
     * @param {number} metrics.cost - USD
     * @param {string} [customBase]
     * @returns {Promise<void>}
     */
    static log(metrics: {
        modelId: string;
        provider: string;
        inputTokens: number;
        outputTokens: number;
        speed: number;
        taskDuration: number;
        cost: number;
    }, customBase?: string): Promise<void>;
    /**
     * Read all logged stats
     * @param {string} [customBase]
     * @returns {Promise<Array<Object>>}
     */
    static readAll(customBase?: string): Promise<Array<any>>;
}
