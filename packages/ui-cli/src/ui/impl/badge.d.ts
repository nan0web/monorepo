/**
 * Badge component – displays a small status label.
 *
 * @module ui/badge
 */
/**
 * Renders a status badge.
 *
 * @param {string} label - Text to display.
 * @param {'info'|'success'|'warning'|'error'|'neutral'} [variant='neutral']
 * @returns {string} Styled string.
 */
export declare function badge(label: string, variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'): string;
