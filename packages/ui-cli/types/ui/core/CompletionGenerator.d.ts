/**
 * CompletionGenerator – generates shell completion scripts for zsh and bash.
 *
 * @module CompletionGenerator
 */
/**
 * Generate shell completion scripts based on command structure.
 */
export default class CompletionGenerator {
    /**
     * Generate a completion script for the specified shell type.
     *
     * @param {string} shellType - Either 'zsh' or 'bash'
     * @param {Object} commandStructure - Command structure with commands and options
     * @param {string} appName - Application name for the completion function
     * @returns {string} Generated completion script
     */
    static generateCompletionScript(shellType: string, commandStructure: any, appName?: string): string;
    /**
     * Generate Zsh completion script.
     *
     * @param {Object} commandStructure
     * @param {string} appName
     * @returns {string}
     */
    static generateZshCompletion(commandStructure: any, appName: string): string;
    /**
     * Generate Bash completion script.
     *
     * @param {Object} commandStructure
     * @param {string} appName
     * @returns {string}
     */
    static generateBashCompletion(commandStructure: any, appName: string): string;
    /**
     * Extract all commands from command structure.
     *
     * @param {Object} commandStructure
     * @returns {Array<{name: string, help?: string}>}
     */
    static getAllCommands(commandStructure: any): Array<{
        name: string;
        help?: string;
    }>;
    /**
     * Extract all options from command structure.
     *
     * @param {Object} commandStructure
     * @returns {Array<{long: string, short?: string, help?: string}>}
     */
    static getAllOptions(commandStructure: any): Array<{
        long: string;
        short?: string;
        help?: string;
    }>;
    /**
     * Extract command structure from a Model class.
     *
     * @param {Function | Object} ModelClass - Model class or object to analyze
     * @returns {Object} Command structure
     */
    static extractCommandStructure(ModelClass: Function | any): any;
}
