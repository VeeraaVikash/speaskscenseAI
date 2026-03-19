import React, { useState } from 'react'
import Welcome from './screens/Welcome'
import LanguageSelect from './screens/LanguageSelect'
import AgeSelect from './screens/AgeSelect'
import LevelTest from './screens/LevelTest'
import Scenario from './screens/Scenario'
import Chat from './screens/Chat'
import Result from './screens/Result'
import EndDay from './screens/EndDay'

const SCREENS = {
  WELCOME: 'welcome',
  LANGUAGE: 'language',
  AGE: 'age',
  LEVEL_TEST: 'level_test',
  SCENARIO: 'scenario',
  CHAT: 'chat',
  RESULT: 'result',
  END_DAY: 'end_day',
}

// Which screen to go back to from each screen
const BACK_MAP = {
  [SCREENS.LANGUAGE]: SCREENS.WELCOME,
  [SCREENS.AGE]: SCREENS.LANGUAGE,
  [SCREENS.LEVEL_TEST]: SCREENS.AGE,
  [SCREENS.SCENARIO]: SCREENS.LEVEL_TEST,
  [SCREENS.CHAT]: SCREENS.SCENARIO,
  [SCREENS.RESULT]: null,   // no back from result
  [SCREENS.END_DAY]: null,   // no back from end day
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [level, setLevel] = useState('Intermediate')
  const [language, setLanguage] = useState('English')
  const [age, setAge] = useState(null)
  const [scenario, setScenario] = useState('casual-chat')
  const [scenarioLabel, setScenarioLabel] = useState('Casual Chat')

  const goBack = () => {
    const prev = BACK_MAP[screen]
    if (prev) setScreen(prev)
  }

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    setScreen(SCREENS.AGE)
  }

  const handleAgeSelect = (selectedAge) => {
    setAge(selectedAge)
    setScreen(SCREENS.LEVEL_TEST)
  }

  const handleLevelDetected = (detectedLevel) => {
    setLevel(detectedLevel)
    setScreen(SCREENS.SCENARIO)
  }

  const handleScenarioSelect = (id, label) => {
    setScenario(id)
    setScenarioLabel(label)
    setScreen(SCREENS.CHAT)
  }

  const handleFinishChat = () => setScreen(SCREENS.RESULT)
  const handleEndDay = () => setScreen(SCREENS.END_DAY)

  const handleRestart = () => {
    setLevel('Intermediate')
    setLanguage('English')
    setAge(null)
    setScenario('casual-chat')
    setScenarioLabel('Casual Chat')
    setScreen(SCREENS.WELCOME)
  }

  const canGoBack = !!BACK_MAP[screen]

  return (
    <div style={{ position: 'relative' }}>
      {/* Global back button */}
      {canGoBack && (
        <button
          onClick={goBack}
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 100,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '8px 14px',
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ← Back
        </button>
      )}

      {screen === SCREENS.WELCOME && (
        <Welcome onStart={() => setScreen(SCREENS.LANGUAGE)} />
      )}
      {screen === SCREENS.LANGUAGE && (
        <LanguageSelect onSelect={handleLanguageSelect} />
      )}
      {screen === SCREENS.AGE && (
        <AgeSelect language={language} onSelect={handleAgeSelect} />
      )}
      {screen === SCREENS.LEVEL_TEST && (
        <LevelTest language={language} age={age} onLevelDetected={handleLevelDetected} />
      )}
      {screen === SCREENS.SCENARIO && (
        <Scenario level={level} language={language} onSelect={handleScenarioSelect} />
      )}
      {screen === SCREENS.CHAT && (
        <Chat
          scenario={scenario}
          scenarioLabel={scenarioLabel}
          level={level}
          language={language}
          onFinish={handleFinishChat}
        />
      )}
      {screen === SCREENS.RESULT && (
        <Result language={language} onEndDay={handleEndDay} />
      )}
      {screen === SCREENS.END_DAY && (
        <EndDay level={level} scenario={scenarioLabel} language={language} onRestart={handleRestart} />
      )}
    </div>
  )
}