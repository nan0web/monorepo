/**
 * Bridge between VS Code host and Webview.
 * Provides a standardized way to send and receive messages.
 */
export class EditorBridge {
    /**
     * Send message to VS Code host
     * @param {string} type - Message type
     * @param {any} [payload] - Message payload
     */
    send(type: string, payload?: any): void;
    /**
     * Subscribe to messages from VS Code host
     * @param {Function} handler - Message handler function
     * @returns {Function} Unsubscribe function
     */
    onMessage(handler: Function): Function;
    /**
     * Save current editor state to VS Code
     * @param {any} state - Serialized editor state
     */
    setState(state: any): void;
    /**
     * Get restored editor state from VS Code
     * @returns {any} Restored state
     */
    getState(): any;
    #private;
}
