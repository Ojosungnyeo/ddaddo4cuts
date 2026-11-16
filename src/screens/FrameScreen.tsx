import { FramePreview } from '../components/FramePreview'
import { FRAMES, type FrameId, type FrameTypeId } from '../types'

interface FrameScreenProps {
  type: FrameTypeId
  selected: FrameId | null
  onSelect: (frame: FrameId) => void
  onBack: () => void
  onContinue: () => void
}

export function FrameScreen({ type, selected, onSelect, onBack, onContinue }: FrameScreenProps) {
  const options = FRAMES.filter((frame) => frame.typeId === type)
  return (
    <main className={`screen selection-screen frame-detail-screen frame-detail-screen--${type}`}>
      <button className="selection-back" onClick={onBack} aria-label="프레임 유형 선택으로 돌아가기" />
      <div className="selection-screen__content">
        <h1>{type === 'travel' ? '프레임을 골라주세따.' : '프레임을 골라주세따.'}</h1>
        <div className="frame-options" role="group" aria-label="프레임 선택">
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
                {type === 'travel' ? option.label : option.label.toLowerCase()}
              </span>
            </button>
          ))}
        </div>
        <div className="selection-screen__actions">
          <p className="photo-storage-notice">촬영 시작 시 QR 사진 전달을 위한 임시 저장 및 자동 삭제에 동의합니다.</p>
          <button className="primary-button selection-screen__button" onClick={onContinue} disabled={selected === null}>
            선택한 프레임으로 촬영하기
          </button>
        </div>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
