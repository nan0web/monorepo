/**
 * ArchitectureMap — a cross-package component readiness registry.
 *
 * Tracks which UI components are implemented in which packages
 * (ui-lit, ui-cli, ui-react-bootstrap, etc.) and provides
 * a programmatic readiness matrix.
 *
 * @example
 * const map = new ArchitectureMap()
 * map.register('ui-lit', ['Button', 'Input', 'Select'])
 * map.register('ui-cli', ['Button', 'Input'])
 * map.getMatrix()
 * // → { Button: { 'ui-lit': true, 'ui-cli': true },
 * //     Input:  { 'ui-lit': true, 'ui-cli': true },
 * //     Select: { 'ui-lit': true, 'ui-cli': false } }
 * map.getReadiness('Button') // → true  (in all packages)
 * map.getReadiness('Select') // → false (missing from ui-cli)
 */
export default class ArchitectureMap {
    /**
     * Register a package and its exported components.
     *
     * @param {string} packageName — e.g. 'ui-lit', 'ui-cli', 'ui-react-bootstrap'
     * @param {string[]} componentsList — e.g. ['Button', 'Input', 'Select']
     */
    register(packageName: string, componentsList?: string[]): void;
    /**
     * Get the list of all registered package names.
     *
     * @returns {string[]}
     */
    getPackages(): string[];
    /**
     * Get all known component names (union of all packages).
     *
     * @returns {string[]}
     */
    getComponents(): string[];
    /**
     * Build a readiness matrix: { componentName → { packageName → boolean } }.
     *
     * Every known component gets an entry for every registered package.
     *
     * @returns {Object<string, Object<string, boolean>>}
     */
    getMatrix(): {
        [x: string]: {
            [x: string]: boolean;
        };
    };
    /**
     * Check if a component is implemented in ALL registered packages.
     *
     * @param {string} componentName
     * @returns {boolean}
     */
    getReadiness(componentName: string): boolean;
    /**
     * Get a summary: { total, ready, notReady, readyPercent }.
     *
     * @returns {{ total: number, ready: number, notReady: number, readyPercent: number }}
     */
    getSummary(): {
        total: number;
        ready: number;
        notReady: number;
        readyPercent: number;
    };
    #private;
}
