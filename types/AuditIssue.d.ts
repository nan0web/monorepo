/**
 * AuditIssue class – plain data holder.
 *
 * The constructor copies only the known properties; any extra keys are discarded.
 * The prototype is reset to `Object.prototype` so that instances compare equal
 * to plain objects via `assert.deepStrictEqual`.
 *
 * @example
 * import AuditIssue from "./AuditIssue.js"
 * const issue = new AuditIssue({ type: "high", package: "lodash" })
 * console.log(issue.type) // "high"
 * console.log(issue.foo) // undefined
 */
export default class AuditIssue {
    /**
     * @param {Partial<AuditIssue>} [input={}]
     */
    constructor(input?: Partial<AuditIssue> | undefined);
    /** @type {"critical"|"high"|"moderate"|"low"} Severity */
    type: "critical" | "high" | "moderate" | "low";
    /** @type {string|undefined} Human‑readable description */
    text: string | undefined;
    /** @type {string|undefined} Affected package name */
    pkg: string | undefined;
    /** @type {string|undefined} Vulnerable version range */
    vulnerable: string | undefined;
    /** @type {string|undefined} Patched version range */
    patched: string | undefined;
    /** @type {string|undefined} Dependency paths leading to the issue */
    paths: string | undefined;
    /** @type {string|undefined} URL with more information */
    info: string | undefined;
}
