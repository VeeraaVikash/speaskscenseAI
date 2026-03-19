import React, { useState } from 'react'
import Welcome from './screens/Welcome'
import LanguageSelect from './screens/LanguageSelect'
import LevelTest from './screens/LevelTest'
import Scenario from './screens/Scenario'
import Chat from './screens/Chat'
import Result from './screens/Result'
import EndDay from './screens/EndDay'

const SCREENS = {
  WELCOME: 'welcome',
  LANGUAGE: 'language',
  LEVEL_TEST: 'level_test',
  SCENARIO: 'scenario',
  CHAT: 'chat',
  RESULT: 'result',
  END_DAY: 'end_day',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [level, setLevel] = useState('Intermediate')
  const [language, setLanguage] = useState('English')
  const [scenario, setScenario] = useState('general')
  const [scenarioLabel, setScenarioLabel] = useState('General')

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
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
    setScenario('general')
    setScenarioLabel('General')
    setScreen(SCREENS.WELCOME)
  }

  return (
    <>
      {screen === SCREENS.WELCOME && (
        <Welcome onStart={() => setScreen(SCREENS.LANGUAGE)} />
      )}
      {screen === SCREENS.LANGUAGE && (
        <LanguageSelect onSelect={handleLanguageSelect} />
      )}
      {screen === SCREENS.LEVEL_TEST && (
        <LevelTest language={language} onLevelDetected={handleLevelDetected} />
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
    </>
  )
}