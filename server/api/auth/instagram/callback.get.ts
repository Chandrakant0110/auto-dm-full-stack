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

  // Exchange for long-lived token
  const longLivedRes = await $fetch<any>(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.instagramAppSecret}&access_token=${tokenRes.access_token}`,
  )

  // Save to Supabase for the logged-in user
  const user   = await serverSupabaseUser(event)
  if (!user) return sendRedirect(event, '/login')

  const client = await serverSupabaseClient(event)
  await client.from('instagram_accounts').upsert({
    user_id:      user.id,
    ig_user_id:   tokenRes.user_id,
    access_token: longLivedRes.access_token,
    token_type:   longLivedRes.token_type,
    expires_at:   new Date(Date.now() + longLivedRes.expires_in * 1000).toISOString(),
    updated_at:   new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return sendRedirect(event, '/dashboard?ig=connected')
})
