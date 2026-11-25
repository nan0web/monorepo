/**
 * Base domain model providing safe $db access without procedural fs/path.
 */
export class DomainModel extends Model {
    static UI: {
        errorNoDb: string;
    };
    /**
     * @param {Partial<DomainModel>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<DomainModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /**
     * Returns injected @nan0web/db instance or throws ModelError.
     * @returns {import('@nan0web/db').default}
     */
    get $db(): import("@nan0web/db").default;
}
import { Model } from '@nan0web/types';
