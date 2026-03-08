// server/api/auth/instagram/callback.get.ts
// GET /api/auth/instagram/callback – handles Instagram OAuth code exchange

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query  = getQuery(event)
  const code   = query.code as string | undefined
  const config = useRuntimeConfig()

  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing code' })
  }

  // NOTE: The #_ appended to the end of the redirect URI is not part of the code itself
  const cleanCode = code.replace('#_', '')

  // Exchange code for access token (Step 2)
  const tokenRes = await $fetch<any>('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id:     String(config.public.instagramAppId),
      client_secret: String(config.instagramAppSecret),
      grant_type:    'authorization_code',
      redirect_uri:  `${config.public.siteUrl}/api/auth/instagram/callback`,
      code:          cleanCode,
    }),
  }).catch((err) => {
    console.error('Meta API Error on short-lived token:', err.data || err)
    throw createError({ statusCode: 400, message: 'Failed to exchange code at Meta' })
  })

  // Extract token according to Meta's Business Login response shape
  // Docs indicate the payload might be wrapped in a data[] array
  const shortAccessToken = tokenRes.data?.[0]?.access_token || tokenRes.access_token
  const igUserId = tokenRes.data?.[0]?.user_id || tokenRes.user_id

  if (!shortAccessToken) {
    console.error('Failed to get short-lived token:', tokenRes)
    throw createError({ statusCode: 400, message: 'Invalid token response from Meta' })
  }

  // Exchange for long-lived token (Step 3)
  const longLivedRes = await $fetch<any>('https://graph.instagram.com/access_token', {
    method: 'GET',
    query: {
      grant_type: 'ig_exchange_token',
      client_secret: String(config.instagramAppSecret),
      access_token: shortAccessToken,
    }
  }).catch((err) => {
    console.error('Meta API Error on long-lived token:', err.data || err)
    throw createError({ statusCode: 400, message: 'Failed to exchange for long-lived token' })
  })

  const longAccessToken = longLivedRes.access_token
  const expiresIn = longLivedRes.expires_in || 5184000 // default to 60 days

  // Save to Supabase for the logged-in user
  const user = await serverSupabaseUser(event)
  if (!user) {
    // User isn't logged in but they connected Instagram.
    // Save their Instagram connection data in a secure cookie to be consumed during onboarding.
    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, 'pending_ig_token', longAccessToken, { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_user_id', igUserId, { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    setCookie(event, 'pending_ig_expires_in', String(expiresIn), { httpOnly: true, secure: isProd, maxAge: 3600, path: '/' })
    
    return sendRedirect(event, '/register?ig=connected')
  }

  const client = await serverSupabaseClient<any>(event)
  await client.from('instagram_accounts').upsert({
    user_id:      user.id,
    ig_user_id:   igUserId,
    access_token: longAccessToken,
    token_type:   longLivedRes.token_type || 'bearer',
    expires_at:   new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at:   new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return sendRedirect(event, '/dashboard?ig=connected')
})
