export default GDPRConsent;
/**
 * Headless cookie consent logic
 */
declare function GDPRConsent({ onAccept, onDecline, children }: {
    onAccept: any;
    onDecline: any;
    children: any;
}): any;
declare namespace GDPRConsent {
    namespace propTypes {
        let onAccept: PropTypes.Requireable<(...args: any[]) => any>;
        let onDecline: PropTypes.Requireable<(...args: any[]) => any>;
        let children: PropTypes.Requireable<NonNullable<PropTypes.ReactNodeLike | ((...args: any[]) => any)>>;
    }
}
import PropTypes from 'prop-types';
