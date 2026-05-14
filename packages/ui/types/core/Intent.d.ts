/**
 * Detects if a value is a Model-as-Schema class (has static fields with `help`).
 * @param {*} schema
 * @returns {boolean}
 */
export function isModelSchema(schema: any): boolean;
/**
 * Validates that an object is a well-formed Intent.
 * Throws ModelError if the intent is malformed (the "Judge").
 *
 * @param {*} intent
 * @returns {intent is Intent}
 */
export function validateIntent(intent: any): intent is Intent;
/**
 * Create an ask intent.
 *
 * Two modes:
 *   ask('amount', { help: 'Enter amount', type: 'number' })  → single field
 *   ask('transfer', TransferMoneyModel)                       → full Model form
 *
 * @param {string} field - Field name or form name.
 * @param {object | Function} schema - Field descriptor or Model-as-Schema class.
 * @returns {AskIntent}
 */
export function ask(field: string, schema: object | Function): AskIntent;
/**
 * @typedef {Object} ProgressOptions
 * @property {number} [total] - Absolute total steps.
 * @property {string} [id] - Progress tracking ID.
 * @property {number} [width] - Width of the progress bar in terminal characters.
 * @property {number} [fps] - Frames per second update rate limit.
 * @property {string} [format] - Custom format string (e.g. '{time} {bar} {percent} {title}').
 * @property {number} [columns] - Number of columns (terminal width).
 * @property {boolean} [forceOneLine] - Prevent wrapping and truncate instead.
 * @property {boolean|'success'|'error'} [stop] - Set to true to stop, or 'success'/'error' to stop with a status icon (for spinners).
 */
/**
 * Create a progress intent.
 * @param {string} message - Status message from Model (i18n static field value).
 * @param {number} [value=0] - Progress value (current step or percentage).
 * @param {ProgressOptions|number|string} [optionsOrTotalOrId] - Options object, or absolute total steps (number), or progress tracking ID (string).
 * @param {string} [id='default'] - Progress ID (if total is provided).
 * @returns {ProgressIntent}
 */
export function progress(message: string, value?: number, optionsOrTotalOrId?: ProgressOptions | number | string, id?: string): ProgressIntent;
/**
 * Lgs a message if level is greater or equal the current view level.
 * @param {LogLevel} level
 * @param {string} message
 * @param {object} [data={}]
 * @returns {LogIntent}
 */
export function log(level: LogLevel, message: string, data?: object): LogIntent;
/**
 * Create a render intent.
 * @param {string} component - Component name (e.g. 'App.Layout.Header').
 * @param {object} [props] - Static props for the component.
 * @returns {RenderIntent}
 */
export function render(component: string, props?: object): RenderIntent;
/**
 * Create a result intent.
 * @param {*} data - The raw result data.
 * @param {boolean} [raw=false] - If true, result is printed raw.
 * @returns {ResultIntent}
 */
export function result(data: any, raw?: boolean): ResultIntent;
/**
 * @typedef {Object} ShowData
 * @property {any} [component]
 * @property {import('@nan0web/types').Model} [model]
 */
/**
 * Create a show intent.
 * @param {string | any} message Message to display.
 * @param {ShowLevel|ShowData} [level='info'] Level of message or additional data then `level = 'info'`.
 * @param {ShowData} [data={}] Additional data to display.
 * @returns {ShowIntent}
 */
export function show(message: string | any, level?: ShowLevel | ShowData, data?: ShowData): ShowIntent;
/**
 * Create an agent intent to delegate a task to an AI subagent.
 * @param {string} task - The instructional task for the AI agent.
 * @param {AgentContext} [context={}] - Contextual data (files, errors, docs).
 * @returns {AgentIntent}
 */
export function agent(task: string, context?: AgentContext): AgentIntent;
/**
 * @typedef {Object} FieldSchema
 * @property {string} help - Human-readable label / i18n key.
 * @property {*} default - Default value for the field.
 * @property {string} [type] - Field type hint ('text', 'number', 'text/markdown').
 * @property {Array<{value: *, label: string}>} [options] - Enum options for select.
 * @property {(val: *) => true | string} [validate] - Validator: true = ok, string = error key from Model.
 * @property {boolean} [hidden] - If true, field is excluded from UI forms.
 */
