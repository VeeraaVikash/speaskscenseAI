import React, { useEffect, useState } from 'react'
import { getDailyTasks } from '../api'

const typeColors = { speaking: 'var(--accent)', writing: 'var(--warning)', listening: 'var(--success)' }

export default function EndDay({ level, scenario, onRestart }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDailyTasks(level, scenario)
      .then(setData)
      .catch(() => setData({
        tasks: [
          { id: 1, task: 'Record yourself speaking for 2 minutes on any topic.', type: 'speaking' },
          { id: 2, task: 'Write 5 sentences using vocabulary from today.', type: 'writing' },
          { id: 3, task: 'Listen to an English podcast for 10 minutes.', type: 'listening' },
        ],
        motivation: "You showed up today. That already puts you ahead. Keep going!"
      }))
      .finally(() => setLoading(false))
  }, [level, scenario])

  if (loading) return <div className="screen"><p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p></div>

  return (
    <div className="screen" style={{ gap: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>End of Day Tasks</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Complete these to keep your momentum going</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {data?.tasks?.map(task => (
          <div key={task.id} className="card" style={{ borderLeft: `3px solid ${typeColors[task.type] || 'var(--accent)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{task.task}</p>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: typeColors[task.type] || 'var(--accent)', textTransform: 'uppercase' }}>{task.type}</span>
            </div>
          </div>
        ))}
      </div>
      {data?.motivation && (
        <div style={{ background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.2)', borderRadius: 14, padding: '16px 20px', textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{data.motivation}</p>
        </div>
      )}
      <button className="btn-primary" onClick={onRestart} style={{ width: '100%' }}>Start New Session →</button>
    </div>
  )
}