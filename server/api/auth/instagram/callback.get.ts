// server/api/auth/instagram/callback.get.ts
// GET /api/auth/instagram/callback – Instagram OAuth callback handler
//
// Flow (per Meta Business Login docs):
//   Step 2: POST https://api.instagram.com/oauth/access_token  → short-lived token (1hr)
//   Step 3: GET  https://graph.instagram.com/access_token      → long-lived token (60 days)
//   Step 4: Store token in secure cookie → redirect to origin page
//
// WHY cookies instead of direct DB write:
//   This endpoint is hit by a raw browser redirect from Instagram. The Supabase JS client
//   session lives in cookies/localStorage but serverSupabaseUser() can't reliably hydrate
//   the user's identity from a cold redirect context on Vercel serverless.
//   Instead we store tokens in httpOnly cookies and let the dashboard client-side call
//   /api/auth/link-instagram (which carries the Authorization header) to claim them.

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

  // Where to redirect on success/error (set via OAuth state param)
  const state  = (query.state as string | undefined) || 'login'
  const origin = state === 'dashboard' ? '/dashboard' : '/login'

  // ── 2. Exchange code → short-lived access token ──────────────────────────────
  // Meta docs curl example uses -F (multipart/form-data), so we use FormData
  const step2Form = new FormData()
  step2Form.append('client_id',     String(config.public.instagramAppId))
  step2Form.append('client_secret', String(config.instagramAppSecret))
  step2Form.append('grant_type',    'authorization_code')
  step2Form.append('redirect_uri',  `${config.public.siteUrl}/api/auth/instagram/callback`)
  step2Form.append('code',          code)

  let shortTokenRes: any
  try {
    const step2Res = await fetch('https://api.instagram.com/oauth/access_token', {
      method : 'POST',
      body   : step2Form,
    })

    const raw = await step2Res.text()
    console.log('[IG Callback] Step2 raw response:', raw)
    shortTokenRes = JSON.parse(raw)

    if (!step2Res.ok) {
      const msg = shortTokenRes?.error_message || shortTokenRes?.error?.message || 'Meta rejected the authorization code'
      console.error('[IG Callback] Step2 failed:', msg)
      return sendRedirect(event, `${origin}?error=` + encodeURIComponent(msg))
    }
  } catch (err: any) {
    const msg = err?.message || String(err)
    console.error('[IG Callback] Step2 exception:', msg)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent(`Step2 error: ${msg}`))
  }

  // Response: { data: [{ access_token, user_id, permissions }] }
  const shortToken = shortTokenRes?.data?.[0]?.access_token || shortTokenRes?.access_token
  const igUserId   = shortTokenRes?.data?.[0]?.user_id      || shortTokenRes?.user_id

  if (!shortToken) {
    console.error('[IG Callback] No short-lived token in Step2 response:', shortTokenRes)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Meta did not return an access token'))
  }

  // ── 3. Exchange short-lived → long-lived token (60 days) ────────────────────
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

    if (!step3Res.ok) {
      const msg = longTokenRes?.error?.message || 'Failed to get long-lived token'
      console.error('[IG Callback] Step3 failed:', msg)
      return sendRedirect(event, `${origin}?error=` + encodeURIComponent(msg))
    }
  } catch (err: any) {
    const msg = err?.message || String(err)
    console.error('[IG Callback] Step3 exception:', msg)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent(`Step3 error: ${msg}`))
  }

  const longToken = longTokenRes?.access_token
  const expiresIn = longTokenRes?.expires_in || 5184000  // 60 days in seconds

  if (!longToken) {
    console.error('[IG Callback] No long-lived token in Step3 response:', longTokenRes)
    return sendRedirect(event, `${origin}?error=` + encodeURIComponent('Meta did not return a long-lived token'))
  }

  // ── 4. Store token in secure httpOnly cookie ─────────────────────────────────
  // The dashboard/register page will call /api/auth/link-instagram to claim these            
  // cookies server-side with a proper authenticated client request.
  const isProd = process.env.NODE_ENV === 'production'
  const cookieOpts = { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' }

  setCookie(event, 'pending_ig_token',      longToken,        cookieOpts)
  setCookie(event, 'pending_ig_user_id',    String(igUserId), cookieOpts)
  setCookie(event, 'pending_ig_expires_in', String(expiresIn), cookieOpts)

  // ── 5. Redirect to origin — client will call /api/auth/link-instagram ────────
  return sendRedirect(event, `${origin}?ig=pending`)
})
