// server/api/auth/instagram/login.get.ts
// GET /api/auth/instagram/login – Redirects the user to the Instagram Business Login flow

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const clientId = config.public.instagramAppId
  const redirectUri = `${config.public.siteUrl}/api/auth/instagram/callback`
  
  // Scopes required for Business Login to read/send DMs
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    // add 'instagram_business_manage_comments' if you plan to reply to comments later
  ].join(',')

  // Instagram Business Login OAuth URL
  const authUrl = `https://api.instagram.com/oauth/authorize?enable_fb_login=true&force_reauth=false&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`

  return sendRedirect(event, authUrl)
})
