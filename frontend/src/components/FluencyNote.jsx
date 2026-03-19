import React from 'react'

export default function FluencyNote({ note }) {
  if (!note) return null
  return (
    <div className="card" style={{ marginBottom: 12, borderLeft: '3px solid var(--accent)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fluency Note</p>
      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{note}</p>
    </div>
  )
}