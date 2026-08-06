'use client'

import React, { useState } from 'react'

export const ImageCell: React.FC<{ cellData: string }> = ({ cellData }) => {
  const [hasError, setHasError] = useState(false)

  if (!cellData || typeof cellData !== 'string' || hasError) {
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

  const src = cellData.startsWith('http') || cellData.startsWith('/') ? cellData : `/${cellData}`

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }} suppressHydrationWarning>
      <img
        src={src}
        alt="Preview"
        style={{
          width: '192px',
          height: '108px',
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
