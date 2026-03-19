import React from 'react'

export default function ScoreBar({ label, score, color }) {
  const pct = Math.min(100, Math.max(0, score))
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--accent)' }}>{pct}</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || 'var(--accent)', borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}