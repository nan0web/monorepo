'use client'

import React, { useState } from 'react'

/**
 * @typedef {Object} ImageCellProps
 * @property {string | { url?: string; thumbnailURL?: string }} [cellData]
 * @property {string | { url?: string; thumbnailURL?: string }} [value]
 */

/**
 * Image preview cell for Payload CMS admin tables.
 * @param {ImageCellProps} props
 * @returns {React.JSX.Element | null}
 */
export function ImageCell(props) {
  const [hasError, setHasError] = useState(false)
  const rawValue = props.cellData || props.value

  if (!rawValue || hasError) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '192px',
          height: '108px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          color: '#888',
        }}
        suppressHydrationWarning
      >
        <span>🖼️ Без фото</span>
      </div>
    )
  }

  const srcValue = typeof rawValue === 'object' ? rawValue.url || rawValue.thumbnailURL : rawValue
  if (!srcValue || typeof srcValue !== 'string') {
    return null
  }

  const src = srcValue.startsWith('http') || srcValue.startsWith('/') ? srcValue : `/${srcValue}`

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }} suppressHydrationWarning>
      <img
        src={src}
        alt="Preview"
        style={{
          width: '192px',
          minWidth: '192px',
          height: '108px',
          minHeight: '108px',
          display: 'block',
          objectFit: 'cover',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          background: '#111',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
        onError={() => setHasError(true)}
        suppressHydrationWarning
      />
    </div>
  )
}

export default ImageCell
