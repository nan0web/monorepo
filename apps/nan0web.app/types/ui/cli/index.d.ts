/**
 * Boot the AppRunner and render pages.
 * @param {{ locale?: string, page?: string }} options
 * @returns {AsyncGenerator<string>}
 */
export function renderCli({ locale, page }?: {
    locale?: string;
    page?: string;
}): AsyncGenerator<string>;
