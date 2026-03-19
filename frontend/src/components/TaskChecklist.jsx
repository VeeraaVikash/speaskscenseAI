import React from 'react'

export default function TaskChecklist({ checklist, feedback }) {
  const items = [
    { key: 'intent', label: 'Clear Intent' },
    { key: 'details', label: 'Good Detail' },
    { key: 'politeness', label: 'Right Tone' },
    { key: 'clarity', label: 'Easy to Understand' },
  ]
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Communication Checklist
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        {items.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: checklist?.[item.key] ? 'rgba(79,255,176,0.2)' : 'rgba(255,107,107,0.2)',
              border: `1px solid ${checklist?.[item.key] ? 'var(--success)' : 'var(--error)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: checklist?.[item.key] ? 'var(--success)' : 'var(--error)',
            }}>
              {checklist?.[item.key] ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{item.label}</span>
          </div>
        ))}
      </div>
      {feedback && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{feedback}</p>}
    </div>
  )
}