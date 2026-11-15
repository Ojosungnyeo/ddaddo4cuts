export type FrameId = 'white' | 'lime' | 'black' | 'newyork' | 'shanghai' | 'tokyo' | 'paris'
export type FrameTypeId = 'basic' | 'travel'
export type Screen = 'home' | 'frame-types' | 'frames' | 'preparing' | 'shooting' | 'result'

export interface FrameTypeOption {
  id: FrameTypeId
  label: string
  previewAssetPath: string
}

export const FRAME_TYPES: FrameTypeOption[] = [
  { id: 'basic', label: '기본 프레임', previewAssetPath: '/assets/frame-type-basic.png' },
  { id: 'travel', label: '여행 프레임', previewAssetPath: '/assets/frame-type-travel.png' },
]

export interface FrameOption {
  id: FrameId
  typeId: FrameTypeId
  label: string
  assetPath: string
}

export const FRAMES: FrameOption[] = [
  { id: 'white', typeId: 'basic', label: 'White', assetPath: '/frames/ddaddo4cuts_white.png' },
  { id: 'lime', typeId: 'basic', label: 'Neon', assetPath: '/frames/ddaddo4cuts_neon.png' },
  { id: 'black', typeId: 'basic', label: 'Black', assetPath: '/frames/ddaddo4cuts_black.png' },
  { id: 'newyork', typeId: 'travel', label: 'Newyork', assetPath: '/frames/ddaddo4cuts_newyork.png' },
  { id: 'shanghai', typeId: 'travel', label: 'Shanghai', assetPath: '/frames/ddaddo4cuts_shanghai.png' },
  { id: 'tokyo', typeId: 'travel', label: 'Tokyo', assetPath: '/frames/ddaddo4cuts_tokyo.png' },
  { id: 'paris', typeId: 'travel', label: 'Paris', assetPath: '/frames/ddaddo4cuts_paris.png' },
]

export interface PhotoSession {
  frame: FrameId
  photos: string[]
}
