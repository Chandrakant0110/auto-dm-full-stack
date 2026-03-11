// server/api/auth/instagram/save-token.post.ts
// POST /api/auth/instagram/save-token
// Accepts a long-lived Instagram token in the body and saves it to the DB.
// Uses the admin client (service role) to get the user from the Bearer JWT
// in the Authorization header, bypassing the broken cookie-based serverSupabaseUser.

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const { token, igUserId, expiresIn = 5184000 } = body as {
    token     : string
    igUserId  : string
    expiresIn?: number
  }

  if (!token || !igUserId) {
    throw createError({ statusCode: 400, message: 'token and igUserId are required' })
  }

  // ── Get the user ID from the Bearer JWT in the Authorization header ────────
  const authHeader = getHeader(event, 'authorization') || ''
  const accessJwt  = authHeader.replace('Bearer ', '').trim()

  if (!accessJwt) {
    throw createError({ statusCode: 401, message: 'No Authorization header' })
  }

  // Use the admin client to verify the JWT and get the user
  const adminClient = createClient(
    String(process.env.SUPABASE_URL || 'https://tnerjwkbghqhhrwmzdcu.supabase.co'),
    String(process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || config.supabaseServiceRoleKey),
    { auth: { persistSession: false } }
  )

  const { data: { user }, error: authError } = await adminClient.auth.getUser(accessJwt)
  if (authError || !user?.id) {
    console.error('[save-token] Auth error:', authError)
    throw createError({ statusCode: 401, message: 'Invalid or expired session' })
  }

  // ── Upsert the instagram account row ─────────────────────────────────────────
  const { error: dbError } = await adminClient.from('instagram_accounts').upsert({
    user_id      : user.id,
    ig_user_id   : String(igUserId),
    access_token : token,
    token_type   : 'bearer',
    expires_at   : new Date(Date.now() + Number(expiresIn) * 1000).toISOString(),
    updated_at   : new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (dbError) {
    const msg = `DB[${dbError.code}]: ${dbError.message}`
    console.error('[save-token] DB upsert error:', msg)
    throw createError({ statusCode: 500, message: msg })
  }

  // Clear pending cookies if they exist
  deleteCookie(event, 'pending_ig_token')
  deleteCookie(event, 'pending_ig_user_id')
  deleteCookie(event, 'pending_ig_expires_in')

  return { saved: true, userId: user.id }
})
