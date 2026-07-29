/**
 * FileLock - Zero-dependency atomic directory-based advisory lock.
 */
export class FileLock {
    /**
     * Acquire lock on a file path
     * @param {string} filePath
     * @param {number} [timeoutMs=5000]
     * @returns {Promise<() => Promise<void>>} Release function
     */
    static lock(filePath: string, timeoutMs?: number): Promise<() => Promise<void>>;
}
/**
 * StatsCollector - High-performance stats collector and aggregator for llimo runs
 */
export class StatsCollector {
    /**
     * Resolve path to the logs directory root
     * @param {string} [customBase]
     * @returns {string}
     */
    static getLogsDir(customBase?: string): string;
    /**
     * Append a new request statistic to stats.nan0 hierarchy
     * @param {Record<string, any>} statData
     * @param {string} [customBase]
     * @returns {Promise<void>}
     */
    static appendStat(statData: Record<string, any>, customBase?: string): Promise<void>;
    /**
     * Get accumulated stats for today
     * @param {string} [customBase]
     * @returns {Promise<{ costUsd: number, tokensInput: number, tokensOutput: number, speedTps: number }>}
     */
    static getTodayStats(customBase?: string): Promise<{
        costUsd: number;
        tokensInput: number;
        tokensOutput: number;
        speedTps: number;
    }>;
    /**
     * Calculate total disk usage of the logs folder in bytes
     * @param {string} [customBase]
     * @returns {Promise<number>}
     */
    static diskSpaceUsage(customBase?: string): Promise<number>;
    /**
     * Rotate logs older than maxAgeDays
     * @param {number} maxAgeDays
     * @param {string} [customBase]
     * @returns {Promise<number>} Number of deleted files
     */
    static rotateLogs(maxAgeDays: number, customBase?: string): Promise<number>;
    /**
     * Purge/delete all logs completely
     * @param {string} [customBase]
     * @returns {Promise<void>}
     */
    static purge(customBase?: string): Promise<void>;
}
