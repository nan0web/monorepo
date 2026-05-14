import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, Dropdown, Spinner } from 'react-bootstrap'

/**
 * Bootstrap-themed Autocomplete component.
 */
export default function Autocomplete({ options = [], onSelect, placeholder, value: initialValue = '' }) {
    const [query, setQuery] = useState(initialValue)
    const [filteredChoices, setFilteredChoices] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            const el = wrapperRef.current
            if (el && !el.contains(/** @type {Node} */(event.target))) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true)
            let currentOptions = typeof options === 'function' ? await options(query) : options

            if (currentOptions instanceof Map) {
                currentOptions = Array.from(currentOptions.entries()).map(([value, label]) => ({ label, value }))
            }

            const choices = (currentOptions || []).map(opt => {
                const label = typeof opt === 'string' ? opt : (opt.title || opt.label || '')
                const value = typeof opt === 'string' ? opt : opt.value
                return { label, value }
            }).filter(choice =>
                choice.label.toLowerCase().includes(query.toLowerCase())
            )

            setFilteredChoices(choices)
            setLoading(false)
        }

        const timer = setTimeout(fetchOptions, 200)
        return () => clearTimeout(timer)
    }, [query, options])

    const handleSelect = (choice) => {
        setQuery(choice.label)
        setIsOpen(false)
        if (onSelect) onSelect(choice)
    }

    return (
        <div ref={wrapperRef} className="autocomplete-wrapper position-relative">
            <Form.Control
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
            />

            {isOpen && (filteredChoices.length > 0 || loading) && (
                <Dropdown.Menu show className="w-100 shadow-sm border-top-0 rounded-bottom">
                    {loading ? (
                        <Dropdown.Item disabled>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading...
                        </Dropdown.Item>
                    ) : (
                        filteredChoices.map((choice, i) => (
                            <Dropdown.Item
                                key={i}
                                onClick={() => handleSelect(choice)}
                            >
                                {choice.label}
                            </Dropdown.Item>
                        ))
                    )}
                </Dropdown.Menu>
            )}
        </div>
    )
}

Autocomplete.propTypes = {
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(Map), PropTypes.func]),
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
}
