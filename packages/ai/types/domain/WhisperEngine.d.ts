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
