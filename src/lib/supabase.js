import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export a flag so the app can show a helpful error instead of crashing silently
export const supabaseMisconfigured = !supabaseUrl || !supabaseAnonKey

// Create a real client if keys exist, otherwise a dummy that won't throw on import
export const supabase = supabaseMisconfigured
  ? createClient('https://placeholder.supabase.co', 'placeholder')
  : createClient(supabaseUrl, supabaseAnonKey)
