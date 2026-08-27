/**
 * Node.js Port extending AudioSplitter domain ModelAsApp.
 */
export class AudioSplitterPort extends AudioSplitter {
    static _splitFallback(inputPath: any, { segmentDuration, outputDir, onProgress }: {
        segmentDuration: any;
        outputDir: any;
        onProgress: any;
    }): Promise<string[]>;
    static probeDuration(inputPath: any): Promise<number>;
    static _extractSegment(inputPath: any, startSeconds: any, durationSeconds: any, outputPath: any): Promise<void>;
}
import { AudioSplitter } from '../domain/AudioSplitter.js';
