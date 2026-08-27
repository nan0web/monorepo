/**
 * Toast component – displays a brief notification.
 *
 * @module ui/toast
 */
/**
 * Renders a toast message.
 *
 * @param {string} message - Message content.
 * @param {'info'|'success'|'warning'|'error'} [variant='info']
 * @returns {string} Styled string.
 */
export declare function toast(message: string, variant?: 'info' | 'success' | 'warning' | 'error'): string;
