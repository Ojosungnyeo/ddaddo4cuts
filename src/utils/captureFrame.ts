// Match the 1080 × 720 transparent slots in every final frame.
export const PHOTO_ASPECT_RATIO = 3 / 2
const OUTPUT_WIDTH = 1080

export function captureFrame(video: HTMLVideoElement): string {
  const { videoWidth: sourceWidth, videoHeight: sourceHeight } = video
  if (!sourceWidth || !sourceHeight || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    throw new Error('카메라 영상이 아직 준비되지 않았어요.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_WIDTH
  canvas.height = Math.round(OUTPUT_WIDTH / PHOTO_ASPECT_RATIO)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('사진을 처리할 수 없어요.')

  const sourceRatio = sourceWidth / sourceHeight
  const cropWidth = sourceRatio > PHOTO_ASPECT_RATIO ? sourceHeight * PHOTO_ASPECT_RATIO : sourceWidth
  const cropHeight = sourceRatio > PHOTO_ASPECT_RATIO ? sourceHeight : sourceWidth / PHOTO_ASPECT_RATIO
  const cropX = (sourceWidth - cropWidth) / 2
  const cropY = (sourceHeight - cropHeight) / 2

  // Match the mirrored live preview in the saved capture.
  context.translate(canvas.width, 0)
  context.scale(-1, 1)
  context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}
