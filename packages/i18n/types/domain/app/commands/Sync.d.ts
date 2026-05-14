/** @typedef {import('@nan0web/ui').Intent} Intent */
export class SyncCommand extends Model {
    static $id: string;
    /**
     * @returns {AsyncGenerator<Intent>}
     */
    run(): AsyncGenerator<Intent>;
}
export type Intent = import("@nan0web/ui").Intent;
import { Model } from '@nan0web/types';
