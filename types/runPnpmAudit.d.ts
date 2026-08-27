/**
 * Runs `pnpm audit` and returns an array of {@link AuditIssue}.
 *
 * In mock mode (`MOCK_RUN_COMMAND=true`) the function returns an empty array
 * without invoking any external process.
 *
 * @returns {Promise<import("./AuditIssue.js").default[]>}
 */
export declare function runPnpmAudit(): Promise<import("./AuditIssue.js").default[]>;
