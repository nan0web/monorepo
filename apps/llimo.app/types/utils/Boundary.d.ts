/**
 * BoundaryProtocol – parses custom boundary blocks like ---boundary:path---
 */
export class BoundaryProtocol extends FileProtocol {
    /**
     * Parse the source into ParsedFile.
     * @param {string} source - a source of content
     * @returns {Promise<import("../FileProtocol.js").ParsedFile>}
     */
    static parse(source: string): Promise<import("../FileProtocol.js").ParsedFile>;
}
import { FileProtocol } from "../FileProtocol.js";
