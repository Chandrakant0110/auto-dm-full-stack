// server/api/auth/instagram/callback.get.ts
// GET /api/auth/instagram/callback – handles Instagram OAuth code exchange

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query  = getQuery(event)
  const code   = query.code as string | undefined
  const config = useRuntimeConfig()

  if (!code) {
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Missing code parameter from Meta'))
  }

  // NOTE: The #_ appended to the end of the redirect URI is not part of the code itself
  const cleanCode = code.replace('#_', '')

  // -----------------------------------------------------------------------------------
  // Step 2: Exchange code for short-lived access token
  // -----------------------------------------------------------------------------------
  // Using native fetch instead of $fetch to avoid body encoding abstractions on Vercel
  const urlParams = new URLSearchParams()
  urlParams.append('client_id', String(config.public.instagramAppId))
  urlParams.append('client_secret', String(config.instagramAppSecret))
  urlParams.append('grant_type', 'authorization_code')
  urlParams.append('redirect_uri', `${config.public.siteUrl}/api/auth/instagram/callback`)
  urlParams.append('code', cleanCode)

  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: urlParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  const tokenRaw = await res.text()
  if (!res.ok) {
    console.error('Meta API Error on short-lived token:', tokenRaw)
    
    // Attempt to extract the specific error message from Meta
    let errorMessage = 'Failed to exchange short-lived token at Meta'
    try {
      const parsed = JSON.parse(tokenRaw)
      errorMessage = parsed.error_message || parsed.error?.message || errorMessage
    } catch(e) {}
    
    return sendRedirect(event, '/login?error=' + encodeURIComponent(errorMessage))
  }

  let tokenRes: any = {}
  try {
    tokenRes = JSON.parse(tokenRaw)
  } catch (e) {
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Failed to parse Meta response'))
  }

  // Extract token according to Meta's Business Login response shape
  const shortAccessToken = tokenRes.data?.[0]?.access_token || tokenRes.access_token
  const igUserId = tokenRes.data?.[0]?.user_id || tokenRes.user_id

  if (!shortAccessToken) {
    console.error('Failed to get short-lived token. Missing access_token in:', tokenRes)
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Invalid token response from Meta (missing access_token)'))
  }

  // -----------------------------------------------------------------------------------
  // Step 3: Exchange for long-lived token
  // -----------------------------------------------------------------------------------
  const longParams = new URLSearchParams()
  longParams.append('grant_type', 'ig_exchange_token')
  longParams.append('client_secret', String(config.instagramAppSecret))
  longParams.append('access_token', shortAccessToken)

  const longRes = await fetch(`https://graph.instagram.com/access_token?${longParams.toString()}`, {
    method: 'GET'
  })

  const longRaw = await longRes.text()
  if (!longRes.ok) {
    console.error('Meta API Error on long-lived token:', longRaw)

    let errorMessage = 'Failed to exchange for long-lived token'
    try {
      const parsed = JSON.parse(longRaw)
      errorMessage = parsed.error_message || parsed.error?.message || errorMessage
    } catch(e) {}

    return sendRedirect(event, '/login?error=' + encodeURIComponent(errorMessage))
  }

  let longLivedRes: any = {}
  try {
    longLivedRes = JSON.parse(longRaw)
  } catch (e) {
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Failed to parse Meta long-lived response'))
  }

  const longAccessToken = longLivedRes.access_token
  const expiresIn = longLivedRes.expires_in || 5184000 // default to 60 days

  if (!longAccessToken) {
    return sendRedirect(event, '/login?error=' + encodeURIComponent('Failed to retrieve long lived access_token'))
  }

  // -----------------------------------------------------------------------------------
  // Save to Supabase for the logged-in user
  // -----------------------------------------------------------------------------------
  const user = await serverSupabaseUser(event)
  if (!user) {
    // User isn't logged in but they connected Instagram.
    // Save their Instagram connection data in a secure cookie to be consumed during onboarding.
    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, 'pending_ig_token', longAccessToken, { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_user_id', String(igUserId), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_expires_in', String(expiresIn), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    
    return sendRedirect(event, '/register?ig=connected')
  }

  const client = await serverSupabaseClient<any>(event)
  await client.from('instagram_accounts').upsert({
    user_id:      user.id,
    ig_user_id:   String(igUserId),
    access_token: longAccessToken,
    token_type:   longLivedRes.token_type || 'bearer',
    expires_at:   new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at:   new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return sendRedirect(event, '/dashboard?ig=connected')
})
