import { serverConfig } from '../../server/config'
import { ApiError, errorResponse, json, methodNotAllowed, readSmallJson } from '../../server/http'
import { inspectStorageObject, PHOTO_MIME_TYPE } from '../../server/photoTransfers'
import { supabaseAdmin } from '../../server/supabaseAdmin'
import { hashSecret, isValidToken } from '../../server/tokens'

interface CompleteBody {
  uploadId?: unknown
  manageToken?: unknown
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function completePhoto(request: Request): Promise<Response> {
  const body = await readSmallJson(request) as CompleteBody
  if (typeof body.uploadId !== 'string' || !UUID_PATTERN.test(body.uploadId)) {
    throw new ApiError(400, 'invalid_upload_id')
  }
  if (!isValidToken(body.manageToken)) throw new ApiError(400, 'invalid_manage_token')

  const supabase = supabaseAdmin()
  const manageTokenHash = hashSecret(`manage:${body.manageToken}`)
  const { data: transfer, error: readError } = await supabase
    .from('photo_transfers')
    .select('id,status,storage_path,mime_type,expected_size_bytes,size_bytes,expires_at')
    .eq('id', body.uploadId)
    .eq('manage_token_hash', manageTokenHash)
    .maybeSingle()
  if (readError) throw new ApiError(500, 'database_error')
  if (!transfer) throw new ApiError(404, 'transfer_not_found')
  if (new Date(transfer.expires_at).getTime() <= Date.now()) {
    throw new ApiError(410, 'transfer_expired')
  }
  if (transfer.status === 'ready') {
    return json({ status: 'ready', expiresAt: transfer.expires_at, sizeBytes: transfer.size_bytes })
  }
  if (transfer.status !== 'pending') throw new ApiError(409, 'invalid_transfer_state')

  const config = serverConfig()
  const object = await inspectStorageObject(
    supabase,
    config.storageBucket,
    transfer.storage_path,
  )
  if (object.mimeType !== PHOTO_MIME_TYPE || transfer.mime_type !== PHOTO_MIME_TYPE) {
    throw new ApiError(409, 'invalid_uploaded_file_type')
  }
  if (object.size !== transfer.expected_size_bytes || object.size > config.maxPhotoBytes) {
    throw new ApiError(409, 'invalid_uploaded_file_size')
  }

  const completedAt = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('photo_transfers')
    .update({ status: 'ready', size_bytes: object.size, completed_at: completedAt })
    .eq('id', transfer.id)
    .eq('status', 'pending')
    .select('status,expires_at,size_bytes')
    .maybeSingle()
  if (updateError) throw new ApiError(500, 'database_error')
  if (updated) {
    return json({ status: updated.status, expiresAt: updated.expires_at, sizeBytes: updated.size_bytes })
  }

  const { data: concurrent } = await supabase
    .from('photo_transfers')
    .select('status,expires_at,size_bytes')
    .eq('id', transfer.id)
    .eq('manage_token_hash', manageTokenHash)
    .maybeSingle()
  if (concurrent?.status === 'ready') {
    return json({ status: 'ready', expiresAt: concurrent.expires_at, sizeBytes: concurrent.size_bytes })
  }
  throw new ApiError(409, 'completion_conflict')
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    try {
      return await completePhoto(request)
    } catch (error) {
      return errorResponse(error)
    }
  },
}
