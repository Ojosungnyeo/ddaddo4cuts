import { FRAMES, type PhotoSession } from '../types'

// Measured from the transparent pixel bounds in all three 1200 × 3628 PNGs.
// The character art sits inside these slots and is drawn over the photos.
const FRAME_WIDTH = 1200
const FRAME_HEIGHT = 3628
const PHOTO_SLOTS = [
  { x: 60, y: 60, width: 1080, height: 720 },
  { x: 60, y: 840, width: 1080, height: 720 },
  { x: 60, y: 1620, width: 1080, height: 720 },
  { x: 60, y: 2400, width: 1080, height: 720 },
] as const

function loadImage(source: string, label: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`${label} 이미지를 불러오지 못했어요.`))
    image.src = source
  })
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slot: (typeof PHOTO_SLOTS)[number],
) {
  const scale = Math.max(slot.width / image.naturalWidth, slot.height / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  const x = slot.x + (slot.width - width) / 2
  const y = slot.y + (slot.height - height) / 2

  context.save()
  context.beginPath()
  context.rect(slot.x, slot.y, slot.width, slot.height)
  context.clip()
  context.drawImage(image, x, y, width, height)
  context.restore()
}

export async function composeFourCut(session: PhotoSession): Promise<Blob> {
  if (session.photos.length !== 4) throw new Error('촬영된 사진 4장이 필요해요.')
  const frame = FRAMES.find((option) => option.id === session.frame)
  if (!frame) throw new Error('선택한 프레임을 찾을 수 없어요.')

  const frameImage = await loadImage(frame.assetPath, '프레임')
  if (frameImage.naturalWidth !== FRAME_WIDTH || frameImage.naturalHeight !== FRAME_HEIGHT) {
    throw new Error('프레임 이미지 크기가 예상한 1200×3628과 달라요.')
  }
  const photos = await Promise.all(
    session.photos.map((source, index) => loadImage(source, `${index + 1}번째 사진`)),
  )

  const canvas = document.createElement('canvas')
  canvas.width = frameImage.naturalWidth
  canvas.height = frameImage.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('사진을 합성할 수 없어요.')

  photos.forEach((photo, index) => drawCover(context, photo, PHOTO_SLOTS[index]))
  context.drawImage(frameImage, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('PNG 이미지를 만들지 못했어요.'))
    }, 'image/png')
  })
}
