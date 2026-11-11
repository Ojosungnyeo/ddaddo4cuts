import { randomUUID } from 'node:crypto'
import { serverConfig } from '../../server/config.js'
import {
  ApiError,
  clientAddress,
  errorResponse,
  json,
  methodNotAllowed,
  readSmallJson,
} from '../../server/http.js'
import { PHOTO_LIFETIME_MS, PHOTO_MIME_TYPE, storagePath } from '../../server/photoTransfers.js'
import { supabaseAdmin } from '../../server/supabaseAdmin.js'
import { createToken, hashSecret } from '../../server/tokens.js'

interface CreateBody {
  mimeType?: unknown
  sizeBytes?: unknown
}

async function createPhoto(request: Request): Promise<Response> {
  const body = await readSmallJson(request) as CreateBody
  const config = serverConfig()
  if (body.mimeType !== PHOTO_MIME_TYPE) throw new ApiError(400, 'invalid_file_type')
  if (!Number.isSafeInteger(body.sizeBytes) || Number(body.sizeBytes) <= 0) {
    throw new ApiError(400, 'invalid_file_size')
  }
  const sizeBytes = Number(body.sizeBytes)
  if (sizeBytes > config.maxPhotoBytes) throw new ApiError(413, 'file_too_large')

  const supabase = supabaseAdmin()
  const requestFingerprint = hashSecret(`ip:${clientAddress(request)}`)
  const windowStart = new Date(
    Date.now() - config.rateLimitWindowMinutes * 60 * 1000,
  ).toISOString()
  const { count, error: countError } = await supabase
    .from('photo_transfers')
    .select('id', { count: 'exact', head: true })
    .eq('request_fingerprint', requestFingerprint)
    .gte('created_at', windowStart)
  if (countError) throw new ApiError(500, 'database_error')
  if ((count ?? 0) >= config.rateLimitMax) throw new ApiError(429, 'rate_limited')

  const id = randomUUID()
  const shareToken = createToken()
  const manageToken = createToken()
  const path = storagePath(id)
  const expiresAt = new Date(Date.now() + PHOTO_LIFETIME_MS).toISOString()

  const { error: insertError } = await supabase.from('photo_transfers').insert({
    id,
    share_token_hash: hashSecret(`share:${shareToken}`),
    manage_token_hash: hashSecret(`manage:${manageToken}`),
    storage_path: path,
    status: 'pending',
    mime_type: PHOTO_MIME_TYPE,
    expected_size_bytes: sizeBytes,
    request_fingerprint: requestFingerprint,
    expires_at: expiresAt,
  })
  if (insertError) throw new ApiError(500, 'database_error')

  const { data: upload, error: uploadError } = await supabase.storage
    .from(config.storageBucket)
    .createSignedUploadUrl(path, { upsert: false })
  if (uploadError || !upload?.token) {
    await supabase.from('photo_transfers').delete().eq('id', id)
    throw new ApiError(502, 'upload_authorization_failed')
  }

  return json({
    uploadId: id,
    uploadBucket: config.storageBucket,
    uploadPath: path,
    uploadToken: upload.token,
    manageToken,
    shareToken,
    expiresAt,
  }, 201)
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    try {
      return await createPhoto(request)
    } catch (error) {
      return errorResponse(error)
    }
  },
}
