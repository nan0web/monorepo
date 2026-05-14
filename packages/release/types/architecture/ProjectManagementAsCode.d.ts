/**
 * Task management through node:test infrastructure
 * @class ProjectManagement
 */
export class ProjectManagement {
    /**
     * Initialize project management system
     * @param {Object} [config] - Configuration options
     * @param {string} [config.projectPath] - Path to project root
     * @param {boolean} [config.autoTrack] - Enable automatic status tracking
     */
    constructor(config?: {
        projectPath?: string | undefined;
        autoTrack?: boolean | undefined;
    });
    /** @type {string} */
    projectPath: string;
    /** @type {boolean} */
    autoTrack: boolean;
    /**
     * Task registry mapping task IDs to their test files
     * @type {Map<string, string>}
     */
    tasks: Map<string, string>;
    /**
     * Register a task with its validation test
     * @param {string} taskId - Unique task identifier
     * @param {string} testFilePath - Path to the test file
     */
    registerTask(taskId: string, testFilePath: string): void;
    /**
     * Run all registered task tests to determine project status
     * @returns {Promise<Object>} Test results summary
     */
    validateProjectState(): Promise<any>;
    /**
     * Execute individual task test
     * @param {string} testPath - Path to test file
     * @returns {Promise<Object>} Test execution result
     */
    runTaskTest(testPath: string): Promise<any>;
    /**
     * Generate release readiness report
     * @param {string} version - Target version for release
     * @returns {Promise<Object>} Release validation status
     */
    validateRelease(version: string): Promise<any>;
}
/**
 * Release management system that coordinates task validation
 * @class ReleaseManager
 */
export class ReleaseManager {
    /**
     * Initialize release manager
     * @param {ProjectManagement} projectManager - Project management instance
     */
    constructor(projectManager: ProjectManagement);
    /**
     * @type {ProjectManagement}
     */
    projectManager: ProjectManagement;
    /**
     * Execute release process with task validation
     * @param {string} type - Release type (patch, minor, major)
     * @param {Object} options - Release options
     * @returns {Promise<Object>} Release execution result
     */
    executeRelease(type: string, options?: any): Promise<any>;
    /**
     * Calculate next version based on release type
     * @param {string} type - Release type
     * @returns {string} Next version string
     */
    calculateVersion(type: string): string;
    /**
     * Publish release to package registry
     * @param {string} version - Version to publish
     * @param {Object} options - Publish options
     * @returns {Promise<boolean>} Publish success status
     */
    publish(version: string, options: any): Promise<boolean>;
}
/**
 * Task test suite definition following node:test format
 * @extends TestSuite
 */
export class TaskTestSuite extends TestSuite {
    /**
     * Initialize task test suite
     * @param {string} taskId - Unique task identifier
     * @param {string} description - Human-readable task description
     * @param {Function} testFunction - Test implementation function
     */
    constructor(taskId: string, description: string, testFunction: Function);
    /**
     * Task ID this test suite validates
     * @type {string}
     */
    taskId: string;
    /**
     * Task description for human understanding
     * @type {string}
     */
    description: string;
}
/**
 * Changelog-based task management for LLM-assisted development
 * @class ChangelogTaskManager
 */
export class ChangelogTaskManager {
    /**
     * Parse changelog to extract tasks and their statuses
     * @param {string} changelogContent - Raw changelog markdown
     * @returns {Array<Object>} Array of task objects
     */
    parseChangelog(changelogContent: string): Array<any>;
    /**
     * Generate task test files from changelog entries
     * @param {Array<Object>} tasks - Array of task objects
     * @returns {Promise<void>}
     */
    generateTaskTests(tasks: Array<any>): Promise<void>;
}
/**
 * # Project Management as Code Architecture
 *
 * This architecture implements project management through automated testing,
 * where each task is represented as a test case that validates system behavior.
 *
 * ## Core Concepts
 *
 * 1. **Tasks as Tests**: Each project task becomes a test suite that validates
 *    implementation correctness
 * 2. **Status Tracking**: Task status moves automatically through CI/CD pipeline
 *    when tests pass/fail
 * 3. **Release Validation**: Releases are validated by running task tests as
 *    part of the release process
 *
 * ## Implementation Details
 */
/**
 * Base TestSuite class for task management
 */
declare class TestSuite {
    /**
     * @param {string} name - Suite name
     * @param {Function} fn - Test function
     */
    constructor(name: string, fn: Function);
    name: string;
    fn: Function;
    /**
     * Run the test suite
     * @returns {Promise<Object>}
     */
    run(): Promise<any>;
}
export {};
