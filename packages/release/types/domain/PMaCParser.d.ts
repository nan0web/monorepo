/**
 * Clean text from emoji, symbols, markdown formatting and trim.
 * @param {string} text
 * @returns {string}
 */
export function cleanSectionTitle(text: string): string;
/**
 * Match section title against known synonyms in ReleaseModel.SECTIONS.
 * @param {string} headingText
 * @param {typeof ReleaseModel} ModelClass
 * @returns {string | null} Recognized section key or null
 */
export function identifySection(headingText: string, ModelClass?: typeof ReleaseModel): string | null;
/**
 * Resolve external tracker URL for a task or issue ID using template URL.
 * Example: trackerUrl = "https://github.com/org/repo/issues/{id}", rawId = "[#142]" -> "https://github.com/org/repo/issues/142"
 * @param {string} id
 * @param {string} trackerTemplate
 * @returns {string}
 */
export function resolveTrackerUrl(id: string, trackerTemplate: string): string;
/**
 * PMaCParser - Parses PMaC Release/Task specification documents into ReleaseModel instances.
 */
export class PMaCParser {
    /**
     * Static shortcut to parse specification
     * @param {string} markdownContent
     * @returns {ReleaseModel}
     */
    static parse(markdownContent: string): ReleaseModel;
    /**
     * @param {typeof ReleaseModel} [modelClass]
     */
    constructor(modelClass?: typeof ReleaseModel);
    ModelClass: typeof ReleaseModel;
    /**
     * Parse markdown content into a ReleaseModel instance.
     * @param {string} markdownContent
     * @returns {ReleaseModel}
     */
    parse(markdownContent: string): ReleaseModel;
    /**
     * @private
     */
    private _parseTeamSection;
    /**
     * @private
     */
    private _parseTasksSection;
    /**
     * @private
     */
    private _parseParitySection;
    /**
     * @private
     */
    private _parseIssuesSection;
    /**
     * @private
     */
    private _parseArtifactsSection;
}
import { ReleaseModel } from './models/index.js';
