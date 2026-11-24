/**
 * Format byte count into a human-readable approximate size label.
 * @param {number} bytes
 * @returns {string}
 */
export function formatModelSize(bytes: number): string;
/**
 * Parse a single stdout/stderr line from mlx_whisper.
 * @param {string} line
 * @returns {{ language?: string, percent?: number, currentTime?: number, text?: string } | null}
 */
export function parseMlxProgressLine(line: string): {
    language?: string;
    percent?: number;
    currentTime?: number;
    text?: string;
} | null;
/**
 * Fetch available mlx-community Whisper models from Hugging Face Hub API with built-in fallback.
 * @param {object} [options]
 * @param {Function} [options.fetchFn]
 * @param {boolean} [options.offline=false]
 * @returns {Promise<Array<{ alias: string|null, id: string, sizeBytes: number, sizeLabel: string, isDefault: boolean }>>}
 */
export function fetchMlxWhisperModels(options?: {
    fetchFn?: Function;
    offline?: boolean;
}): Promise<Array<{
    alias: string | null;
    id: string;
    sizeBytes: number;
    sizeLabel: string;
    isDefault: boolean;
}>>;
/**
 * Normalize Whisper language name or code to ISO-639-1 code (returns undefined for 'auto').
 * @param {string} [lang]
 * @returns {string|undefined}
 */
export function normalizeWhisperLanguage(lang?: string): string | undefined;
/**
 * Build CLI arguments for mlx_whisper.
 * @param {string} audioPath
 * @param {object} [options]
 * @returns {string[]}
 */
export function buildMlxArgs(audioPath: string, options?: object): string[];
/**
 * @typedef {Object} WhisperBackend
 * @property {string} name - Backend name (mlx, whisper, cpp)
 * @property {'mlx'|'whisper'|'cpp'} type
 * @property {Function} run - Execute transcription
 */
/**
 * @typedef {Object} WhisperResult
 * @property {string} outputDir - Absolute path to output directory
 * @property {string} baseName - Base filename (without extension)
 * @property {string} format - Output format
 * @property {string[]} filePaths - Expected output file paths
 */
/** @type {Record<string, string>} */
export const MLX_MODEL_MAP: Record<string, string>;
/** @type {Record<string, { id: string, sizeBytes: number, sizeLabel: string, speedLabel: string }>} */
export const MLX_MODEL_META: Record<string, {
    id: string;
    sizeBytes: number;
    sizeLabel: string;
    speedLabel: string;
}>;
/**
 * WhisperEngine — multi-backend transcription engine.
 *
 * Supports three backends in priority order:
 *   1. `mlx`    — mlx_whisper       (Apple Silicon, MLX framework)
 *   2. `whisper` — openai-whisper   (Python, CPU/GPU, cross-platform)
 *   3. `cpp`    — whisper-cli       (whisper.cpp, CPU, cross-platform)
 *
 * Usage:
 *   const engine = await WhisperEngine.detect({ model: 'medium' })
 *   const result = await engine.transcribe('/path/to/audio.mp3')
 *   // result → { outputDir, baseName, format, filePaths }
 */
export class WhisperEngine {
    /**
     * Detect available whisper backend, returning the best one.
     * Priority: mlx > whisper > cpp
     * @param {Object} [options]
     * @param {string} [options.model='medium']
     * @returns {Promise<WhisperEngine>}
     */
    static detect(options?: {
        model?: string;
    }): Promise<WhisperEngine>;
    /** @param {WhisperBackend} backend */
    constructor(backend: WhisperBackend);
    backend: WhisperBackend;
    /**
     * Transcribe audio file.
     * @param {string} audioPath - Path to audio file
     * @param {Object} [options]
     * @param {string} [options.model='medium'] - Model size
     * @param {string} [options.language] - ISO-639-1 language code
     * @param {string} [options.format='txt'] - Output format
     * @param {string} [options.outputDir] - Output directory
     * @returns {Promise<WhisperResult>}
     */
    transcribe(audioPath: string, options?: {
        model?: string;
        language?: string;
        format?: string;
        outputDir?: string;
    }): Promise<WhisperResult>;
}
export type WhisperBackend = {
    /**
     * - Backend name (mlx, whisper, cpp)
     */
    name: string;
    type: "mlx" | "whisper" | "cpp";
    /**
     * - Execute transcription
     */
    run: Function;
};
export type WhisperResult = {
    /**
     * - Absolute path to output directory
     */
    outputDir: string;
    /**
     * - Base filename (without extension)
     */
    baseName: string;
    /**
     * - Output format
     */
    format: string;
    /**
     * - Expected output file paths
     */
    filePaths: string[];
};
