export default OutputAdapter;
/**
 * Abstract output adapter for UI implementations.
 *
 * @class OutputAdapter
 * @extends Event
 */
declare class OutputAdapter extends Event {
    /**
     * Renders a message to the user.
     *
     * @param {object} message - Message to render.
     * @throws {Error} If not overridden by a subclass.
     */
    render(message: object): void;
    /**
     * Shows progress of a long‑running operation.
     *
     * @param {number} progress - Progress value in range 0‑1.
     * @param {Object} [metadata={}] - Additional metadata.
     * @returns {void}
     */
    progress(progress: number, metadata?: any): void;
    /**
     * Stops the output stream. Default implementation does nothing.
     *
     * @returns {void}
     */
    stop(): void;
}
import Event from '@nan0web/event/oop';
