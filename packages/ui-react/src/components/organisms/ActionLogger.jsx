import React, { useState, useEffect, useRef } from 'react'
import { useUI } from '../../context/UIContext.jsx'

/**
 * ActionLogger component to display interaction feedback for the playground.
 *
 * @param {Object} props
 * @param {Array} props.actions - List of actions to display
 * @param {Function} [props.onClear] - Callback to clear the log
 */
export default function ActionLogger({ actions = [], onClear }) {
    const { theme } = useUI()
    const [isVisible, setIsVisible] = useState(false)
    const scrollRef = useRef(null)

    // Auto-show when new action arrives
    useEffect(() => {
        if (actions.length > 0) {
            setIsVisible(true)
        }
    }, [actions.length])

    // Auto-scroll to bottom
    useEffect(() => {
        const el = /** @type {any} */ (scrollRef.current)
        if (isVisible && el) {
            el.scrollTop = el.scrollHeight
        }
    }, [actions, isVisible])

    if (!isVisible && actions.length === 0) return null

    const t = /** @type {any} */ (theme)
    const isDark = t?.name === 'night' || t?.backgroundColor === '#1a1a1a'

    const styles = {
        container: /** @type {React.CSSProperties} */ ({
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '320px',
            maxHeight: '400px',
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 900,
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: !isVisible ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)',
            opacity: !isVisible && actions.length > 0 ? 0.7 : 1,
        }),
        header: /** @type {React.CSSProperties} */ ({
            padding: '14px 18px',
            borderBottom: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isDark ? '#1f2937' : '#f9fafb',
            userSelect: 'none',
        }),
        title: /** @type {React.CSSProperties} */ ({
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: isDark ? '#9ca3af' : '#6b7280',
        }),
        controls: /** @type {React.CSSProperties} */ ({
            display: 'flex',
            gap: '8px',
        }),
        btn: /** @type {React.CSSProperties} */ ({
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            color: isDark ? '#3b82f6' : '#2563eb',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s',
        }),
        content: /** @type {React.CSSProperties} */ ({
            padding: '12px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: isDark ? '#111827' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }),
        logItem: (isLast) => (/** @type {React.CSSProperties} */ ({
            padding: '10px 14px',
            borderRadius: '10px',
            background: isLast ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
            border: `1px solid ${isLast ? (isDark ? '#3b82f6' : '#bfdbfe') : 'transparent'}`,
            fontSize: '12px',
            transition: 'all 0.3s ease',
            position: 'relative',
        })),
        logType: {
            fontWeight: 700,
            color: isDark ? '#f3f4f6' : '#111827',
            marginBottom: '4px',
            fontSize: '11px',
        },
        logData: /** @type {React.CSSProperties} */ ({
            color: isDark ? '#9ca3af' : '#4b5563',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            wordBreak: 'break-all',
            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
            padding: '6px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            lineHeight: '1.4',
        }),
        timestamp: /** @type {React.CSSProperties} */ ({
            fontSize: '9px',
            color: isDark ? '#4b5563' : '#9ca3af',
            marginTop: '6px',
            textAlign: 'right',
            fontWeight: 500
        })
    }

    // Actions list in chronological order (newest at bottom)
    const sortedActions = [...actions].reverse()

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.title}>Interaction Logs</span>
                <div style={styles.controls}>
                    {onClear && actions.length > 0 && (
                        <button onClick={() => onClear()} style={styles.btn}>Clear</button>
                    )}
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        style={styles.btn}
                    >
                        {isVisible ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>
            {isVisible && (
                <div style={styles.content} ref={scrollRef}>
                    {actions.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>
                            Waiting for interactions...
                        </div>
                    ) : (
                        sortedActions.map((action, i) => (
                            <div key={action.id || i} style={styles.logItem(i === 0)}>
                                <div style={styles.logType}>{action.type}</div>
                                <div style={styles.logData}>
                                    {typeof action.data === 'object'
                                        ? JSON.stringify(action.data, null, 1).replace(/\n/g, ' ')
                                        : String(action.data)}
                                </div>
                                <div style={styles.timestamp}>
                                    {new Date(action.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
