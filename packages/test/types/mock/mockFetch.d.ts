export interface MockFetchResponse {
	ok: boolean;
	status: number;
	headers: Map<string, string>;
	json: () => Promise<any>;
	text: () => Promise<string>;
}

/**
 * Creates a mock fetch function based on the provided routes.
 * @param {Array<[string, (any|Function)]>} routes - Route patterns with their corresponding responses.
 * @param {string} [base=""] - The URI prefix, such as host "http://localhost"
 * @returns {(url: string, options: object) => Promise<MockFetchResponse>} An async function that mimics the fetch API.
 */
export default function mockFetch(routes: any[], base?: string): (url: string, options?: object) => Promise<MockFetchResponse>;
