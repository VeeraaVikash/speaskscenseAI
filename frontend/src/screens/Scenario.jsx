import React, { useEffect } from 'react'

const SCENARIOS = [
  { id: 'job-interview', label: 'Job Interview', icon: '💼', desc: 'Practice confident interview answers' },
  { id: 'business-meeting', label: 'Business Meeting', icon: '🤝', desc: 'Lead and contribute in meetings' },
  { id: 'casual-chat', label: 'Casual Chat', icon: '☕', desc: 'Relaxed everyday conversation' },
  { id: 'public-speaking', label: 'Public Speaking', icon: '🎤', desc: 'Address a crowd or team' },
  { id: 'customer-service', label: 'Customer Service', icon: '📞', desc: 'Handle inquiries professionally' },
  { id: 'negotiation', label: 'Negotiation', icon: '⚖️', desc: 'Persuade and reach agreements' },
]

const LANG_CODES = { English: 'en-US', French: 'fr-FR', Hindi: 'hi-IN' }

const INTROS = {
  English: "Excellent! Now choose a scenario you'd like to practice today.",
  French: "Excellent ! Maintenant choisissez un scénario que vous souhaitez pratiquer aujourd'hui.",
  Hindi: "बहुत बढ़िया! अब वह परिदृश्य चुनें जिसे आप आज अभ्यास करना चाहते हैं।"
}

function speak(text, language) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_CODES[language] || 'en-US'
  utt.rate = 0.92
  window.speechSynthesis.speak(utt)
}

export default function Scenario({ level, language = 'English', onSelect }) {
  const levelColors = { Beginner: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--accent)' }

  useEffect(() => {
    setTimeout(() => speak(INTROS[language] || INTROS.English, language), 400)
  }, [])

  const handleSelect = (id, label) => {
    window.speechSynthesis.cancel()
    const msg = {
      English: `Great choice! Let's practice ${label}. I'll speak first, then it's your turn. Ready? Let's begin!`,
      French: `Excellent choix ! Pratiquons ${label}. Je parle en premier, puis c'est votre tour. Prêt ? Commençons !`,
      Hindi: `बढ़िया चुनाव! चलिए ${label} का अभ्यास करते हैं। पहले मैं बोलूंगा, फिर आपकी बारी। तैयार हैं? शुरू करते हैं!`
    }
    speak(msg[language] || msg.English, language)
    setTimeout(() => onSelect(id, label), 300)
  }

  return (
    <div className="screen" style={{ gap: 28, maxWidth: 520, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 50, background: `${levelColors[level] || 'var(--accent)'}22`, color: levelColors[level] || 'var(--accent)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          Level: {level}
        </span>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Choose a Scenario</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Pick a context for your practice session</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => handleSelect(s.id, s.label)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 14px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}