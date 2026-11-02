import { Mascot } from '../components/Mascot'
import { useCameraSession } from '../hooks/useCameraSession'

const SHOT_CHARACTERS = [
  '/assets/figma-mascot.png',
  '/assets/figma-shot-2.png',
  '/assets/figma-shot-3.png',
  '/assets/figma-shot-4.png',
] as const

interface CameraScreenProps {
  isShooting: boolean
  onReady: () => void
  onComplete: (photos: string[]) => void
  onRetry: () => void
}

export function CameraScreen({ isShooting, onReady, onComplete, onRetry }: CameraScreenProps) {
  const { videoRef, status, error, shotNumber, countdown, flash } = useCameraSession(
    isShooting, onReady, onComplete,
  )

  return (
    <main className={`screen camera-screen${isShooting && status === 'ready' ? ' camera-screen--shooting' : ''}`}>
      <div className="camera-screen__content">
        {status === 'error' ? (
          <div className="camera-message" role="alert">
            <Mascot size="loading" />
            <h1>카메라를 연결할 수 없어요</h1>
            <p>{error}</p>
            <button className="primary-button" onClick={onRetry}>다시 시도하기</button>
          </div>
        ) : !isShooting || status !== 'ready' ? (
          <div className="camera-message" role="status">
            <Mascot size="loading" />
            <h1>따또가 사진을 불러오는 중 • • •</h1>
          </div>
        ) : null}

        <div className={`camera-stage${isShooting && status === 'ready' ? ' camera-stage--visible' : ''}`}>
          <div className="camera-stage__viewport">
            <video ref={videoRef} autoPlay muted playsInline aria-label="실시간 카메라 미리보기" />
            <span className={`shot-character shot-character--${shotNumber}`} aria-hidden="true">
              <img src={SHOT_CHARACTERS[shotNumber - 1]} alt="" />
            </span>
          </div>
          <img className="camera-stage__frame" src="/assets/figma-camera-frame.svg" alt="" aria-hidden="true" />
          <span className="camera-stage__progress" aria-label={`${shotNumber} / 4번째 촬영`}>{shotNumber} / 4</span>
          <div className="camera-stage__countdown" aria-live="assertive" aria-atomic="true">
            {isShooting && status === 'ready' ? countdown : null}
          </div>
          {flash && <div className="camera-stage__flash" aria-hidden="true" />}
        </div>
        {isShooting && status === 'ready' && (
          <p className="shooting-instruction">화면을 보고 준비해 주세요 · 자동으로 촬영됩니다</p>
        )}
      </div>
      {!isShooting && <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>}
    </main>
  )
}
