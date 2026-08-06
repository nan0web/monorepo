'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

export const BooleanCell: React.FC<{ cellData: boolean; field: any }> = ({ cellData, field }) => {
  const { i18n } = useTranslation()
  const lang = i18n?.language?.toLowerCase().startsWith('en') ? 'en' : 'uk'
  const val = Boolean(cellData)

  const isHiddenField = field?.name?.toLowerCase() === 'hidden'
  const customLabels = field?.admin?.custom?.labels

  const defaultLabels = isHiddenField
    ? { true: { uk: '🙈 Приховано', en: '🙈 Hidden' }, false: { uk: '🌐 Активно', en: '🌐 Active' } }
    : { true: { uk: '✅ Так', en: '✅ Yes' }, false: { uk: '❌ Ні', en: '❌ No' } }

  const labels = customLabels || defaultLabels
  const text = labels[val ? 'true' : 'false']?.[lang] || (val ? 'Yes' : 'No')

  const isWarning = isHiddenField ? val : !val
  const variant = isWarning ? 'warning' : 'success'

  return (
    <span
      className={`badge bg-${variant}-subtle text-${variant}-emphasis border border-${variant}-subtle`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: isWarning
          ? 'var(--bs-warning-bg-subtle, rgba(255, 193, 7, 0.15))'
          : 'var(--bs-success-bg-subtle, rgba(25, 135, 84, 0.15))',
        color: isWarning
          ? 'var(--bs-warning-text-emphasis, #664d03)'
          : 'var(--bs-success-text-emphasis, #0a3622)',
        borderColor: isWarning
          ? 'var(--bs-warning-border-subtle, rgba(255, 193, 7, 0.3))'
          : 'var(--bs-success-border-subtle, rgba(25, 135, 84, 0.3))',
      }}
      suppressHydrationWarning
    >
      {text}
    </span>
  )
}
