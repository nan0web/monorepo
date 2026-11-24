/**
 * KindleExportAdapter exports task digests to plain TXT (primary) or structured EPUB.
 */
export class KindleExportAdapter {
    /**
     * Format tasks as clean plain text for Kindle.
     * @param {TaskModel[]} tasks
     * @param {string} [title='Задачі']
     * @returns {string}
     */
    static formatTxt(tasks: TaskModel[], title?: string): string;
    /**
     * Format tasks as XHTML content suitable for EPUB assembly.
     * @param {TaskModel[]} tasks
     * @param {string} [title='Задачі']
     * @returns {string}
     */
    static formatEpubXhtml(tasks: TaskModel[], title?: string): string;
    /**
     * @param {TaskModel[]} tasks
     * @param {'txt' | 'epub'} [format='txt']
     * @returns {{ format: string, content: string }}
     */
    static export(tasks: TaskModel[], format?: "txt" | "epub"): {
        format: string;
        content: string;
    };
}
export default KindleExportAdapter;
import { TaskModel } from '../../domain/Task/TaskModel.js';
