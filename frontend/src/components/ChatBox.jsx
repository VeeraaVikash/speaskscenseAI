import React from 'react'

export default function ChatBox({ messages }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
      {messages.map((msg, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
          <div style={{
            maxWidth: '80%', padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
            color: 'var(--text)', fontSize: 14, lineHeight: 1.5,
          }}>{msg.text}</div>
        </div>
      ))}
    </div>
  )
}