import React, { useEffect } from 'react'

const LANGUAGES = [
  {
    code: 'English', label: 'English', flag: '🇬🇧',
    welcome: "Hello! I'm SpeakScense, your AI communication coach. Let's begin!",
    sub: 'Practice communication in English'
  },
  {
    code: 'French', label: 'Français', flag: '🇫🇷',
    welcome: "Bonjour ! Je suis SpeakScense, votre coach en communication. Commençons !",
    sub: 'Pratiquez la communication en français'
  },
  {
    code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳',
    welcome: "नमस्ते! मैं SpeakScense हूँ, आपका AI कोच। शुरू करते हैं!",
    sub: 'हिन्दी में संवाद का अभ्यास करें'
  },
  {
    code: 'Chinese', label: '中文', flag: '🇨🇳',
    welcome: "你好！我是SpeakScense，您的AI沟通教练。让我们开始吧！",
    sub: '用中文练习沟通技巧'
  },
  {
    code: 'German', label: 'Deutsch', flag: '🇩🇪',
    welcome: "Hallo! Ich bin SpeakScense, Ihr KI-Kommunikationscoach. Fangen wir an!",
    sub: 'Kommunikation auf Deutsch üben'
  },
]

const LANG_CODES = { English: 'en-US', French: 'fr-FR', Hindi: 'hi-IN', Chinese: 'zh-CN', German: 'de-DE' }

function speak(text, langCode) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = langCode || 'en-US'
  utt.rate = 0.92
  window.speechSynthesis.speak(utt)
}

export default function LanguageSelect({ onSelect }) {
  useEffect(() => {
    setTimeout(() => speak("Welcome to SpeakScense. Please choose your language.", 'en-US'), 500)
  }, [])

  const handleSelect = (lang) => {
    window.speechSynthesis.cancel()
    speak(lang.welcome, LANG_CODES[lang.code])
    setTimeout(() => onSelect(lang.code), 200)
  }

  return (
    <div className="screen" style={{ gap: 32, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Choose Your Language</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Your entire session will be in this language
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => handleSelect(lang)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <span style={{ fontSize: 28 }}>{lang.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{lang.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang.sub}</div>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}