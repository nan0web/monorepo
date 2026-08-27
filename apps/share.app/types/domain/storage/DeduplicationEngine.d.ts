/**
 * DeduplicationEngine - Identifies duplicate files across directories or multiple drives.
 */
export class DeduplicationEngine {
    /**
     * Finds duplicates in a list of FileEntryModels or file objects.
     * @param {Array<{ hash: string, size: number, relativePath: string, driveId?: string }>} files
     * @returns {Array<{ hash: string, size: number, instances: Array<{ relativePath: string, driveId?: string }>, wastedBytes: number }>}
     */
    findDuplicates(files?: Array<{
        hash: string;
        size: number;
        relativePath: string;
        driveId?: string;
    }>): Array<{
        hash: string;
        size: number;
        instances: Array<{
            relativePath: string;
            driveId?: string;
        }>;
        wastedBytes: number;
    }>;
    /**
     * Compares source files against backup catalog to identify missing backup items.
     * @param {Array<{ relativePath: string, hash: string, size: number }>} sourceFiles
     * @param {Array<{ relativePath: string, hash: string, size: number }>} backupFiles
     * @returns {{ missingInBackup: typeof sourceFiles, backedUpCount: number, missingBytes: number }}
     */
    compareDrives(sourceFiles?: Array<{
        relativePath: string;
        hash: string;
        size: number;
    }>, backupFiles?: Array<{
        relativePath: string;
        hash: string;
        size: number;
    }>): {
        missingInBackup: typeof sourceFiles;
        backedUpCount: number;
        missingBytes: number;
    };
}
