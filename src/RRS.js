/**
 * Release Readiness Score (RRS) calculator
 * Evaluates project readiness based on required and optional criteria
 */

/**
 * @typedef {Object} RRSCriteria
 * @property {number} systemMd - Presence of system.md
 * @property {number} testPass - Test suite passes
 * @property {number} buildPass - Build process passes
 * @property {number} tsconfig - Presence of tsconfig.json
 */

/**
 * @typedef {Object} RRSOptionalCriteria
 * @property {number} readmeTest - Presence of src/README.md.test.js
 * @property {number} playground - Presence of playground examples
 * @property {number} releaseMd - Presence of release documentation
 * @property {number} readmeMd - Presence of README.md
 * @property {number} npmPublished - Package is published to npm
 * @property {number} contributingAndLicense - CONTRIBUTING.md and LICENSE exist
 */

/**
 * RRS configuration with scoring criteria
 */
const RRS = {
	required: {
		systemMd: 100,
		testPass: 100,
		buildPass: 100,
		tsconfig: 100
	},
	optional: {
		readmeTest: 10,
		playground: 10,
		releaseMd: 1,
		readmeMd: 1,
		npmPublished: 1,
		contributingAndLicense: 1
	},
	max: 424,
}

export default RRS
