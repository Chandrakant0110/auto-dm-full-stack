// server/api/auth/instagram/pending-token.get.ts
// GET /api/auth/instagram/pending-token
// Reads the pending Instagram token from the httpOnly cookie and returns it to the frontend.
// This lets the dashboard modal display the token without exposing it in the URL.

export default defineEventHandler(async (event) => {
  const token     = getCookie(event, 'pending_ig_token')
  const igUserId  = getCookie(event, 'pending_ig_user_id')
  const expiresIn = getCookie(event, 'pending_ig_expires_in')

  if (!token) {
    return { found: false }
  }

  return {
    found    : true,
    token,
    igUserId,
    expiresIn: expiresIn ? parseInt(expiresIn, 10) : 5184000,
  }
})
