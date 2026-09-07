/**
 * Component types that can be yielded from a Flow.
 *
 * @typedef {'view' | 'prompt' | 'stream' | 'action' | 'flow'} ComponentType
 */
/**
 * Base interface for all UI components.
 *
 * @typedef {Object} FlowComponent
 * @property {ComponentType} type - Component type discriminator.
 * @property {string} [name] - Optional component name for debugging.
 */
/**
 * Static view component (no user input required).
 * Examples: Alert, Badge, Toast, Table, Text
 *
 * @typedef {Object} ViewComponent
 * @property {'view'} type - Always 'view'.
 * @property {string} name - Component name (e.g., 'Alert', 'Toast').
 * @property {Object} props - Component-specific properties.
 */
/**
 * Interactive prompt component (requires user input).
 * Examples: Input, Select, Confirm, Multiselect, Mask
 *
 * @typedef {Object} PromptComponent
 * @property {'prompt'} type - Always 'prompt'.
 * @property {string} name - Component name (e.g., 'Select', 'Input').
 * @property {Object} props - Component-specific properties.
 * @property {string} [props.message] - Prompt message to display.
 * @property {any[]} [props.choices] - Options for Select/Multiselect.
 * @property {Function} [props.validate] - Validation function.
 */
/**
 * Streaming component for progress/async operations.
 * Examples: Spinner, ProgressBar, StreamChunk
 *
 * @typedef {Object} StreamComponent
 * @property {'stream'} type - Always 'stream'.
 * @property {string} name - Component name (e.g., 'Spinner', 'Progress').
 * @property {Object} props - Component-specific properties.
 * @property {AsyncIterable} [iterable] - Async iterator for streaming content.
 */
/**
 * Action component for physical or side-effect operations.
 * Examples: Move, Sound, Light, Notify
 *
 * @typedef {Object} ActionComponent
 * @property {'action'} type - Always 'action'.
 * @property {string} name - Component name (e.g., 'Move', 'Beep').
 * @property {Object} props - Component-specific properties.
 */
/**
 * Result returned by prompt components.
 *
 * @typedef {Object} PromptResult
 * @property {any} value - The value entered/selected by user.
 * @property {boolean} [cancelled] - True if user cancelled the prompt.
 */
/**
 * Adapter interface that all platform adapters must implement.
 *
 * @typedef {Object} FlowAdapter
 * @property {(component: ViewComponent) => void | Promise<void>} renderView
 *   Renders a static view component.
 * @property {(component: PromptComponent) => Promise<PromptResult>} executePrompt
 *   Execute an interactive prompt and returns user input.
 * @property {(component: StreamComponent) => AsyncIterable} streamProgress
 *   Handles streaming components.
 * @property {(component: ActionComponent) => Promise<any>} [executeAction]
 *   Executes an action component (physical or side-effect).
 */
/**
 * Creates a View component.
 *
 * @param {string} name - Component name (e.g., 'Alert', 'Toast').
 * @param {Object} props - Component properties.
 * @returns {ViewComponent}
 *
 * @example
 * yield View('Alert', { variant: 'success', message: 'Done!' })
 */
export function View(name: string, props?: any): ViewComponent;
/**
 * Creates a Prompt component.
 *
 * @param {string} name - Component name (e.g., 'Select', 'Input').
 * @param {Object} props - Component properties.
 * @returns {PromptComponent}
 *
 * @example
 * const value = yield Prompt('Select', { message: 'Choose:', choices: ['a', 'b'] })
 */
export function Prompt(name: string, props?: any): PromptComponent;
/**
 * Creates a Stream component.
 *
 * @param {string} name - Component name (e.g., 'Spinner', 'Progress').
 * @param {Object} props - Component properties.
 * @returns {StreamComponent}
 *
 * @example
 * yield* Stream('Progress', { total: 100, current: 50 })
 */
export function Stream(name: string, props?: any): StreamComponent;
/**
 * Creates an Action component.
 *
 * @param {string} name - Action name.
 * @param {Object} props - Action properties.
 * @returns {ActionComponent}
 */
export function Action(name: string, props?: any): ActionComponent;
/**
 * Runs a Flow (async generator) with the provided adapter.
 *
 * The Flow runner iterates through yielded components and dispatches them
 * to the appropriate adapter method based on component type.
 *
 * @param {AsyncGenerator} flow - The flow generator to execute.
 * @param {FlowAdapter} adapter - The platform-specific adapter.
 * @param {Object} [options={}] - Additional options.
 * @param {AbortSignal} [options.signal] - Abort signal for cancellation.
 * @returns {Promise<any>} The final return value of the flow.
 *
 * @example
 * async function* loginFlow() {
 *     yield Alert({ message: 'Welcome!' })
 *     const username = yield Input({ message: 'Username:' })
 *     const password = yield Password({ message: 'Password:' })
 *     return { username, password }
 * }
 *
 * const result = await runFlow(loginFlow(), cliAdapter)
 */
