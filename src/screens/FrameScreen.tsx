import { FramePreview } from '../components/FramePreview'
import { FRAMES, type FrameId, type FrameTypeId } from '../types'

interface FrameScreenProps {
  type: FrameTypeId
  selected: FrameId | null
  uploadConsent: boolean
  onSelect: (frame: FrameId) => void
  onBack: () => void
  onUploadConsentChange: (consent: boolean) => void
  onContinue: () => void
}

export function FrameScreen({ type, selected, uploadConsent, onSelect, onBack, onUploadConsentChange, onContinue }: FrameScreenProps) {
  const options = FRAMES.filter((frame) => frame.typeId === type)
  return (
    <main className="screen selection-screen">
      <button className="selection-back" onClick={onBack} aria-label="프레임 유형 선택으로 돌아가기" />
      <div className="selection-screen__content">
        <h1>프레임을 골라주세따.</h1>
        <div className="frame-options" role="group" aria-label="프레임 색상 선택">
          {options.map((option) => (
            <button
              className={`frame-option${selected === option.id ? ' frame-option--selected' : ''}`}
              key={option.id}
              onClick={() => onSelect(option.id)}
              aria-pressed={selected === option.id}
              aria-label={`${option.label} 프레임 선택`}
            >
              <FramePreview frame={option.id} />
              <span className={`frame-option__label frame-option__label--${option.id}`}>
                {option.label.toLowerCase()}
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
        <button className="primary-button selection-screen__button" onClick={onContinue} disabled={selected === null}>
          선택한 프레임으로 촬영하기
        </button>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
