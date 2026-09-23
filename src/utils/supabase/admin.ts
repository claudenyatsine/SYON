import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '')
  const serviceKey = rawKey.trim().replace(/^["']|["']$/g, '')
  
  if (!supabaseUrl || !serviceKey || serviceKey.includes('placeholder')) {
    throw new Error('Supabase admin credentials missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.')
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
