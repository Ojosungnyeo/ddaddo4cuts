import { serverConfig } from '../../server/config.js'
import { ApiError, errorResponse, json, methodNotAllowed } from '../../server/http.js'
import { supabaseAdmin } from '../../server/supabaseAdmin.js'
import { hashSecret, isValidToken } from '../../server/tokens.js'

async function getPhoto(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const token = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? '')
  if (!isValidToken(token)) throw new ApiError(404, 'photo_not_found')

  const supabase = supabaseAdmin()
  const { data: transfer, error: readError } = await supabase
    .from('photo_transfers')
    .select('status,storage_path,expires_at')
    .eq('share_token_hash', hashSecret(`share:${token}`))
    .maybeSingle()
  if (readError) throw new ApiError(500, 'database_error')
  if (!transfer || transfer.status !== 'ready') throw new ApiError(404, 'photo_not_found')

  const remainingSeconds = Math.floor(
    (new Date(transfer.expires_at).getTime() - Date.now()) / 1000,
  )
  if (remainingSeconds <= 0) throw new ApiError(410, 'photo_expired')

  const download = url.searchParams.get('download') === '1'
  const expiresIn = Math.min(60, remainingSeconds)
  const options = download ? { download: 'ddaddo4cuts.png' } : undefined
  const { data: signed, error: signedError } = await supabase.storage
    .from(serverConfig().storageBucket)
    .createSignedUrl(transfer.storage_path, expiresIn, options)
  if (signedError || !signed?.signedUrl) throw new ApiError(502, 'download_authorization_failed')

  return json({ signedUrl: signed.signedUrl, expiresIn, photoExpiresAt: transfer.expires_at })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    try {
      return await getPhoto(request)
    } catch (error) {
      return errorResponse(error)
    }
  },
}
