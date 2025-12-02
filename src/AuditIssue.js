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
	/** @type {"critical"|"high"|"moderate"|"low"} Severity */
	type = "low"

	/** @type {string|undefined} Human‑readable description */
	text

	/** @type {string|undefined} Affected package name */
	pkg

	/** @type {string|undefined} Vulnerable version range */
	vulnerable

	/** @type {string|undefined} Patched version range */
	patched

	/** @type {string|undefined} Dependency paths leading to the issue */
	paths

	/** @type {string|undefined} URL with more information */
	info

	/**
	 * @param {Partial<AuditIssue>} [input={}]
	 */
	constructor(input = {}) {
		const {
			type = this.type,
			text,
			pkg,
			vulnerable,
			patched,
			paths,
			info,
		} = input

		this.type = type
		this.text = text
		this.pkg = pkg
		this.vulnerable = vulnerable
		this.patched = patched
		this.paths = paths
		this.info = info
	}
}
