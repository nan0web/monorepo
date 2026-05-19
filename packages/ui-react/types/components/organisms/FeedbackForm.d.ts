export default FeedbackForm;
/**
 * Premium FeedbackForm component (v2)
 *
 * Integrated with FeedbackModel for validation and schema.
 * Features:
 * - OLMUI-compliant styling (variables-based)
 * - Model-as-Schema validation
 * - Async submission state support
 * - Accessible and responsive layout
 */
declare function FeedbackForm({ onSubmit, initialValues, className, isAuthRequired, user }: {
    onSubmit: any;
    initialValues?: {} | undefined;
    className?: string | undefined;
    isAuthRequired?: boolean | undefined;
    user?: null | undefined;
}): import("react/jsx-runtime.js").JSX.Element;
declare namespace FeedbackForm {
    namespace propTypes {
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        let initialValues: PropTypes.Requireable<object>;
        let className: PropTypes.Requireable<string>;
        let isAuthRequired: PropTypes.Requireable<boolean>;
        let user: PropTypes.Requireable<object>;
    }
}
import PropTypes from 'prop-types';
