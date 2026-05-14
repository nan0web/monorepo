/**
 * Legacy bridge for SnapshotRunner.
 * @deprecated Use SnapshotRunner model from domain/app
 */
export class SnapshotRunner {
    static generateAndAudit(options: any): Promise<import("../core/Intent.js").ResultIntent>;
}
