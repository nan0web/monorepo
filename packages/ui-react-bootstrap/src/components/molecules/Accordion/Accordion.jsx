import React from 'react';
import { Accordion as BSAccordion } from 'react-bootstrap';

/**
 * Accordion component - collapsible content sections.
 * @param {Object} props
 * @param {Array} props.items - Array of {title, content} objects
 * @param {string} [props.defaultActiveKey] - Default open item
 */
const Accordion = ({ items = [], defaultActiveKey = '0' }) => {
    if (!items || items.length === 0) return null;

    return (
        <BSAccordion defaultActiveKey={defaultActiveKey}>
            {items.map((item, index) => (
                <BSAccordion.Item eventKey={String(index)} key={index}>
                    <BSAccordion.Header>{item.title}</BSAccordion.Header>
                    <BSAccordion.Body>{item.content}</BSAccordion.Body>
                </BSAccordion.Item>
            ))}
        </BSAccordion>
    );
};

export default Accordion;
