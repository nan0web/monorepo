/**
 * Perform a lightweight web search using DuckDuckGo HTML version.
 * @param {string} query
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
export function searchWeb(query: string): Promise<Array<{
    title: string;
    url: string;
    snippet: string;
}>>;
/**
 * Fetch and extract text from a webpage using fetch.
 * @param {string} url
 * @returns {Promise<string>}
 */
export function readWebPage(url: string): Promise<string>;
