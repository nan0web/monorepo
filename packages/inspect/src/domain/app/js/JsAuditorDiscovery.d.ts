/**
 * JS-specific auditor discovery via package.json dependencies.
 */
export class JsAuditorDiscovery extends AuditorDiscovery {
    /**
     * Discovers target project by targetDir and imports the
     * `package.json#exports.inspect` that exports AuditorModels, if provided.
     *
     * @throws {ModelError}
     * @param {string} targetDir
     * @returns {Promise<Set<typeof AuditorModel>>}
     */
    discover(targetDir: string): Promise<Set<typeof AuditorModel>>;
}
import { AuditorDiscovery } from '../Discovery.js';
import { AuditorModel } from '../../AuditorModel.js';
