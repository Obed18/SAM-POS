import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/envValidator'

let supabase: any = null

try {
  const { url, key } = getSupabaseConfig()
  supabase = createClient(url, key)
} catch (error) {
  console.error('Failed to initialize Supabase:', error)
  // Create a dummy client to prevent runtime errors
  // Users will see an error message in the UI
  supabase = createClient('https://dummy.supabase.co', 'dummy-key')
}

export { supabase }