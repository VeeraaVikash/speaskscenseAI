import React, { useEffect, useState } from 'react'

const FEATURES = [
  { icon: '🎯', title: 'Real conversations', desc: 'AI speaks first, you respond naturally' },
  { icon: '🌍', title: '5 languages', desc: 'English, French, Hindi, Chinese, German' },
  { icon: '📊', title: 'Live coaching', desc: 'Grammar, fluency and task scores every turn' },
  { icon: '🔄', title: 'Good → Better → Best', desc: 'See exactly how to improve what you said' },
]

export default function Welcome({ onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px 40px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>

      {/* Hero */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', paddingTop: 72, paddingBottom: 48, gap: 24,
      }}>
        {/* Animated orb */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div style={{
            position: 'absolute', inset: -12,
            borderRadius: '50%',
            background: 'rgba(124,111,255,0.12)',
            animation: 'breathe 3s ease-in-out infinite',
          }} />
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a594ff, #7c6fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(124,111,255,0.35)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
        </div>

        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(124,111,255,0.12)',
            border: '1px solid rgba(124,111,255,0.25)',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 12, color: 'var(--accent)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 16,
          }}>
            AI Communication Coach
          </div>
          <h1 style={{
            fontSize: 42, fontFamily: 'var(--font-head)',
            letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #e8e8f0 0%, #7c6fff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SpeakScense
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: 17, lineHeight: 1.7,
            maxWidth: 340, margin: '0 auto',
          }}>
            Have real conversations with an AI tutor.<br />
            Get coached on every single reply.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onStart}
          style={{ fontSize: 17, padding: '16px 48px', marginTop: 8 }}
        >
          Start Talking →
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
          No account needed · Free · Voice-first
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', maxWidth: 480, height: 1, background: 'var(--border)', marginBottom: 40 }} />

      {/* Feature grid */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        marginBottom: 40,
      }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '18px 16px',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          How it works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['01', 'Pick your language', 'English, French, Hindi, Chinese or German'],
            ['02', 'AI detects your level', '3 quick voice questions, fully automatic'],
            ['03', 'Choose a scenario', 'Interview, meeting, casual chat and more'],
            ['04', 'Have a real conversation', 'AI speaks, you reply, AI coaches you instantly'],
          ].map(([num, title, desc], i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0, position: 'relative' }}>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 1, background: 'var(--border)' }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-head)',
                zIndex: 1,
              }}>{num}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  )
}