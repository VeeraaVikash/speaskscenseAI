import React, { useState, useRef, useEffect } from 'react'
import VoiceOrb from '../components/VoiceOrb'
import { processText } from '../api'

const LANG_CODES = {
  English: 'en-US', French: 'fr-FR', Hindi: 'hi-IN', Chinese: 'zh-CN', German: 'de-DE'
}

const OPENING_LINES = {
  'job-interview': {
    English: "Hello! I'm Sarah, your interviewer today. What makes you the right person for this role?",
    French:  "Bonjour ! Je suis Sarah. Qu'est-ce qui vous rend parfait pour ce poste ?",
    Hindi:   "नमस्ते! मैं सारा हूं। इस भूमिका के लिए आप सही व्यक्ति क्यों हैं?",
    Chinese: "你好！我是Sarah。是什么让您成为这个职位的合适人选？",
    German:  "Hallo! Ich bin Sarah. Was macht Sie zur richtigen Person für diese Stelle?",
  },
  'business-meeting': {
    English: "Good morning! I'm Alex, leading today's meeting. Could you introduce yourself and your role?",
    French:  "Bonjour ! Je suis Alex. Pouvez-vous vous présenter et décrire votre rôle ?",
    Hindi:   "सुप्रभात! मैं एलेक्स हूं। क्या आप खुद का परिचय दे सकते हैं?",
    Chinese: "早上好！我是Alex。您能介绍一下自己和您的角色吗？",
    German:  "Guten Morgen! Ich bin Alex. Könnten Sie sich und Ihre Rolle vorstellen?",
  },
  'casual-chat': {
    English: "Hey! Oh wow, I haven't seen you in ages! How have you been? What's new?",
    French:  "Salut ! Ça fait longtemps ! Comment tu vas ? Quoi de neuf ?",
    Hindi:   "अरे! काफी समय बाद मिले! कैसे हो? क्या नया है?",
    Chinese: "嘿！好久不见！你最近怎么样？有什么新鲜事？",
    German:  "Hey! Ich habe dich ewig nicht gesehen! Wie geht es dir? Was gibt es Neues?",
  },
  'public-speaking': {
    English: "Good evening! The audience is ready and excited to hear from you. Please begin whenever you're ready.",
    French:  "Bonsoir ! Le public est prêt. Commencez quand vous voulez.",
    Hindi:   "शुभ संध्या! दर्शक तैयार हैं। जब तैयार हों शुरू करें।",
    Chinese: "晚上好！观众准备好了。请随时开始。",
    German:  "Guten Abend! Das Publikum ist bereit. Bitte beginnen Sie.",
  },
  'customer-service': {
    English: "Thank you for calling! I'm Jamie from support. How can I help you today?",
    French:  "Merci d'appeler ! Je suis Jamie du support. Comment puis-je vous aider ?",
    Hindi:   "कॉल के लिए धन्यवाद! मैं जेमी हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    Chinese: "感谢致电！我是Jamie。今天我能帮您什么？",
    German:  "Danke für Ihren Anruf! Ich bin Jamie. Wie kann ich Ihnen helfen?",
  },
  'negotiation': {
    English: "Good afternoon! I'm David from partnerships. I've reviewed your brief — please walk me through your main proposal.",
    French:  "Bonjour ! Je suis David. J'ai lu votre dossier. Présentez-moi votre proposition.",
    Hindi:   "शुभ अपराह्न! मैं डेविड हूं। आपकी ब्रीफ देखी। अपना प्रस्ताव रखें।",
    Chinese: "下午好！我是David。我看过您的简报。请介绍您的主要提案。",
    German:  "Guten Tag! Ich bin David. Ich habe Ihr Briefing gelesen. Bitte stellen Sie Ihren Vorschlag vor.",
  },
}

function speak(text, language, onEnd) {
  if (!window.speechSynthesis) { onEnd && onEnd(); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_CODES[language] || 'en-US'
  utt.rate = 0.92
  utt.onend  = () => onEnd && onEnd()
  utt.onerror = () => onEnd && onEnd()
  window.speechSynthesis.speak(utt)
}

// Speak a word slowly for pronunciation practice
function speakWord(word, language) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(word)
  utt.lang = LANG_CODES[language] || 'en-US'
  utt.rate = 0.6   // slower for pronunciation demo
  utt.pitch = 1
  window.speechSynthesis.speak(utt)
}

