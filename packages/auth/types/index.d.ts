export { default as Scope } from "./core/Scope.js";
export namespace Auth {
    /**
     * Creates a Consent Request Flow.
     *
     * @param {Object} req - The authorization request
     * @param {string} req.clientId - Who is asking?
     * @param {string[]} req.scopes - What do they want?
     * @returns {AsyncGenerator} The flow to yield to the user.
     */
    function askConsent(req: {
        clientId: string;
        scopes: string[];
    }): AsyncGenerator;
}
