import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from './http.js'

export const PHOTO_MIME_TYPE = 'image/png'
export const PHOTO_LIFETIME_MS = 24 * 60 * 60 * 1000

interface StorageObjectMetadata {
  mimetype?: unknown
  contentType?: unknown
  size?: unknown
  contentLength?: unknown
}

export function storagePath(id: string, date = new Date()): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}/${month}/${day}/${id}.png`
}

export async function inspectStorageObject(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): Promise<{ size: number; mimeType: string }> {
  const parts = path.split('/')
  const fileName = parts.pop()
  if (!fileName || parts.length === 0) throw new ApiError(500, 'invalid_storage_path')

  const { data, error } = await supabase.storage.from(bucket).list(parts.join('/'), {
    limit: 100,
    search: fileName,
  })
  if (error) throw new ApiError(502, 'storage_unavailable')

  const object = data.find((candidate) => candidate.name === fileName)
  if (!object) throw new ApiError(409, 'upload_not_found')

  const metadata = (object.metadata ?? {}) as StorageObjectMetadata
  const size = Number(metadata.size ?? metadata.contentLength)
  const mimeType = String(metadata.mimetype ?? metadata.contentType ?? '')
  if (!Number.isSafeInteger(size) || size <= 0 || !mimeType) {
    throw new ApiError(409, 'invalid_uploaded_file')
  }
  return { size, mimeType }
}
