import { useState } from 'react'
import { CameraScreen } from './screens/CameraScreen'
import { FrameScreen } from './screens/FrameScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ResultScreen } from './screens/ResultScreen'
import type { FrameId, PhotoSession, Screen } from './types'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedFrame, setSelectedFrame] = useState<FrameId>('lime')
  const [session, setSession] = useState<PhotoSession | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)

  function restart() {
    setSession(null)
    setSelectedFrame('lime')
    setScreen('home')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen onStart={() => setScreen('frames')} />}
      {screen === 'frames' && (
        <FrameScreen selected={selectedFrame} onSelect={setSelectedFrame} onContinue={() => setScreen('preparing')} />
      )}
      {(screen === 'preparing' || screen === 'shooting') && (
        <CameraScreen
          key={cameraAttempt}
          isShooting={screen === 'shooting'}
          onReady={() => setScreen('shooting')}
          onComplete={(photos) => {
            setSession({ frame: selectedFrame, photos })
            setScreen('result')
          }}
          onRetry={() => {
            setScreen('preparing')
            setCameraAttempt((attempt) => attempt + 1)
          }}
        />
      )}
      {screen === 'result' && session && <ResultScreen session={session} onRestart={restart} />}
    </div>
  )
}

export default App
