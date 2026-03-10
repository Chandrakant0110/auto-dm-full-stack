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

  // Extract source context if passed via state parameter
  // Instagram allows passing a wildcard `state` string that bounces back to us.
  const stateRaw = query.state as string | undefined
  const source   = stateRaw === 'dashboard' ? '/dashboard' : '/login'

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
  // Delegate Step 3 (Long-Lived Token Exchange) to a Background Microservice
  // -----------------------------------------------------------------------------------
  
  const user = await serverSupabaseUser(event)
  
  // Asynchronously trigger the background worker without awaiting it entirely
  // We use the short-lived token generated in Step 2, and the worker upgrades and saves it.
  $fetch('/api/auth/instagram/background/long-lived', {
    method: 'POST',
    body: {
      shortAccessToken,
      igUserId,
      isPending: !user,
      supabaseUserId: user?.id
    }
  }).catch((err) => {
    console.error('[Callback] Failed to trigger background IG worker:', err)
  })

  // -----------------------------------------------------------------------------------
  // Fast Client Redirect
  // -----------------------------------------------------------------------------------
  if (!user) {
    // User isn't logged in but they connected Instagram from the login page.
    // Save short-lived auth into cookies so they can be upgraded during actual registration.
    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, 'pending_ig_token', shortAccessToken, { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_user_id', String(igUserId), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    
    return sendRedirect(event, '/register?ig=connected')
  }

  // If they initiated from the dashboard, bounce them right back instantly.
  // The background worker is already generating the 60-day token and writing it to the database behind the scenes.
  return sendRedirect(event, `${source}?ig=connected`)
})
