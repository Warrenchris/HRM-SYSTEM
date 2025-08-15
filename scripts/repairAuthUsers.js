import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

async function main() {
  const targetEmail = process.argv[2] || 'alice.wanjiru@company.com'
  console.log('Inspecting and normalizing auth users. Target email:', targetEmail)

  // Inspect before
  const { data: beforeInfo, error: beforeErr } = await supabase.rpc('debug_auth_user_info', { _email: targetEmail })
  if (beforeErr) {
    console.error('debug_auth_user_info (before) error:', beforeErr.message)
  } else {
    console.log('Before:', beforeInfo)
  }

  // Normalize just this user's auth row to avoid PostgREST safe-update restrictions
  const userId = beforeInfo && beforeInfo[0] && beforeInfo[0].user_id
  if (userId) {
    const { error: normErr } = await supabase.rpc('normalize_auth_user', { _user_id: userId })
    if (normErr) {
      console.error('normalize_auth_user error:', normErr.message)
    } else {
      console.log('normalize_auth_user completed for user:', userId)
    }
  } else {
    console.warn('Could not resolve user_id from debug_auth_user_info. Skipping normalization.')
  }

  // Inspect after
  const { data: afterInfo, error: afterErr } = await supabase.rpc('debug_auth_user_info', { _email: targetEmail })
  if (afterErr) {
    console.error('debug_auth_user_info (after) error:', afterErr.message)
  } else {
    console.log('After:', afterInfo)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


