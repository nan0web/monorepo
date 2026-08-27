/**
 * Alert component – displays a prominent message box.
 *
 * @module ui/alert
 */
/**
 * Renders an alert box and optionally plays a sound.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @param {Object} [options]
 * @param {string} [options.title] - Optional title.
 * @param {boolean} [options.sound=false] - Play beep sound.
 * @returns {string} Styled message block.
 */
export declare function alert(message: string, variant?: 'info' | 'success' | 'warning' | 'error', options?: {
    title?: string;
    sound?: boolean;
}): string;