/**
 * Model needs data from the environment (user input, LLM extraction, test fixture).
 * Adapter MUST return an `AskResponse`.
 * @typedef {Object} AskIntent
 * @property {'ask'} type
 * @property {string} field - Property name on the model.
 * @property {FieldSchema | Function} schema - Field metadata or Model-as-Schema class constructor.
 * @property {true} [model] - When true, schema is a Model-as-Schema class (full form).
 */
/**
 * Model informs about a long-running operation. No response expected.
 * Message MUST come from the Model (i18n static field value).
 * @typedef {Object} ProgressIntent
 * @property {'progress'} type
 * @property {number} [value] - Progress value (0-1).
 * @property {number} [total] - Absolute total (if value is absolute).
 * @property {string} [id] - Progress ID for tracking by Adapter to calculate speed/eta.
 * @property {string} message - Status message from Model (i18n static field value).
 * @property {ProgressOptions} [options] - Additional options for progress intent.
 */
/**
 * @typedef {'info' | 'warn' | 'error' | 'success'} ShowLevel
 */
/** @typedef {ShowLevel | 'debug'} LogLevel */
/**
 * Model emits a show message. No response expected.
 * Message MUST come from the Model (i18n static field value).
 * @typedef {Object} ShowIntent
 * @property {'show'} type
 * @property {ShowLevel} level
 * @property {string} message - Show message from Model (i18n static field value).
 */
/**
 * Model emits a log message intended for debugging/developer (Not UI).
 * @typedef {Object} LogIntent
 * @property {'log'} type
 * @property {LogLevel} level
 * @property {string} message - Internal log message.
 */
/**
 * Final return value from the generator.
 * @typedef {Object} ResultIntent
 * @property {'result'} type
 * @property {*} data - The raw result data (JSON-serializable).
 * @property {boolean} [raw] - If true, Adapter MUST output data raw (no UI decorations).
 */
/**
 * Model requests rendering of a pure UI component (Header, Footer, Static Map).
 * No response expected from the logic loop.
 * @typedef {Object} RenderIntent
 * @property {'render'} type
 * @property {string} component - Component name (e.g. 'App.Layout.Header').
 * @property {object} props - Static props for the component.
 */
/**
 * Contextual data and attachments for the AI subagent.
 * @typedef {Object} AgentContext
 * @property {string[]} [instructions] - List of instructions or guidelines (e.g. ['Use 1-char emojis only']).
 * @property {Record<string, string>} [files] - Hash map of file paths to their string contents.
 * @property {Record<string, any>} [data] - Any arbitrary JSON data (e.g. parsed errors, ASTs, metadata) useful for the task.
 */
/**
 * Model delegates a task to an AI subagent. The Adapter should launch the agent
 * with the provided task and context, and return the result. If the agent is skipped,
 * it returns { success: false } but allows user to generate a prompt.
 * @typedef {Object} AgentIntent
 * @property {'agent'} type
 * @property {string} task - The instructional task for the AI agent.
 * @property {AgentContext} context - Contextual data, files, and instructions for the task.
 * @property {() => string} toPrompt - Helper to format task and context as an LLM prompt.
 */
/**
 * Union of all possible yielded intents.
 * @typedef {(AskIntent | ProgressIntent | LogIntent | ShowIntent | RenderIntent | AgentIntent | ResultIntent) & {
 *   $value?: any;
 *   $success?: boolean;
 *   $files?: Record<string, string>;
 *   $message?: string;
 * }} Intent
 */
/**
 * Response to an AskIntent. Adapter provides the collected value.
 * The value MUST conform to the type described in the requested FieldSchema.
 * @typedef {Object} AskResponse
 * @property {*} value - The value matching schema.type (collected from user / LLM / test fixture).
 * @property {boolean} cancelled - Whether the user cancelled this interaction (e.g. pressed ESC).
 * @property {string} [action] - The action identifier (e.g., 'submit', 'exit', 'back').
 * @property {any} [body] - Additional payload or form data.
 * @property {any} [form] - The form model instance (if applicable).
 * @property {number} [index] - The selected index for lists/tables.
 */
/**
 * Response to an AgentIntent.
 * The underlying Adapter (Orchestrator) is responsible for communicating with the LLM,
 * enforcing output formats (e.g. Unified Diff or Tool Calls like `updateFile`),
 * and resolving common LLM hallucinations (like Grok truncating code with `// ...`).
 *
 * The Model (e.g. IconsAuditor) receives this clean, resolved response and does not
 * need to parse Markdown or interpret diffs itself.
 *
 * @typedef {Object} AgentResponse
 * @property {boolean} success - True if the agent successfully processed the task.
 * @property {Record<string, string>} [files] - Hash map of fully resolved, updated file contents.
 * @property {string} [message] - Optional summary or explanation returned by the AI.
 */
