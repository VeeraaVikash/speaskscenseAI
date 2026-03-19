import React, { useRef } from 'react'

export default function VoiceOrb({ state, onClick }) {
  const orbRef = useRef(null)

  const cfg = {
    idle:       { label: 'Tap to speak', color: '#7c6fff', glow: 'rgba(124,111,255,0.25)', pulse: false, ring: false },
    recording:  { label: 'Listening...', color: '#ff6f91', glow: 'rgba(255,111,145,0.4)',  pulse: true,  ring: true  },
    processing: { label: 'Thinking...',  color: '#ffd166', glow: 'rgba(255,209,102,0.3)',  pulse: false, ring: false },
    speaking:   { label: 'Speaking...',  color: '#4fffb0', glow: 'rgba(79,255,176,0.3)',   pulse: true,  ring: false },
  }[state] || { label: 'Tap to speak', color: '#7c6fff', glow: 'rgba(124,111,255,0.25)', pulse: false, ring: false }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cfg.ring && (
          <>
            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: `1.5px solid ${cfg.color}`, opacity: 0.3, animation: 'ringPulse 1.5s ease-out infinite' }} />
            <div style={{ position: 'absolute', width: 136, height: 136, borderRadius: '50%', border: `1px solid ${cfg.color}`, opacity: 0.15, animation: 'ringPulse 1.5s ease-out infinite 0.5s' }} />
          </>
        )}
        <button
          ref={orbRef}
          onClick={onClick}
          disabled={state === 'processing' || state === 'speaking'}
          style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${cfg.color}cc, ${cfg.color}55)`,
            boxShadow: `0 0 32px ${cfg.glow}, inset 0 0 20px rgba(255,255,255,0.08)`,
            border: `1.5px solid ${cfg.color}33`,
            cursor: state === 'processing' || state === 'speaking' ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            animation: cfg.pulse ? 'orbPulse 1.2s ease-in-out infinite' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {state === 'idle' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
          {state === 'recording' && (
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'white' }} />
          )}
          {state === 'processing' && (
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid white', animation: 'spin 0.8s linear infinite' }} />
          )}
          {state === 'speaking' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          )}
        </button>
      </div>

      <p style={{ color: cfg.color, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' }}>
        {cfg.label}
      </p>

      <style>{`
        @keyframes orbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes ringPulse { 0%{transform:scale(0.9);opacity:0.4} 100%{transform:scale(1.5);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}