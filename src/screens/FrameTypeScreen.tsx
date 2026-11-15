import { FRAME_TYPES, FRAMES, type FrameTypeId } from '../types'

interface FrameTypeScreenProps {
  onBack: () => void
  onSelect: (type: FrameTypeId) => void
}

export function FrameTypeScreen({ onBack, onSelect }: FrameTypeScreenProps) {
  return (
    <main className="screen selection-screen frame-type-screen">
      <button className="selection-back" onClick={onBack} aria-label="홈으로 돌아가기" />
      <div className="selection-screen__content">
        <h1>프레임을 골라주세따.</h1>
        <div className="frame-type-options" role="group" aria-label="프레임 유형 선택">
          {FRAME_TYPES.map((type) => {
            const available = FRAMES.some((frame) => frame.typeId === type.id)
            return (
              <button
                key={type.id}
                className={`frame-type-option frame-type-option--${type.id}`}
                onClick={() => onSelect(type.id)}
                disabled={!available}
                aria-label={`${type.label}${available ? ' 선택' : ' 준비 중'}`}
              >
                {!available && <span className="frame-type-option__badge">준비 중</span>}
                <span className="frame-type-option__image" aria-hidden="true">
                  <img src={type.previewAssetPath} alt="" />
                </span>
                <span className="frame-type-option__label">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
