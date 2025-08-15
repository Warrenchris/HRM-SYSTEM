/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]
  if (!email || !newPassword) {
    console.error('Usage: node scripts/setPassword.js <email> <newPassword>')
    process.exit(1)
  }
  if (!SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_KEY in environment')
    process.exit(2)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) {
    console.error('List users failed:', listErr.message)
    process.exit(3)
  }
  const user = list.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error('User not found for email:', email)
    process.exit(4)
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  })
  if (updErr) {
    console.error('Update user failed:', updErr.message)
    process.exit(5)
  }

  // Normalize the row as a safety net
  const { error: normErr } = await admin.rpc('normalize_auth_user', { _user_id: user.id })
  if (normErr) {
    console.warn('normalize_auth_user warning:', normErr.message)
  }

  console.log('Password updated for', email)
}

main().catch((e) => {
  console.error(e)
  process.exit(99)
})