/**
 * Special response that Adapters can send to abort the generator.
 *
 * The `reason` is a KEY from the Model's static `abort` dictionary,
 * not a freeform message. This enables proper i18n translation:
 *
 *   Model defines:  static abort = { user_cancelled: 'Скасовано', timeout: 'Час вичерпано' }
 *   Adapter sends:  { abort: true, reason: 'user_cancelled' }
 *   UI translates:  t(Model.abort[reason])
 *
 * @typedef {Object} AbortResponse
 * @property {true} abort - Signal to the model that execution was cancelled.
 * @property {string} [reason] - Key from Model's static abort dictionary (not a freeform message).
 */
/**
 * Union of all possible responses an Adapter can send back via iterator.next().
 * @typedef {AskResponse | AgentResponse | AbortResponse | undefined} IntentResponse
 */
/**
 * @typedef {'ask' | 'show' | 'progress' | 'render' | 'agent'} IntentType
 */
export const INTENT_TYPES: readonly ["ask", "progress", "show", "log", "render", "agent"];
export type ProgressOptions = {
    /**
     * - Absolute total steps.
     */
    total?: number | undefined;
    /**
     * - Progress tracking ID.
     */
    id?: string | undefined;
    /**
     * - Width of the progress bar in terminal characters.
     */
    width?: number | undefined;
    /**
     * - Frames per second update rate limit.
     */
    fps?: number | undefined;
    /**
     * - Custom format string (e.g. '{time} {bar} {percent} {title}').
     */
    format?: string | undefined;
    /**
     * - Number of columns (terminal width).
     */
    columns?: number | undefined;
    /**
     * - Prevent wrapping and truncate instead.
     */
    forceOneLine?: boolean | undefined;
    /**
     * - Set to true to stop, or 'success'/'error' to stop with a status icon (for spinners).
     */
    stop?: boolean | "error" | "success" | undefined;
};
export type ShowData = {
    component?: any;
    model?: import("@nan0web/types").Model | undefined;
};
export type FieldSchema = {
    /**
     * - Human-readable label / i18n key.
     */
    help: string;
    /**
     * - Default value for the field.
     */
    default: any;
    /**
     * - Field type hint ('text', 'number', 'text/markdown').
     */
    type?: string | undefined;
    /**
     * - Enum options for select.
     */
    options?: {
        value: any;
        label: string;
    }[] | undefined;
    /**
     * - Validator: true = ok, string = error key from Model.
     */
    validate?: ((val: any) => true | string) | undefined;
    /**
     * - If true, field is excluded from UI forms.
     */
    hidden?: boolean | undefined;
};
/**
 * Model needs data from the environment (user input, LLM extraction, test fixture).
 * Adapter MUST return an `AskResponse`.
 */
export type AskIntent = {
    type: "ask";
    /**
     * - Property name on the model.
     */
    field: string;
    /**
     * - Field metadata or Model-as-Schema class constructor.
     */
    schema: FieldSchema | Function;
    /**
     * - When true, schema is a Model-as-Schema class (full form).
     */
    model?: true | undefined;
};
/**
 * Model informs about a long-running operation. No response expected.
 * Message MUST come from the Model (i18n static field value).
 */
export type ProgressIntent = {
    type: "progress";
    /**
     * - Progress value (0-1).
     */
    value?: number | undefined;
    /**
     * - Absolute total (if value is absolute).
     */
    total?: number | undefined;
    /**
     * - Progress ID for tracking by Adapter to calculate speed/eta.
     */
    id?: string | undefined;
    /**
     * - Status message from Model (i18n static field value).
     */
    message: string;
    /**
     * - Additional options for progress intent.
     */
    options?: ProgressOptions | undefined;
};
export type ShowLevel = "info" | "warn" | "error" | "success";
export type LogLevel = ShowLevel | "debug";
/**
 * Model emits a show message. No response expected.
 * Message MUST come from the Model (i18n static field value).
 */
export type ShowIntent = {
    type: "show";
    level: ShowLevel;
    /**
     * - Show message from Model (i18n static field value).
     */
    message: string;
};
/**
 * Model emits a log message intended for debugging/developer (Not UI).
 */
