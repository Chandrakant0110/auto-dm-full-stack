// server/api/webhooks/instagram.get.ts
// GET /api/webhooks/instagram – Meta webhook verification challenge

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const mode      = query['hub.mode']
  const token     = query['hub.verify_token']
  const challenge = query['hub.challenge']

  const VERIFY_TOKEN = config.instagramWebhookVerifyToken || config.instagramAppSecret + '_verify'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Return the hub.challenge value as a plain string.
    return send(event, String(challenge))
  }

  throw createError({ statusCode: 403, message: 'Forbidden' })
})
