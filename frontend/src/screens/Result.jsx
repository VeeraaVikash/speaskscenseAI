import React, { useEffect, useState } from 'react'
import { getSessionSummary } from '../api'

export default function Result({ onEndDay }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionSummary()
      .then(setSummary)
      .catch(() => setSummary({ total_sessions: 1, average_score: 70, strengths: ['Consistent effort', 'Good attempt'], improvements: ['Clarity', 'Details'], message: 'Great work today! Keep practicing.' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="screen"><div style={{ color: 'var(--accent)', fontSize: 14 }}>Loading results...</div></div>

  const score = summary?.average_score || 0
  const scoreColor = score >= 85 ? 'var(--success)' : score >= 70 ? 'var(--warning)' : 'var(--accent)'

  return (
    <div className="screen" style={{ gap: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Session Results</p>
        <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px', background: `conic-gradient(${scoreColor} ${score * 3.6}deg, var(--surface2) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: scoreColor, fontFamily: 'var(--font-head)' }}>{Math.round(score)}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{summary.total_sessions} session{summary.total_sessions !== 1 ? 's' : ''} completed</p>
      </div>
      {summary.strengths?.length > 0 && (
        <div className="card" style={{ width: '100%' }}>
          <p style={{ fontSize: 11, color: 'var(--success)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Strengths</p>
          {summary.strengths.map((s, i) => <p key={i} style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>✓ {s}</p>)}
        </div>
      )}
      {summary.improvements?.length > 0 && (
        <div className="card" style={{ width: '100%' }}>
          <p style={{ fontSize: 11, color: 'var(--warning)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Areas to Improve</p>
          {summary.improvements.map((s, i) => <p key={i} style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>↑ {s}</p>)}
        </div>
      )}
      {summary.message && <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>"{summary.message}"</p>}
      <button className="btn-primary" onClick={onEndDay} style={{ width: '100%' }}>See Today's Tasks →</button>
    </div>
  )
}