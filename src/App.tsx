import { useState } from 'react'
import { CameraScreen } from './screens/CameraScreen'
import { FrameScreen } from './screens/FrameScreen'
import { HomeScreen } from './screens/HomeScreen'
import { MobilePhotoScreen } from './screens/MobilePhotoScreen'
import { ResultScreen } from './screens/ResultScreen'
import type { FrameId, PhotoSession, Screen } from './types'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedFrame, setSelectedFrame] = useState<FrameId>('lime')
  const [session, setSession] = useState<PhotoSession | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)
  const [uploadConsent, setUploadConsent] = useState(false)

  const photoRoute = window.location.pathname.match(/^\/photo\/([^/]*)\/?$/)
  if (photoRoute) return <MobilePhotoScreen token={photoRoute[1]} />

  function restart() {
    setSession(null)
    setSelectedFrame('lime')
    setUploadConsent(false)
    setScreen('home')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen onStart={() => setScreen('frames')} />}
      {screen === 'frames' && (
        <FrameScreen
          selected={selectedFrame}
          uploadConsent={uploadConsent}
          onSelect={setSelectedFrame}
          onUploadConsentChange={setUploadConsent}
          onContinue={() => setScreen('preparing')}
        />
      )}
      {(screen === 'preparing' || screen === 'shooting') && (
        <CameraScreen
          key={cameraAttempt}
          frame={selectedFrame}
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
      {screen === 'result' && session && (
        <ResultScreen session={session} uploadConsent={uploadConsent} onRestart={restart} />
      )}
    </div>
  )
}

export default App
