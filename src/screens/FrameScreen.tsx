import { FramePreview } from '../components/FramePreview'
import { FRAMES, type FrameId } from '../types'

interface FrameScreenProps {
  selected: FrameId
  uploadConsent: boolean
  onSelect: (frame: FrameId) => void
  onUploadConsentChange: (consent: boolean) => void
  onContinue: () => void
}

export function FrameScreen({ selected, uploadConsent, onSelect, onUploadConsentChange, onContinue }: FrameScreenProps) {
  return (
    <main className="screen selection-screen">
      <div className="selection-screen__content">
        <h1>프레임을 골라주세따.</h1>
        <div className="frame-options" role="group" aria-label="프레임 색상 선택">
          {FRAMES.map((option) => (
            <button
              className={`frame-option${selected === option.id ? ' frame-option--selected' : ''}`}
              key={option.id}
              onClick={() => onSelect(option.id)}
              aria-pressed={selected === option.id}
              aria-label={`${option.label} 프레임 선택`}
            >
              <FramePreview frame={option.id} />
              <span className={`frame-option__label frame-option__label--${option.id}`}>
                {option.id === 'lime' ? 'neon' : option.id}
              </span>
            </button>
          ))}
        </div>
        <label className="photo-consent">
          <input
            type="checkbox"
            checked={uploadConsent}
            onChange={(event) => onUploadConsentChange(event.target.checked)}
          />
          <span>QR 사진 전달을 위한 임시 저장 및 자동 삭제에 동의합니다.</span>
        </label>
        <button className="primary-button selection-screen__button" onClick={onContinue}>
          선택한 프레임으로 촬영하기
        </button>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
