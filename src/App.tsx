import { useState } from 'react'
import { CameraScreen } from './screens/CameraScreen'
import { FrameScreen } from './screens/FrameScreen'
import { FrameTypeScreen } from './screens/FrameTypeScreen'
import { HomeScreen } from './screens/HomeScreen'
import { MobilePhotoScreen } from './screens/MobilePhotoScreen'
import { ResultScreen } from './screens/ResultScreen'
import { FRAMES, type FrameId, type FrameTypeId, type PhotoSession, type Screen } from './types'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedFrame, setSelectedFrame] = useState<FrameId | null>(null)
  const [selectedType, setSelectedType] = useState<FrameTypeId | null>(null)
  const [session, setSession] = useState<PhotoSession | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)
  const [uploadConsent, setUploadConsent] = useState(false)

  const photoRoute = window.location.pathname.match(/^\/photo\/([^/]*)\/?$/)
  if (photoRoute) return <MobilePhotoScreen token={photoRoute[1]} />

  function restart() {
    setSession(null)
    setSelectedFrame(null)
    setSelectedType(null)
    setUploadConsent(false)
    setScreen('home')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen onStart={() => setScreen('frame-types')} />}
      {screen === 'frame-types' && (
        <FrameTypeScreen
          onBack={() => setScreen('home')}
          onSelect={(type) => {
            const options = FRAMES.filter((frame) => frame.typeId === type)
            if (!options.length) return
            setSelectedType(type)
            setSelectedFrame(null)
            setScreen('frames')
          }}
        />
      )}
      {screen === 'frames' && selectedType && (
        <FrameScreen
          type={selectedType}
          selected={selectedFrame}
          onSelect={setSelectedFrame}
          onBack={() => {
            setSelectedFrame(null)
            setSelectedType(null)
            setScreen('frame-types')
          }}
          onContinue={() => {
            if (selectedFrame !== null) {
              setUploadConsent(true)
              setScreen('preparing')
            }
          }}
        />
      )}
      {(screen === 'preparing' || screen === 'shooting') && selectedFrame !== null && (
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
