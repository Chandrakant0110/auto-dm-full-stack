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

  // Exchange code for access token
  const tokenRes = await $fetch<any>('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id:     String(config.public.instagramAppId),
      client_secret: String(config.instagramAppSecret),
      grant_type:    'authorization_code',
      redirect_uri:  `${config.public.siteUrl}/api/auth/instagram/callback`,
      code,
    }),
  })

  // Extract token according to Meta's Business Login response shape
  // Docs indicate the payload might be wrapped in a data[] array
  const shortAccessToken = tokenRes.data?.[0]?.access_token || tokenRes.access_token
  const igUserId = tokenRes.data?.[0]?.user_id || tokenRes.user_id

  if (!shortAccessToken) {
    console.error('Failed to get short-lived token:', tokenRes)
    throw createError({ statusCode: 400, message: 'Invalid token response from Meta' })
  }

  // Exchange for long-lived token
  const longLivedRes = await $fetch<any>(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.instagramAppSecret}&access_token=${shortAccessToken}`,
  )

  const longAccessToken = longLivedRes.access_token
  const expiresIn = longLivedRes.expires_in || 5184000 // default to 60 days

  // Save to Supabase for the logged-in user
  const user   = await serverSupabaseUser(event)
  if (!user) {
    // Optionally handle anonymous connecting, or strictly require login before OAuth
    return sendRedirect(event, '/login')
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
