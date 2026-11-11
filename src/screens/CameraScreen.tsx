import { Mascot } from '../components/Mascot'
import { useCameraSession } from '../hooks/useCameraSession'
import { FRAMES, type FrameId } from '../types'

interface CameraScreenProps {
  frame: FrameId
  isShooting: boolean
  onReady: () => void
  onComplete: (photos: string[]) => void
  onRetry: () => void
}

export function CameraScreen({ frame, isShooting, onReady, onComplete, onRetry }: CameraScreenProps) {
  const { videoRef, status, error, shotNumber, phase, countdown, frozenPhoto, flash } = useCameraSession(
    isShooting, onReady, onComplete,
  )
  const frameImage = FRAMES.find((option) => option.id === frame)?.assetPath

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

        <div className={`camera-stage camera-stage--${frame}${isShooting && status === 'ready' ? ' camera-stage--visible' : ''}`}>
          <div className="camera-stage__viewport">
            <video ref={videoRef} autoPlay muted playsInline aria-label="실시간 카메라 미리보기" />
            {phase === 'freeze' && frozenPhoto && (
              <img className="camera-stage__frozen-photo" src={frozenPhoto} alt="방금 촬영한 사진" />
            )}
            <span className={`shot-frame-overlay shot-frame-overlay--${shotNumber}`} aria-hidden="true">
              <img src={frameImage} alt="" />
            </span>
          </div>
          <svg className="camera-stage__frame" viewBox="0 0 1150 804.404" preserveAspectRatio="none" aria-hidden="true">
            <path d="M1121.17 776.911H27.3433V28.8238H1121.17V776.911ZM54.6865 749.418H1092.34V57.6475H54.6865V749.418Z" fill="currentColor" />
          </svg>
          <span className="camera-stage__progress" aria-label={`${shotNumber} / 4번째 촬영`}>{shotNumber} / 4</span>
          <div className="camera-stage__countdown" aria-live="assertive" aria-atomic="true">
            {isShooting && status === 'ready' && phase === 'countdown' ? countdown : null}
          </div>
          {flash && <div className="camera-stage__flash" aria-hidden="true" />}
        </div>
        {isShooting && status === 'ready' && (
          <p className="shooting-instruction">자동으로 촬영됩니다.</p>
        )}
      </div>
      {!isShooting && <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>}
    </main>
  )
}