export type LogIntent = {
    type: "log";
    level: LogLevel;
    /**
     * - Internal log message.
     */
    message: string;
};
/**
 * Final return value from the generator.
 */
export type ResultIntent = {
    type: "result";
    /**
     * - The raw result data (JSON-serializable).
     */
    data: any;
    /**
     * - If true, Adapter MUST output data raw (no UI decorations).
     */
    raw?: boolean | undefined;
};
/**
 * Model requests rendering of a pure UI component (Header, Footer, Static Map).
 * No response expected from the logic loop.
 */
export type RenderIntent = {
    type: "render";
    /**
     * - Component name (e.g. 'App.Layout.Header').
     */
    component: string;
    /**
     * - Static props for the component.
     */
    props: object;
};
/**
 * Contextual data and attachments for the AI subagent.
 */
export type AgentContext = {
    /**
     * - List of instructions or guidelines (e.g. ['Use 1-char emojis only']).
     */
    instructions?: string[] | undefined;
    /**
     * - Hash map of file paths to their string contents.
     */
    files?: Record<string, string> | undefined;
    /**
     * - Any arbitrary JSON data (e.g. parsed errors, ASTs, metadata) useful for the task.
     */
    data?: Record<string, any> | undefined;
};
/**
 * Model delegates a task to an AI subagent. The Adapter should launch the agent
 * with the provided task and context, and return the result. If the agent is skipped,
 * it returns { success: false } but allows user to generate a prompt.
 */
export type AgentIntent = {
    type: "agent";
    /**
     * - The instructional task for the AI agent.
     */
    task: string;
    /**
     * - Contextual data, files, and instructions for the task.
     */
    context: AgentContext;
    /**
     * - Helper to format task and context as an LLM prompt.
     */
    toPrompt: () => string;
};
/**
 * Union of all possible yielded intents.
 */
export type Intent = (AskIntent | ProgressIntent | LogIntent | ShowIntent | RenderIntent | AgentIntent | ResultIntent) & {
    $value?: any;
    $success?: boolean;
    $files?: Record<string, string>;
    $message?: string;
};
/**
 * Response to an AskIntent. Adapter provides the collected value.
 * The value MUST conform to the type described in the requested FieldSchema.
 */
export type AskResponse = {
    /**
     * - The value matching schema.type (collected from user / LLM / test fixture).
     */
    value: any;
    /**
     * - Whether the user cancelled this interaction (e.g. pressed ESC).
     */
    cancelled: boolean;
    /**
     * - The action identifier (e.g., 'submit', 'exit', 'back').
     */
    action?: string | undefined;
    /**
     * - Additional payload or form data.
     */
    body?: any;
    /**
     * - The form model instance (if applicable).
     */
    form?: any;
    /**
     * - The selected index for lists/tables.
     */
    index?: number | undefined;
};
/**
 * Response to an AgentIntent.
 * The underlying Adapter (Orchestrator) is responsible for communicating with the LLM,
 * enforcing output formats (e.g. Unified Diff or Tool Calls like `updateFile`),
 * and resolving common LLM hallucinations (like Grok truncating code with `// ...`).
 *
 * The Model (e.g. IconsAuditor) receives this clean, resolved response and does not
 * need to parse Markdown or interpret diffs itself.
 */
export type AgentResponse = {
    /**
     * - True if the agent successfully processed the task.
     */
    success: boolean;
    /**
     * - Hash map of fully resolved, updated file contents.
     */
    files?: Record<string, string> | undefined;
    /**
     * - Optional summary or explanation returned by the AI.
     */
    message?: string | undefined;
};
/**
 * Special response that Adapters can send to abort the generator.
 *
 * The `reason` is a KEY from the Model's static `abort` dictionary,
 * not a freeform message. This enables proper i18n translation:
 *
 *   Model defines:  static abort = { user_cancelled: 'Скасовано', timeout: 'Час вичерпано' }
 *   Adapter sends:  { abort: true, reason: 'user_cancelled' }
 *   UI translates:  t(Model.abort[reason])
 */
export type AbortResponse = {
    /**
     * - Signal to the model that execution was cancelled.
     */
    abort: true;
    /**
     * - Key from Model's static abort dictionary (not a freeform message).
     */
    reason?: string | undefined;
};
/**
 * Union of all possible responses an Adapter can send back via iterator.next().
 */
export type IntentResponse = AskResponse | AgentResponse | AbortResponse | undefined;
export type IntentType = "ask" | "show" | "progress" | "render" | "agent";
