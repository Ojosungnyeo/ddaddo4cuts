import type { PhotoSession } from '../types'
import { composeFourCut } from './composeFourCut'

const composedPhotos = new WeakMap<PhotoSession, Promise<Blob>>()

export function composePhotoOnce(session: PhotoSession): Promise<Blob> {
  const existing = composedPhotos.get(session)
  if (existing) return existing
  const composition = composeFourCut(session).catch((error: unknown) => {
    composedPhotos.delete(session)
    throw error
  })
  composedPhotos.set(session, composition)
  return composition
}
