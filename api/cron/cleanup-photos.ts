import { errorResponse, json, methodNotAllowed } from '../../server/http.js'
import { serverConfig } from '../../server/config.js'
import { supabaseAdmin } from '../../server/supabaseAdmin.js'

const CLEANUP_BATCH_SIZE = 100

async function cleanup(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabase = supabaseAdmin()
  const { data: expired, error: readError } = await supabase
    .from('photo_transfers')
    .select('id,storage_path')
    .in('status', ['pending', 'ready', 'delete_failed'])
    .lt('expires_at', new Date().toISOString())
    .limit(CLEANUP_BATCH_SIZE)
  if (readError) return json({ error: 'database_error' }, 500)
  if (!expired.length) return json({ deleted: 0 })

  const ids = expired.map((transfer) => transfer.id)
  const paths = expired.map((transfer) => transfer.storage_path)
  const { error: storageError } = await supabase.storage
    .from(serverConfig().storageBucket)
    .remove(paths)
  if (storageError) {
    await supabase.from('photo_transfers').update({ status: 'delete_failed' }).in('id', ids)
    return json({ error: 'storage_cleanup_failed' }, 502)
  }

  const { error: deleteError } = await supabase.from('photo_transfers').delete().in('id', ids)
  if (deleteError) return json({ error: 'database_cleanup_failed' }, 500)
  return json({ deleted: ids.length })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    try {
      return await cleanup(request)
    } catch (error) {
      return errorResponse(error)
    }
  },
}
