import { FramePreview } from '../components/FramePreview'
import { FRAMES, type FrameId } from '../types'

interface FrameScreenProps {
  selected: FrameId
  onSelect: (frame: FrameId) => void
  onContinue: () => void
}

export function FrameScreen({ selected, onSelect, onContinue }: FrameScreenProps) {
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
        <button className="primary-button selection-screen__button" onClick={onContinue}>
          선택한 프레임으로 촬영하기
        </button>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
