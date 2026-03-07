// composables/useInstagram.ts
// Composable for Instagram-related helpers

export function useInstagram() {
  const config = useRuntimeConfig()

  /** Kick off the Instagram OAuth flow */
  function startOAuth() {
    const params = new URLSearchParams({
      client_id:     String(config.public.instagramAppId),
      redirect_uri:  `${config.public.siteUrl}/api/auth/instagram/callback`,
      scope:         'instagram_business_basic,instagram_business_manage_messages',
      response_type: 'code',
    })
    window.location.href = `https://api.instagram.com/oauth/authorize?${params}`
  }

  return { startOAuth }
}
