// server/api/auth/instagram/callback.get.ts
// GET /api/auth/instagram/callback – Instagram OAuth callback handler
//
// Flow (per Meta Business Login docs):
//   Step 2: POST https://api.instagram.com/oauth/access_token  → short-lived token (1hr)
//   Step 3: GET  https://graph.instagram.com/access_token      → long-lived token (60 days)
//   Step 4: Save long-lived token to DB + redirect user to dashboard

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query  = getQuery(event)
  const config = useRuntimeConfig()

  // ── 1. Validate incoming code ────────────────────────────────────────────────
  const rawCode = query.code as string | undefined
  if (!rawCode) {
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Instagram did not return an authorization code.'))
  }

  // Instagram appends "#_" to the code in some browsers – strip it
  const code = (rawCode.split('#')[0] ?? rawCode).trim()

  // Read where the user started the OAuth flow (login or dashboard reconnect)
  // We pass this via the OAuth `state` param so we know where to redirect back
  const state  = (query.state as string | undefined) || 'login'
  const origin = state === 'dashboard' ? '/dashboard' : '/login'

  // ── 2. Exchange code → short-lived access token ──────────────────────────────
  // MUST be sent as application/x-www-form-urlencoded (not JSON)
  const step2Params = new URLSearchParams({
    client_id     : String(config.public.instagramAppId),
    client_secret : String(config.instagramAppSecret),
    grant_type    : 'authorization_code',
    redirect_uri  : `${config.public.siteUrl}/api/auth/instagram/callback`,
    code,
  })

  let shortTokenRes: any
  try {
    const step2Res = await fetch('https://api.instagram.com/oauth/access_token', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
      body    : step2Params.toString(),
    })

    const raw = await step2Res.text()
    console.log('[IG Callback] Step2 raw response:', raw)

    shortTokenRes = JSON.parse(raw)

    if (!step2Res.ok || !shortTokenRes) {
      const msg = shortTokenRes?.error_message || shortTokenRes?.error?.message || 'Unknown Meta error on Step 2'
      console.error('[IG Callback] Step2 failed:', msg)
      return sendRedirect(event, `${origin}?error=` + encodeURIComponent(msg))
    }
  } catch (err) {
    console.error('[IG Callback] Step2 exception:', err)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Network error communicating with Instagram (Step 2)'))
  }

  // Response shape: { data: [{ access_token, user_id, permissions }] }
  const shortToken = shortTokenRes?.data?.[0]?.access_token || shortTokenRes?.access_token
  const igUserId   = shortTokenRes?.data?.[0]?.user_id      || shortTokenRes?.user_id

  if (!shortToken) {
    console.error('[IG Callback] No short-lived token in response:', shortTokenRes)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Meta did not return a short-lived access token'))
  }

  // ── 3. Exchange short-lived token → long-lived token (60 days) ───────────────
  const step3Params = new URLSearchParams({
    grant_type    : 'ig_exchange_token',
    client_secret : String(config.instagramAppSecret),
    access_token  : shortToken,
  })

  let longTokenRes: any
  try {
    const step3Res = await fetch(
      `https://graph.instagram.com/access_token?${step3Params.toString()}`,
      { method: 'GET' }
    )

    const raw = await step3Res.text()
    console.log('[IG Callback] Step3 raw response:', raw)

    longTokenRes = JSON.parse(raw)

    if (!step3Res.ok || !longTokenRes) {
      const msg = longTokenRes?.error?.message || 'Unknown Meta error on Step 3'
      console.error('[IG Callback] Step3 failed:', msg)
      return sendRedirect(event, `${origin}?error=` + encodeURIComponent(msg))
    }
  } catch (err) {
    console.error('[IG Callback] Step3 exception:', err)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Network error communicating with Instagram (Step 3)'))
  }

  const longToken = longTokenRes?.access_token
  const expiresIn = longTokenRes?.expires_in || 5184000  // 60 days in seconds

  if (!longToken) {
    console.error('[IG Callback] No long-lived token in response:', longTokenRes)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Meta did not return a long-lived access token'))
  }

  // ── 4. Persist token to Supabase ─────────────────────────────────────────────
  const user = await serverSupabaseUser(event)

  if (!user) {
    // User hasn't signed up yet — store token in secure httpOnly cookies; 
    // the register page will call /api/auth/link-instagram to claim them after signup
    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, 'pending_ig_token',     longToken,       { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_user_id',   String(igUserId), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_expires_in', String(expiresIn), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    return sendRedirect(event, '/register?ig=connected')
  }

  const supabase = await serverSupabaseClient<any>(event)
  const { error: dbError } = await supabase.from('instagram_accounts').upsert({
    user_id      : user.id,
    ig_user_id   : String(igUserId),
    access_token : longToken,
    token_type   : longTokenRes.token_type || 'bearer',
    expires_at   : new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at   : new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (dbError) {
    console.error('[IG Callback] DB upsert error:', dbError)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Failed to save your Instagram connection. Please try again.'))
  }

  // ── 5. All done — redirect user back where they came from ─────────────────────
  return sendRedirect(event, `${origin}?ig=connected`)
})