export function runFlow(flow: AsyncGenerator, adapter: FlowAdapter, options?: {
    signal?: AbortSignal | undefined;
}): Promise<any>;
/**
 * Wraps a nested flow for composition with yield*.
 *
 * @param {Function} flowFn - Flow generator function.
 * @param {...any} args - Arguments to pass to the flow function.
 * @returns {Object} A flow component.
 *
 * @example
 * async function* mainFlow() {
 *     yield Alert({ message: 'Starting...' })
 *     const user = yield* flow(loginFlow)
 *     yield Alert({ message: `Welcome, ${user.name}!` })
 * }
 */
export function flow(flowFn: Function, ...args: any[]): any;
export function Alert(props: any): ViewComponent;
export function Toast(props: any): ViewComponent;
export function Badge(props: any): ViewComponent;
export function Text(props: any): ViewComponent;
export function Table(props: any): ViewComponent;
export function Input(props: any): PromptComponent;
export function Select(props: any): PromptComponent;
export function Confirm(props: any): PromptComponent;
export function Multiselect(props: any): PromptComponent;
export function Mask(props: any): PromptComponent;
export function Password(props: any): PromptComponent;
export function Spinner(props: any): StreamComponent;
export function Progress(props: any): StreamComponent;
export function Beep(props: any): ActionComponent;
export function Move(props: any): ActionComponent;
declare namespace _default {
    export { runFlow };
    export { flow };
    export { View };
    export { Prompt };
    export { Stream };
    export { Alert };
    export { Toast };
    export { Badge };
    export { Text };
    export { Table };
    export { Input };
    export { Select };
    export { Confirm };
    export { Multiselect };
    export { Mask };
    export { Password };
    export { Spinner };
    export { Progress };
}
export default _default;
/**
 * Component types that can be yielded from a Flow.
 */
export type ComponentType = "view" | "prompt" | "stream" | "action" | "flow";
/**
 * Base interface for all UI components.
 */
export type FlowComponent = {
    /**
     * - Component type discriminator.
     */
    type: ComponentType;
    /**
     * - Optional component name for debugging.
     */
    name?: string | undefined;
};
/**
 * Static view component (no user input required).
 * Examples: Alert, Badge, Toast, Table, Text
 */
export type ViewComponent = {
    /**
     * - Always 'view'.
     */
    type: "view";
    /**
     * - Component name (e.g., 'Alert', 'Toast').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: any;
};
/**
 * Interactive prompt component (requires user input).
 * Examples: Input, Select, Confirm, Multiselect, Mask
 */
export type PromptComponent = {
    /**
     * - Always 'prompt'.
     */
    type: "prompt";
    /**
     * - Component name (e.g., 'Select', 'Input').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: {
        message?: string | undefined;
        choices?: any[] | undefined;
        validate?: Function | undefined;
    };
};
/**
 * Streaming component for progress/async operations.
 * Examples: Spinner, ProgressBar, StreamChunk
 */
export type StreamComponent = {
    /**
     * - Always 'stream'.
     */
    type: "stream";
    /**
     * - Component name (e.g., 'Spinner', 'Progress').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: any;
    /**
     * - Async iterator for streaming content.
     */
    iterable?: AsyncIterable<any> | undefined;
};
/**
 * Action component for physical or side-effect operations.
 * Examples: Move, Sound, Light, Notify
 */
export type ActionComponent = {
    /**
     * - Always 'action'.
     */
    type: "action";
    /**
     * - Component name (e.g., 'Move', 'Beep').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: any;
};
/**
 * Result returned by prompt components.
 */
export type PromptResult = {
    /**
     * - The value entered/selected by user.
     */
    value: any;
    /**
     * - True if user cancelled the prompt.
     */
    cancelled?: boolean | undefined;
};
/**
 * Adapter interface that all platform adapters must implement.
 */
export type FlowAdapter = {
    /**
     *   Renders a static view component.
     */
    renderView: (component: ViewComponent) => void | Promise<void>;
    /**
     *   Execute an interactive prompt and returns user input.
     */
    executePrompt: (component: PromptComponent) => Promise<PromptResult>;
    /**
     *   Handles streaming components.
     */
    streamProgress: (component: StreamComponent) => AsyncIterable<any>;
    /**
     * Executes an action component (physical or side-effect).
     */
    executeAction?: ((component: ActionComponent) => Promise<any>) | undefined;
};
