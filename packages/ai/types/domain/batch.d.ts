/**
 * Runs a batch queue of tasks from a JSONL file, processes each using executor,
 * and writes the results to another JSONL file.
 * @param {string} queueFile
 * @param {string} resultsFile
 * @param {function(BatchTaskModel): Promise<object>} executor
 * @returns {Promise<void>}
 */
export function runBatchQueue(queueFile: string, resultsFile: string, executor: (arg0: BatchTaskModel) => Promise<object>): Promise<void>;
import { BatchTaskModel } from './BatchTaskModel.js';
