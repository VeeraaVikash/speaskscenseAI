const BASE_URL = 'http://localhost:8000'

export async function processAudio(audioBlob, scenario, level, language = 'English') {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('scenario', scenario)
  formData.append('level', level)
  formData.append('language', language)

  const res = await fetch(`${BASE_URL}/process-audio`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Audio processing failed')
  return res.json()
}

export async function processText(text, scenario, level, language = 'English', conversationHistory = []) {
  const res = await fetch(`${BASE_URL}/process-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text, 
      scenario, 
      level, 
      language,
      conversation_history: conversationHistory
    }),
  })
  if (!res.ok) throw new Error('Text processing failed')
  return res.json()
}

export async function detectLevel(responses) {
  const res = await fetch(`${BASE_URL}/detect-level`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  })
  if (!res.ok) throw new Error('Level detection failed')
  return res.json()
}

export async function getSessionSummary() {
  const res = await fetch(`${BASE_URL}/session-summary`)
  if (!res.ok) throw new Error('Summary fetch failed')
  return res.json()
}

export async function getDailyTasks(level = 'Intermediate', scenario = 'General') {
  const res = await fetch(`${BASE_URL}/daily-tasks?level=${level}&scenario=${scenario}`)
  if (!res.ok) throw new Error('Tasks fetch failed')
  return res.json()
}