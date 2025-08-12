// Utility script to create an admin user in Supabase (local dev)
// Usage:
//   node scripts/createAdmin.js --email you@example.com --password "StrongPass123!"
// Or via npm:
//   npm run create:admin -- --email you@example.com --password "StrongPass123!"

/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'

// Use local dev defaults (matches src/integrations/supabase/client.ts)
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

function getArg(name) {
  const prefix = `--${name}=`
  const arg = process.argv.find((a) => a.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : undefined
}

// Positional fallbacks: node script.js email password
const positionalEmail = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined
const positionalPassword = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : undefined

const email = getArg('email') || positionalEmail || process.env.ADMIN_EMAIL || 'admin@sigma.local'
const password = getArg('password') || positionalPassword || process.env.ADMIN_PASSWORD || 'Admin123!'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function main() {
  if (!email || !password) {
    console.error('Missing --email or --password')
    process.exit(1)
  }

  if (SERVICE_KEY) {
    console.log('Using service key to create/confirm user...')
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

    // Check if user exists (list and filter by email)
    let userId
    const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) {
      console.error('Error listing users:', listError.message)
      process.exit(1)
    }
    console.log(`Found ${list.users.length} existing user(s).`)
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!existing) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError) {
        console.warn('Create user failed:', createError.message)
        // Re-list and see if user actually exists now
        const { data: relist, error: relistError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        if (relistError) {
          console.error('Relist users failed:', relistError.message)
          process.exit(1)
        }
        const maybeExisting = relist.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        if (!maybeExisting) {
          console.error('Failed to create user via admin API and user not found after retry.')
          process.exit(1)
        }
        userId = maybeExisting.id
        console.log('User appears to exist, proceeding with id:', userId)
      }
      if (!userId) {
        userId = created.user.id
        console.log('Created user id:', userId)
      }
    } else {
      userId = existing.id
      console.log('User already exists with id:', userId)
    }

    // Set profile to admin
    // Ensure a profile exists; if not, insert it
    const { data: profileRow, error: profileSelectError } = await admin
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileSelectError) {
      console.error('Failed to read profile:', profileSelectError.message)
      process.exit(1)
    }

    if (!profileRow) {
      const { error: insertError } = await admin
        .from('profiles')
        .insert({ user_id: userId, role: 'admin', is_active: true })
      if (insertError) {
        console.error('Failed to create profile:', insertError.message)
        process.exit(1)
      }
    } else {
      const { error: updateError } = await admin
        .from('profiles')
        .update({ role: 'admin', is_active: true })
        .eq('user_id', userId)
      if (updateError) {
        console.error('Failed to update profile role:', updateError.message)
        process.exit(1)
      }
    }

    console.log('Success: Admin user is ready.')
    console.log('Credentials:')
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
    return
  }

  // Fallback to anon flow (requires Auth to allow password sign-in without email confirmation)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  console.log(`Creating/signing in user: ${email}`)

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'http://localhost:5173/' },
  })
  if (signUpError && !/already registered/i.test(signUpError.message)) {
    console.warn('Sign up error (continuing):', signUpError.message)
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError || !signInData?.session) {
    console.error('Failed to sign in the user. Provide SUPABASE_SERVICE_KEY to use admin API, or ensure email confirmations are disabled in local.')
    if (signInError) console.error(signInError.message)
    process.exit(1)
  }

  const userId = signInData.session.user.id
  console.log('Signed in as user id:', userId)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', is_active: true })
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update profile role:', updateError.message)
    process.exit(1)
  }

  console.log('Success: Admin user is ready.')
  console.log('Credentials:')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


