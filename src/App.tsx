import { useState } from 'react'
import { AppMode } from './types'
import { YoonahRoom } from './components/YoonahRoom/YoonahRoom'
import './App.css'

function App() {
  const [mode, setMode] = useState<AppMode>('daily')

  return (
    <div className="app">
      <YoonahRoom mode={mode} onModeChange={setMode} />
    </div>
  )
}

export default App
