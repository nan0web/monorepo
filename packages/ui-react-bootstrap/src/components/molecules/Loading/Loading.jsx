import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Loading component - displays a loading spinner.
 * @param {Object} props
 * @param {string} [props.text] - Optional text to display alongside spinner
 */
const Loading = ({ text = 'Loading...' }) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">{text}</span>
            </Spinner>
            {text && <p className="mt-3 text-muted">{text}</p>}
        </div>
    );
};

export default Loading;
