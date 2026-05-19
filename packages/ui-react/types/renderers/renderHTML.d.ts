/**
 * renderHTML – renders raw HTML block from nan0web engine.
 * @param {Object} props
 * @param {Object} props.element  Block data containing 'ui-html'
 * @param {Object} props.context  UI Context
 */
export default function renderHTML({ element, context }: {
    element: any;
    context: any;
}): import("react/jsx-runtime").JSX.Element | null;
