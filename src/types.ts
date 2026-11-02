export type FrameId = 'white' | 'lime' | 'black'
export type Screen = 'home' | 'frames' | 'preparing' | 'shooting' | 'result'

export interface FrameOption {
  id: FrameId
  label: string
  assetPath: string
}

export const FRAMES: FrameOption[] = [
  { id: 'white', label: 'White', assetPath: '/frames/ddaddo4cuts_white.png' },
  { id: 'lime', label: 'Lime', assetPath: '/frames/ddaddo4cuts_neon.png' },
  { id: 'black', label: 'Black', assetPath: '/frames/ddaddo4cuts_black.png' },
]

export interface PhotoSession {
  frame: FrameId
  photos: string[]
}
