import { useState } from 'react'
import { AppMode } from './types'
import { YoonahRoom } from './components/YoonahRoom/YoonahRoom'
import { BookIntro } from './components/BookIntro/BookIntro'
import './App.css'

function App() {
  const [mode, setMode] = useState<AppMode>('daily')
  const [showIntro, setShowIntro] = useState(true)

  if (showIntro) {
    return (
      <div className="app">
        <BookIntro onComplete={() => setShowIntro(false)} />
      </div>
    )
  }

  return (
    <div className="app">
      <YoonahRoom mode={mode} onModeChange={setMode} />
    </div>
  )
}

export default App
