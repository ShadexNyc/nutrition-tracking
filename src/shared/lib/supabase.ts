/**
 * Supabase client factory.
 * Creates client only when env vars are set; avoids exposing keys or broken client.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

function isNonEmptyString(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0
}

/** Returns Supabase client or null if env is not configured. Never throws. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isNonEmptyString(SUPABASE_URL) || !isNonEmptyString(SUPABASE_ANON_KEY)) {
    return null
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/** Singleton client for app use. Lazy-created once env is available. */
let clientInstance: SupabaseClient | null | undefined
export function getSupabase(): SupabaseClient | null {
  if (clientInstance === undefined) {
    clientInstance = getSupabaseClient()
  }
  return clientInstance
}
