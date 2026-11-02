import { useState } from 'react'
import { FRAMES, type FrameId } from '../types'

interface FramePreviewProps {
  frame: FrameId
}

export function FramePreview({ frame }: FramePreviewProps) {
  const [assetFailed, setAssetFailed] = useState(false)
  const assetPath = FRAMES.find((option) => option.id === frame)?.assetPath

  return (
    <div className="frame-preview">
      {assetPath && !assetFailed ? (
        <img src={assetPath} alt="" onError={() => setAssetFailed(true)} />
      ) : (
        <span>프레임 이미지를 불러오지 못했어요.</span>
      )}
    </div>
  )
}
