export default FeedbackForm;
/**
 * Core form submission with validation.
 */
declare function FeedbackForm({ onSubmit, initialValues, className }: {
    onSubmit: any;
    initialValues?: any;
    className?: string | undefined;
}): import("react/jsx-runtime.js").JSX.Element;
declare namespace FeedbackForm {
    namespace propTypes {
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        let initialValues: PropTypes.Requireable<PropTypes.InferProps<{
            myFullName: PropTypes.Requireable<string>;
            myContacts: PropTypes.Requireable<string>;
            bankEmployee: PropTypes.Requireable<string>;
            date: PropTypes.Requireable<string>;
            myText: PropTypes.Requireable<string>;
            myPosition: PropTypes.Requireable<string>;
            agreement: PropTypes.Requireable<boolean>;
        }>>;
        let className: PropTypes.Requireable<string>;
    }
}
import PropTypes from 'prop-types';
