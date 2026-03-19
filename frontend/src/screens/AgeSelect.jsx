import React, { useEffect } from 'react'

const AGE_GROUPS = [
  { id: 'child',  label: 'Under 13',   icon: '🧒', desc: 'Kid-friendly topics and simple language' },
  { id: 'teen',   label: '13 – 17',    icon: '🎒', desc: 'School, hobbies, everyday conversations' },
  { id: 'young',  label: '18 – 25',    icon: '🎓', desc: 'College, career, social situations' },
  { id: 'adult',  label: '26 – 45',    icon: '💼', desc: 'Professional and everyday contexts' },
  { id: 'senior', label: '46 +',       icon: '🌿', desc: 'Relaxed pace, practical conversations' },
]

const LANG_CODES = { English: 'en-US', French: 'fr-FR', Hindi: 'hi-IN', Chinese: 'zh-CN', German: 'de-DE' }

const INTROS = {
  English: "Almost there! Please tell me your age group so I can personalise your experience.",
  French:  "Presque fini ! Dites-moi votre groupe d'âge pour personnaliser votre expérience.",
  Hindi:   "लगभग हो गया! अपने अनुभव को व्यक्तिगत बनाने के लिए अपना आयु समूह बताएं।",
  Chinese: "快好了！请告诉我您的年龄段，以便我为您个性化体验。",
  German:  "Fast fertig! Bitte sagen Sie mir Ihre Altersgruppe, damit ich Ihr Erlebnis personalisieren kann.",
}

function speak(text, language) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_CODES[language] || 'en-US'
  utt.rate = 0.92
  window.speechSynthesis.speak(utt)
}

export default function AgeSelect({ language = 'English', onSelect }) {
  useEffect(() => {
    setTimeout(() => speak(INTROS[language] || INTROS.English, language), 400)
  }, [])

  const handleSelect = (group) => {
    window.speechSynthesis.cancel()
    onSelect(group.id)
  }

  return (
    <div className="screen" style={{ gap: 32, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎂</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Your Age Group</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
          This helps tailor topics, vocabulary, and coaching style to you
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
        {AGE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => handleSelect(group)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <span style={{ fontSize: 26 }}>{group.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{group.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.desc}</div>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Your age is never stored or shared
      </p>
    </div>
  )
}
