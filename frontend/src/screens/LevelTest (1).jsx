import React, { useState, useRef, useEffect } from 'react'
import VoiceOrb from '../components/VoiceOrb'
import { detectLevel } from '../api'

const QUESTIONS = {
  English: [
    "What is your name and what do you do?",
    "Tell me about something interesting that happened to you recently.",
    "Why do you want to improve your speaking, and what topics interest you most?"
  ],
  French: [
    "Quel est votre nom et que faites-vous ?",
    "Parlez-moi de quelque chose d'intéressant qui vous est récemment arrivé.",
    "Pourquoi voulez-vous améliorer votre expression orale ?"
  ],
  Hindi: [
    "आपका नाम क्या है और आप क्या करते हैं?",
    "हाल ही में आपके साथ कुछ रोचक हुआ हो तो बताइए।",
    "आप अपनी बोलने की क्षमता क्यों सुधारना चाहते हैं?"
  ],
  Chinese: [
    "你叫什么名字，你是做什么的？",
    "告诉我最近发生在你身上的一件有趣的事。",
    "你为什么想提高你的口语能力？"
  ],
  German: [
    "Wie heißen Sie und was machen Sie?",
    "Erzählen Sie mir von etwas Interessantem, das Ihnen kürzlich passiert ist.",
    "Warum möchten Sie Ihr Sprechen verbessern?"
  ],
}

const INTROS = {
  English: "Hi! I'll ask you 3 questions to gauge your level. Speak as naturally as you can — longer answers help me assess you better.",
  French:  "Bonjour ! Je vais vous poser 3 questions pour évaluer votre niveau. Répondez aussi naturellement que possible.",
  Hindi:   "नमस्ते! मैं आपका स्तर जानने के लिए 3 सवाल पूछूंगा। जितना स्वाभाविक हो उतना बोलें।",
  Chinese: "你好！我会问你3个问题来评估你的水平。请尽量自然地回答。",
  German:  "Hallo! Ich stelle Ihnen 3 Fragen, um Ihr Niveau einzuschätzen. Antworten Sie so natürlich wie möglich.",
}

const LANG_CODES = {
  English: 'en-US', French: 'fr-FR', Hindi: 'hi-IN', Chinese: 'zh-CN', German: 'de-DE'
}

