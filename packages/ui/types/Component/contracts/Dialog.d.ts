/**
 * @fileoverview Dialog and Progress UI Component Contracts.
 * Defines props, roles, and events for Dialog/Modal and Progress components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Dialog
 */
/**
 * @typedef {Object} DialogProps
 * @property {string} title - Title or question for the dialog prompt.
 * @property {string} content - Explanatory body or text.
 * @property {boolean} [open=true] - Visibility state.
 * @property {Array<import('./Interaction.js').ActionProps>} [actions] - Interactive decision buttons.
 */
/**
 * @typedef {'confirm' | 'cancel'} DialogEventName
 */
/**
 * @typedef {'running' | 'paused' | 'success' | 'failed'} ProgressStatus
 */
/**
 * @typedef {Object} ProgressProps
 * @property {number} [value] - Progress fraction (0 to 1) or percentage.
 * @property {number} [total] - Absolute total count (e.g. file count).
 * @property {string} [message] - Status text or stage name.
 * @property {ProgressStatus} [status='running'] - Current operation status.
 */
/**
 * Dialog Component Contract (Alias: ModalContract).
 */
export const DialogContract: Readonly<{
    name: "Dialog";
    category: "Dialog";
    props: string[];
    slots: string[];
    events: string[];
}>;
export const ModalContract: Readonly<{
    name: "Dialog";
    category: "Dialog";
    props: string[];
    slots: string[];
    events: string[];
}>;
/**
 * Progress Component Contract (Linear or Spinner).
 */
export const ProgressContract: Readonly<{
    name: "Progress";
    category: "Dialog";
    props: string[];
    slots: never[];
    events: never[];
}>;
export type DialogProps = {
    /**
     * - Title or question for the dialog prompt.
     */
    title: string;
    /**
     * - Explanatory body or text.
     */
    content: string;
    /**
     * - Visibility state.
     */
    open?: boolean | undefined;
    /**
     * - Interactive decision buttons.
     */
    actions?: import("./Interaction.js").ActionProps[] | undefined;
};
export type DialogEventName = "confirm" | "cancel";
export type ProgressStatus = "running" | "paused" | "success" | "failed";
export type ProgressProps = {
    /**
     * - Progress fraction (0 to 1) or percentage.
     */
    value?: number | undefined;
    /**
     * - Absolute total count (e.g. file count).
     */
    total?: number | undefined;
    /**
     * - Status text or stage name.
     */
    message?: string | undefined;
    /**
     * - Current operation status.
     */
    status?: ProgressStatus | undefined;
};
