/**
 * ActionLogger component to display interaction feedback for the playground.
 *
 * @param {Object} props
 * @param {Array} props.actions - List of actions to display
 * @param {Function} [props.onClear] - Callback to clear the log
 */
export default function ActionLogger({ actions, onClear }: {
    actions: any[];
    onClear?: Function | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
