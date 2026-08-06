'use client'

import React from 'react'

export const MapCell: React.FC<{ rowData: any }> = ({ rowData }) => {
  const lat = rowData?.lat || rowData?.latitude || '50.4501'
  const lon = rowData?.lng || rowData?.longitude || '30.5234'
  const address = rowData?.address || rowData?.title || 'Відділення'

  const zoom = 15
  const latNum = parseFloat(String(lat)) || 50.4501
  const lonNum = parseFloat(String(lon)) || 30.5234

  const x = Math.floor(((lonNum + 180) / 360) * Math.pow(2, zoom))
  const y = Math.floor(
    ((1 - Math.log(Math.tan((latNum * Math.PI) / 180) + 1 / Math.cos((latNum * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )

  const osmTileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
  const osmMapUrl = `https://www.openstreetmap.org/?mlat=${latNum}&mlon=${lonNum}#map=16/${latNum}/${lonNum}`

  return (
    <a
      href={osmMapUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: 'inherit',
      }}
      suppressHydrationWarning
    >
      <img
        src={osmTileUrl}
        alt="OpenStreetMap"
        style={{
          width: '100px',
          height: '56px',
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: '#222',
        }}
        onError={(e) => {
          ;(e.target as HTMLElement).style.display = 'none'
        }}
        suppressHydrationWarning
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>📍 {address}</span>
        <span style={{ fontSize: '10px', color: '#1471d1' }}>🗺️ OpenStreetMap ({latNum.toFixed(4)}, {lonNum.toFixed(4)})</span>
      </div>
    </a>
  )
}
