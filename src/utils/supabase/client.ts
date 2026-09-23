import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '') || 'https://placeholder.supabase.co'
  const supabaseAnonKey = rawAnonKey.trim().replace(/^["']|["']$/g, '') || 'placeholder-anon-key'

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
