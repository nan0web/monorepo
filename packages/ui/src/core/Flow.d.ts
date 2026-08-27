/**
 * @fileoverview Universal Flow Runner for yield-based UI architecture.
 *
 * The Flow pattern enables "One Logic, Many UI" by separating business logic
 * from presentation. A Flow is an async generator that yields Components,
 * which are then rendered by platform-specific Adapters.
 *
 * @module @nan0web/ui/core/Flow
 */
export type ComponentType = 'view' | 'prompt' | 'stream' | 'action' | 'flow';
export type FlowComponent = {
    /**
     * - Component type discriminator.
     */
    type: ComponentType;
    /**
     * - Optional component name for debugging.
     */
    name?: string;
};
export type ViewComponent = {
    /**
     * - Always 'view'.
     */
    type: 'view';
    /**
     * - Component name (e.g., 'Alert', 'Toast').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: any;
};
export type PromptComponent = {
    /**
     * - Always 'prompt'.
     */
    type: 'prompt';
    /**
     * - Component name (e.g., 'Select', 'Input').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: {
        message?: string;
        choices?: any[];
        validate?: Function;
    };
};
export type StreamComponent = {
    /**
     * - Always 'stream'.
     */
    type: 'stream';
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
    iterable?: AsyncIterable<any>;
};
export type ActionComponent = {
    /**
     * - Always 'action'.
     */
    type: 'action';
    /**
     * - Component name (e.g., 'Move', 'Beep').
     */
    name: string;
    /**
     * - Component-specific properties.
     */
    props: any;
};
export type PromptResult = {
    /**
     * - The value entered/selected by user.
     */
    value: any;
    /**
     * - True if user cancelled the prompt.
     */
    cancelled?: boolean;
};
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
    executeAction?: (component: ActionComponent) => Promise<any>;
};
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
export declare function View(name: string, props?: any): ViewComponent;
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
export declare function Prompt(name: string, props?: any): PromptComponent;
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
export declare function Stream(name: string, props?: any): StreamComponent;
/**
 * Creates an Action component.
 *
 * @param {string} name - Action name.
 * @param {Object} props - Action properties.
 * @returns {ActionComponent}
 */
export declare function Action(name: string, props?: any): ActionComponent;
/** @param {Object} props */
export declare const Alert: (props: any) => ViewComponent;
/** @param {Object} props */
export declare const Toast: (props: any) => ViewComponent;
/** @param {Object} props */
export declare const Badge: (props: any) => ViewComponent;
/** @param {Object} props */
export declare const Text: (props: any) => ViewComponent;
/** @param {Object} props */
export declare const Table: (props: any) => ViewComponent;
/** @param {Object} props */
export declare const Input: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Select: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Confirm: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Multiselect: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Mask: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Password: (props: any) => PromptComponent;
/** @param {Object} props */
export declare const Spinner: (props: any) => StreamComponent;
/** @param {Object} props */
export declare const Progress: (props: any) => StreamComponent;
/** @param {Object} props */
export declare const Beep: (props: any) => ActionComponent;
/** @param {Object} props */
export declare const Move: (props: any) => ActionComponent;
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
export declare function runFlow(flow: AsyncGenerator, adapter: FlowAdapter, options?: {
    signal?: AbortSignal;
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
export declare function flow(flowFn: Function, ...args: any[]): any;
declare const _default: {
    runFlow: typeof runFlow;
    flow: typeof flow;
    View: typeof View;
    Prompt: typeof Prompt;
    Stream: typeof Stream;
    Alert: typeof Alert;
    Toast: typeof Toast;
    Badge: typeof Badge;
    Text: typeof Text;
    Table: typeof Table;
    Input: typeof Input;
    Select: typeof Select;
    Confirm: typeof Confirm;
    Multiselect: typeof Multiselect;
    Mask: typeof Mask;
    Password: typeof Password;
    Spinner: typeof Spinner;
    Progress: typeof Progress;
};
export default _default;
