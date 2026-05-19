declare namespace _default {
    /**
     * Create registration configuration
     * @param {Object} [configuration] - Custom integration settings
     * @param {Object} [configuration.api] - API configuration
     * @param {string} [configuration.api.prefix] - Custom API prefix
     * @param {Object} [configuration.cli] - CLI configuration
     * @param {string} [configuration.cli.command] - Custom CLI command
     * @returns {Object} Integration setup objects
     */
    function register(configuration?: {
        api?: {
            prefix?: string | undefined;
        } | undefined;
        cli?: {
            command?: string | undefined;
        } | undefined;
    }): any;
}
export default _default;
