import React from 'react'

export default function CorrectionCard({ good, better, best, explanation }) {
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Correction
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--success)', marginBottom: 3, fontWeight: 700 }}>✓ GOOD</p>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{good}</p>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--warning)', marginBottom: 3, fontWeight: 700 }}>↑ BETTER</p>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{better}</p>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 3, fontWeight: 700 }}>★ BEST</p>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{best}</p>
        </div>
        {explanation && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}