function ScoreRing({ score, label, color }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--surface2)" strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 34 34)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="34" y="38" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{score}</text>
      </svg>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}

// Extract tricky words from pronunciation tip for replay buttons
function extractKeyWords(tip = '') {
  // Match words in quotes, or capitalised words
  const quoted = [...tip.matchAll(/"([^"]+)"|'([^']+)'/g)].map(m => m[1] || m[2])
  if (quoted.length > 0) return quoted.slice(0, 3)
  // Fallback: pick words longer than 6 chars
  return tip.split(' ').filter(w => w.replace(/[^a-zA-Z]/g, '').length > 6).slice(0, 3)
}

export default function Chat({ scenario, scenarioLabel, level, language = 'English', onFinish }) {
  const [orbState, setOrbState]       = useState('speaking')
  const [messages, setMessages]       = useState([])
  const [liveText, setLiveText]       = useState('')
  const [coaching, setCoaching]       = useState(null)
  const [scores, setScores]           = useState([])
  const [turnCount, setTurnCount]     = useState(0)
  const [textInput, setTextInput]     = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [activeTab, setActiveTab]     = useState('correction')
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const recognitionRef  = useRef(null)
  const finalTextRef    = useRef('')
  const scrollRef       = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, liveText])

  useEffect(() => {
    const timer = setInterval(() => setSessionTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const opening = OPENING_LINES[scenario]?.[language]
      || OPENING_LINES[scenario]?.English
      || `Hello! Let's practice ${scenarioLabel}.`
    setMessages([{ role: 'ai', text: opening }])
    speak(opening, language, () => setOrbState('idle'))
  }, [])

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setShowTextInput(true); setOrbState('idle'); return }
    const recognition = new SR()
    recognition.lang = LANG_CODES[language] || 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    finalTextRef.current = ''

    recognition.onresult = (e) => {
      let final = '', interim = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      finalTextRef.current = final.trim()
      setLiveText(final + interim)
    }
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') { setShowTextInput(true); setOrbState('idle') }
    }
    recognition.start()
    recognitionRef.current = recognition
    setOrbState('recording')
    setLiveText('')
    finalTextRef.current = ''
  }

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    const spokenText = finalTextRef.current || liveText.trim()
    if (!spokenText) { setOrbState('idle'); setLiveText(''); return }
    await submitText(spokenText)
  }

  const submitText = async (text) => {
    setOrbState('processing')
    setLiveText('')
    try {
      const conversationHistory = messages.map(msg => ({ role: msg.role, text: msg.text }))
      const result = await processText(text, scenario, level, language, conversationHistory)
      applyResult(result, text)
    } catch (err) {
      console.error('Submit error:', err)
      setOrbState('idle')
    }
  }

  const applyResult = (result, spokenText) => {
    const userText = spokenText || result.transcript || ''
    const aiText   = result.response || "Interesting! Please tell me more."

    const cleanText = (text) => {
      if (!text) return "Let's continue!"
      return text
        .replace(/out of credits.*/gi, '')
        .replace(/API key.*/gi, '')
        .trim() || "Let's continue!"
    }

    const rawScores = result?.scores || {}
    const realScores = {
      grammar:      typeof rawScores.grammar === 'number'      ? Math.max(0, Math.min(100, rawScores.grammar))      : 50,
      fluency:      typeof rawScores.fluency === 'number'      ? Math.max(0, Math.min(100, rawScores.fluency))      : 50,
      pronunciation: typeof rawScores.pronunciation === 'number' ? Math.max(0, Math.min(100, rawScores.pronunciation)) : 50,
    }

    setMessages(prev => [...prev,
      { role: 'user', text: userText },
      { role: 'ai',   text: cleanText(aiText) }
    ])
    setCoaching({ ...result, scores: realScores })
    setScores(prev => [...prev, realScores])
    setTurnCount(t => t + 1)
    setActiveTab('correction')
    setOrbState('speaking')
    speak(cleanText(aiText), language, () => setOrbState('idle'))
  }

  const handleOrbClick = () => {
    if (orbState === 'idle') startListening()
    else if (orbState === 'recording') stopListening()
  }

  const handleTextSubmit = async () => {
    const text = textInput.trim()
    if (!text) return
    setTextInput('')
    await submitText(text)
  }

  const handleFinishClick = () => {
    if (turnCount === 0) return   // nothing to finish
    setShowFinishConfirm(true)
  }

  const latestScores = scores.length > 0 ? scores[scores.length - 1] : null
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, sc) => s + (0.33 * sc.grammar + 0.33 * sc.fluency + 0.34 * sc.pronunciation), 0) / scores.length)
    : null

  const keyWords = coaching ? extractKeyWords(coaching.pronunciation_tip) : []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 540, margin: '0 auto', padding: '14px 16px 40px', gap: 10 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scenario · {level}</p>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{scenarioLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-head)' }}>{formatTime(sessionTime)}</span>
          {avgScore !== null && <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>Avg: {avgScore}</span>}
          {/* Finish button — always visible after 1 turn */}
          {turnCount >= 1 && (
            <button
              className="btn-ghost"
              style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={handleFinishClick}
            >
              Finish
            </button>
          )}
        </div>
      </div>

      {/* Finish confirmation modal */}
      {showFinishConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 20, marginBottom: 8 }}>🏁 End Session?</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              You've completed {turnCount} turn{turnCount !== 1 ? 's' : ''}. Your results and daily tasks are ready.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowFinishConfirm(false)}
              >
                Keep Going
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={onFinish}
              >
                See Results →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                color: 'var(--text)', fontSize: 14, lineHeight: 1.5,
              }}>
                {msg.role === 'ai' && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 3 }}>AI Coach</span>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live transcript */}
      <div style={{
        minHeight: 56,
        background: orbState === 'recording' ? 'rgba(255,111,145,0.05)' : 'var(--surface)',
        border: `1px solid ${orbState === 'recording' ? 'rgba(255,111,145,0.4)' : 'var(--border)'}`,
        borderRadius: 12, padding: '10px 14px', transition: 'all 0.3s',
      }}>
        {liveText ? (
          <>
            <p style={{ fontSize: 10, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>You're saying</p>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{liveText}</p>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {orbState === 'recording'   ? '🎤 Listening... tap mic to stop'
            : orbState === 'speaking'   ? '🔊 AI Coach is speaking...'
            : orbState === 'processing' ? '⏳ Analysing your response...'
            : 'Tap the mic and speak naturally'}
          </p>
        )}
      </div>

      {/* Orb */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
        <VoiceOrb state={orbState} onClick={handleOrbClick} />
      </div>

      {/* Text fallback */}
      {showTextInput && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Type your response..."
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
          <button className="btn-primary" style={{ padding: '10px 18px' }} onClick={handleTextSubmit}>→</button>
        </div>
      )}

      {/* Score rings */}
      {latestScores && (
        <div style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '14px 10px',
        }}>
          <ScoreRing score={latestScores.grammar}      label="Grammar"       color="var(--success)" />
          <ScoreRing score={latestScores.fluency}      label="Fluency"       color="var(--warning)" />
          <ScoreRing score={latestScores.pronunciation} label="Pronunciation" color="var(--accent)" />
        </div>
      )}

      {/* Coaching tabs */}
      {coaching && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['correction', 'pronunciation', 'tips'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                background: activeTab === tab ? 'rgba(124,111,255,0.15)' : 'var(--surface)',
                border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'var(--border)'}`,
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {tab === 'correction' ? '✏️ Correction' : tab === 'pronunciation' ? '🗣️ Pronunciation' : '💡 Tips'}
              </button>
            ))}
          </div>

          {/* Correction tab */}
          {activeTab === 'correction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Correction</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'good',   label: '✓ GOOD',  color: 'var(--success)' },
                    { key: 'better', label: '↑ BETTER', color: 'var(--warning)' },
                    { key: 'best',   label: '★ BEST',   color: 'var(--accent)'  },
                  ].map(({ key, label, color }, idx) => (
                    <div key={key} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none', paddingTop: idx > 0 ? 8 : 0 }}>
                      <p style={{ fontSize: 10, color, marginBottom: 3, fontWeight: 700 }}>{label}</p>
                      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{coaching[key]}</p>
                    </div>
                  ))}
                  {coaching.explanation && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{coaching.explanation}</p>
                    </div>
                  )}
                </div>
              </div>

              {coaching.tone_feedback && (
                <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
                  <p style={{ fontSize: 10, color: 'var(--warning)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tone & Register</p>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{coaching.tone_feedback}</p>
                </div>
              )}

              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Communication Checklist</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {[
                    { key: 'intent',     label: 'Clear Intent' },
                    { key: 'details',    label: 'Good Detail' },
                    { key: 'politeness', label: 'Right Tone' },
                    { key: 'clarity',    label: 'Easy to Understand' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: coaching.task_checklist?.[item.key] ? 'rgba(79,255,176,0.2)' : 'rgba(255,107,107,0.2)',
                        border: `1px solid ${coaching.task_checklist?.[item.key] ? 'var(--success)' : 'var(--error)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: coaching.task_checklist?.[item.key] ? 'var(--success)' : 'var(--error)',
                      }}>
                        {coaching.task_checklist?.[item.key] ? '✓' : '✗'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {coaching.task_feedback && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{coaching.task_feedback}</p>}
              </div>
            </div>
          )}

          {/* Pronunciation tab — enhanced */}
          {activeTab === 'pronunciation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🗣️ Pronunciation Tip</p>
                <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>
                  {coaching.pronunciation_tip || "Focus on speaking each word clearly and at a steady pace."}
                </p>

                {/* Replay buttons for key words */}
                {keyWords.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>🔊 Tap to hear the correct pronunciation:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {keyWords.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => speakWord(word, language)}
                          style={{
                            background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.3)',
                            borderRadius: 8, padding: '6px 12px', color: 'var(--accent)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          🔈 {word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
                <p style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fluency Note</p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                  {coaching.fluency_note || "Your sentence flow is developing well."}
                </p>
              </div>

              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pronunciation Score</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${coaching.scores?.pronunciation || 50}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-head)' }}>
                    {coaching.scores?.pronunciation || 50}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {(coaching.scores?.pronunciation || 50) >= 80 ? '🌟 Excellent pronunciation!'
                    : (coaching.scores?.pronunciation || 50) >= 60 ? '👍 Good — keep practicing key sounds'
                    : '💪 Focus on the sounds highlighted above'}
                </p>

                {/* Practice the full best sentence */}
                {coaching.best && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Practice saying the ideal version:</p>
                    <button
                      onClick={() => speak(coaching.best, language)}
                      style={{
                        width: '100%', background: 'rgba(124,111,255,0.08)',
                        border: '1px solid rgba(124,111,255,0.2)', borderRadius: 10,
                        padding: '10px 14px', color: 'var(--text)', fontSize: 13,
                        lineHeight: 1.5, cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      🔊 "{coaching.best}"
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coaching.mid_guidance && (
                <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
                  <p style={{ fontSize: 10, color: 'var(--success)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>💡 Next Reply Tip</p>
                  <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{coaching.mid_guidance}</p>
                </div>
              )}
              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level Goal — {level}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                  {level === 'Beginner'
                    ? '🎯 Focus on complete sentences. Add one extra detail to every reply.'
                    : level === 'Intermediate'
                    ? '🎯 Use more varied vocabulary. Give specific examples in your answers.'
                    : '🎯 Focus on precision and nuance. Show mastery of tone and register.'}
                </p>
              </div>
              <div className="card">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session Stats</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'Turns',     value: turnCount,              color: 'var(--accent)' },
                    { label: 'Avg Score', value: avgScore || '—',        color: 'var(--success)' },
                    { label: 'Time',      value: formatTime(sessionTime), color: 'var(--warning)' },
                  ].map((stat, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', background: 'var(--surface2)', borderRadius: 10, padding: '10px 8px' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-head)' }}>{stat.value}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
