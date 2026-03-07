// server/api/webhooks/instagram.post.ts
// POST /api/webhooks/instagram – receives events from Meta Webhooks

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Verification handshake (GET is handled by separate route)
  const body = await readBody(event)

  // Validate X-Hub-Signature-256
  const signature = getHeader(event, 'x-hub-signature-256') ?? ''
  const isValid   = await verifySignature(
    JSON.stringify(body),
    signature,
    config.instagramAppSecret,
  )
  if (!isValid) {
    throw createError({ statusCode: 403, message: 'Invalid signature' })
  }

  // Process each webhook entry
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'messages') {
        await handleIncomingDM(event, change.value)
      } else if (change.field === 'mentions') {
        await handleMention(event, change.value)
      } else if (change.field === 'story_insights') {
        await handleStoryReply(event, change.value)
      }
    }
  }

  return { received: true }
})

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const { createHmac } = await import('node:crypto')
  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

async function handleIncomingDM(_event: any, value: any) {
  // TODO: Look up automation rules, enqueue DM job via BullMQ
  console.log('[Webhook] Incoming DM:', JSON.stringify(value))
}

async function handleMention(_event: any, value: any) {
  console.log('[Webhook] Mention:', JSON.stringify(value))
}

async function handleStoryReply(_event: any, value: any) {
  console.log('[Webhook] Story reply:', JSON.stringify(value))
}
