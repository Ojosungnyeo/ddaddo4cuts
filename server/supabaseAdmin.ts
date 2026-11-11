import { createClient } from '@supabase/supabase-js'
import { serverConfig } from './config'
import type { Database } from './database.types'

let adminClient: ReturnType<typeof createClient<Database>> | undefined

export function supabaseAdmin() {
  if (adminClient) return adminClient
  const config = serverConfig()
  adminClient = createClient<Database>(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return adminClient
}