function speak(text, language, onEnd) {
  if (!window.speechSynthesis) { onEnd && onEnd(); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_CODES[language] || 'en-US'
  utt.rate = 0.9
  if (onEnd) utt.onend = onEnd
  utt.onerror = () => onEnd && onEnd()
  window.speechSynthesis.speak(utt)
}

export default function LevelTest({ language = 'English', age = null, onLevelDetected }) {
  const [step, setStep]         = useState(0)
  const [orbState, setOrbState] = useState('speaking')
  const [status, setStatus]     = useState('Listen...')
  const [liveText, setLiveText] = useState('')
  const [error, setError]       = useState('')
  const [minLength, setMinLength] = useState(false)   // nudge for short answers
  const recognitionRef    = useRef(null)
  const answersRef        = useRef([])
  const currentAnswerRef  = useRef('')
  const questions = QUESTIONS[language] || QUESTIONS.English

  useEffect(() => {
    const intro = INTROS[language] || INTROS.English
    speak(`${intro} First question: ${questions[0]}`, language, () => {
      setOrbState('idle')
      setStatus('Tap mic to answer')
    })
  }, [])

  const speakQuestion = (index) => {
    setOrbState('speaking')
    setStatus('Listen...')
    setLiveText('')
    setMinLength(false)
    currentAnswerRef.current = ''
    speak(`Question ${index + 1}: ${questions[index]}`, language, () => {
      setOrbState('idle')
      setStatus('Tap mic to answer')
    })
  }

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Please use Chrome or Edge for voice recognition.')
      return
    }
    const recognition = new SR()
    recognition.lang = LANG_CODES[language] || 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    currentAnswerRef.current = ''

    recognition.onresult = (e) => {
      let final = '', interim = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      currentAnswerRef.current = final
      setLiveText(final + interim)
      // Nudge if very short
      setMinLength((final + interim).trim().split(' ').length >= 5)
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Microphone blocked. Allow mic access in browser.')
      else if (e.error !== 'no-speech') setError(`Error: ${e.error}`)
    }

    recognition.start()
    recognitionRef.current = recognition
    setOrbState('recording')
    setStatus('Speak now... tap mic when done')
    setLiveText('')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    const answer = currentAnswerRef.current.trim() || liveText.trim() || '(no answer)'
    answersRef.current = [...answersRef.current, answer]

    setOrbState('processing')
    setStatus('Got it!')
    setTimeout(() => handleAnswerDone(), 500)
  }

  const handleAnswerDone = async () => {
    const allAnswers = answersRef.current
    if (allAnswers.length < questions.length) {
      speakQuestion(allAnswers.length)
      setStep(allAnswers.length)
    } else {
      try {
        setStatus('Analysing your answers...')
        setOrbState('processing')

        // Pass age context to backend for better calibration
        const result = await detectLevel(allAnswers, language, age)

        // Validate — don't blindly trust 'Beginner' if answers were long/detailed
        let detectedLevel = result.level || 'Intermediate'
        const totalWords = allAnswers.join(' ').trim().split(/\s+/).length
        const avgWords   = totalWords / allAnswers.length

        // Override rule: if avg answer length > 15 words but API returned Beginner,
        // bump to Intermediate (prevents always-Beginner bug from short LLM context)
        if (detectedLevel === 'Beginner' && avgWords > 15) {
          console.warn(`Level override: avg ${avgWords.toFixed(1)} words/answer — upgrading Beginner → Intermediate`)
          detectedLevel = 'Intermediate'
        }

        const msgs = {
          English: `Based on your answers, your level is ${detectedLevel}. Now let's choose a scenario.`,
          French:  `D'après vos réponses, votre niveau est ${detectedLevel}. Choisissons un scénario.`,
          Hindi:   `आपके जवाबों के आधार पर, आपका स्तर ${detectedLevel} है। अब एक परिदृश्य चुनते हैं।`,
          Chinese: `根据您的回答，您的水平是${detectedLevel}。现在选择一个场景。`,
          German:  `Basierend auf Ihren Antworten ist Ihr Niveau ${detectedLevel}. Wählen wir ein Szenario.`,
        }

        setOrbState('speaking')
        setStatus(`Your level: ${detectedLevel}`)
        speak(msgs[language] || msgs.English, language, () => {
          onLevelDetected(detectedLevel, result)
        })
      } catch (err) {
        console.error('Level detection failed:', err)
        setError('Detection failed. Defaulting to Intermediate.')
        onLevelDetected('Intermediate', {})
      }
    }
  }

  const handleOrbClick = () => {
    if (orbState === 'idle') startRecording()
    else if (orbState === 'recording') stopRecording()
  }

  return (
    <div className="screen" style={{ gap: 24, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ width: '100%' }}>
        <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Level Check · {step + 1} of {questions.length}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              flex: 1, maxWidth: 60, height: 3, borderRadius: 2,
              background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 14
        }}>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text)' }}>
            {questions[step]}
          </p>
        </div>

        {/* Short answer nudge */}
        {orbState === 'recording' && !minLength && liveText.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 8 }}>
            💬 Try to speak a bit more for a better assessment
          </p>
        )}

        <div style={{
          minHeight: 70,
          background: orbState === 'recording' ? 'rgba(255,111,145,0.05)' : 'var(--surface2)',
          border: `1px solid ${orbState === 'recording' ? 'rgba(255,111,145,0.4)' : 'var(--border)'}`,
          borderRadius: 12, padding: '12px 16px',
          transition: 'all 0.3s', textAlign: 'left',
        }}>
          {liveText ? (
            <>
              <p style={{ fontSize: 10, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
                You said
              </p>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{liveText}</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {orbState === 'recording'
                ? '🎤 Listening... your words appear here'
                : 'Your answer will appear here when you speak'}
            </p>
          )}
        </div>
      </div>

      <VoiceOrb state={orbState} onClick={handleOrbClick} />

      <p style={{ fontSize: 13, color: orbState === 'recording' ? 'var(--accent2)' : 'var(--text-muted)' }}>
        {status}
      </p>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--error)', background: 'rgba(255,107,107,0.1)', padding: '8px 14px', borderRadius: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
