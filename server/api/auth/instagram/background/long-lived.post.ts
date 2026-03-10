// server/api/auth/instagram/background/long-lived.post.ts
// Internal microservice to exchange a short-lived token for a long-lived one asynchronously

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { shortAccessToken, igUserId, isPending, supabaseUserId } = body
  const config = useRuntimeConfig()

  if (!shortAccessToken || !igUserId) {
    throw createError({ statusCode: 400, message: 'Missing required parameters' })
  }

  try {
    // 1. Exchange for long-lived token
    const longParams = new URLSearchParams()
    longParams.append('grant_type', 'ig_exchange_token')
    longParams.append('client_secret', String(config.instagramAppSecret))
    longParams.append('access_token', shortAccessToken)

    const longRes = await fetch(`https://graph.instagram.com/access_token?${longParams.toString()}`, {
      method: 'GET'
    })

    const longRaw = await longRes.text()
    if (!longRes.ok) {
      console.error('[Background Worker] Meta API Error on long-lived token:', longRaw)
      return { success: false, error: 'Meta API Error' }
    }

    const longLivedRes = JSON.parse(longRaw)
    const longAccessToken = longLivedRes.access_token
    const expiresIn = longLivedRes.expires_in || 5184000 // default to 60 days

    if (!longAccessToken) {
      console.error('[Background Worker] No access token in response')
      return { success: false, error: 'No access token in response' }
    }

    if (isPending) {
      // If the user isn't fully registered yet, we just wanted to pre-fetch the long-lived token.
      // E.g. save it in a secure server-side cache/Redis to be claimed later.
      // Since we rely on cookies for pending state right now and cookies can't be set from a decoupled background worker,
      // it's gracefully skipped here and handled via the frontend's short-to-long token trade mechanism if needed.
      return { success: true, status: 'pending_registration' }
    }

    // 2. Save directly to Supabase since we know it's an authenticated user
    const client = await serverSupabaseClient<any>(event)
    const { error } = await client.from('instagram_accounts').upsert({
      user_id:      supabaseUserId,
      ig_user_id:   String(igUserId),
      access_token: longAccessToken,
      token_type:   longLivedRes.token_type || 'bearer',
      expires_at:   new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) {
      console.error('[Background Worker] Failed to save to Supabase:', error)
      return { success: false, error: 'Failed to save to database' }
    }

    console.log(`[Background Worker] Successfully safely generated long-lived token for IG User ${igUserId}`)
    return { success: true }
    
  } catch (err) {
    console.error('[Background Worker] Unexpected error:', err)
    return { success: false, error: 'Internal Server Error' }
  }
})
