// server/api/auth/link-instagram.post.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Retrieve auth cookies from browser
  const token = getCookie(event, 'pending_ig_token')
  const igUserId = getCookie(event, 'pending_ig_user_id')
  const expiresInStr = getCookie(event, 'pending_ig_expires_in')

  // If no connecting data, consider it successful anyway
  if (!token || !igUserId) {
    return { linked: false, message: 'No pending Instagram connection found.' }
  }

  const expiresIn = expiresInStr ? parseInt(expiresInStr, 10) : 5184000

  // Save the connection to DB via Supabase
  const client = await serverSupabaseClient<any>(event)
  
  const { error } = await client.from('instagram_accounts').upsert({
    user_id: user.id,
    ig_user_id: igUserId,
    access_token: token,
    token_type: 'bearer',
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to link IG account:', error)
    throw createError({ statusCode: 500, message: 'Failed to link Instagram account.' })
  }

  // Clear HTTP-Only cookies now that they're saved
  deleteCookie(event, 'pending_ig_token')
  deleteCookie(event, 'pending_ig_user_id')
  deleteCookie(event, 'pending_ig_expires_in')

  return { linked: true }
})
