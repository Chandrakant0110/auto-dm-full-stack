// server/api/automations/index.post.ts
// POST /api/automations – create a new automation

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody<any>(event)
  const { name, trigger, message_template, keywords, delay_seconds } = body

  if (!name || !trigger || !message_template) {
    throw createError({ statusCode: 400, message: 'name, trigger, and message_template are required' })
  }

  const client = await serverSupabaseClient<any>(event)
  const { data, error } = await client
    .from('automations')
    .insert({
      user_id: user.id,
      name,
      trigger,
      message_template,
      keywords:       keywords ?? [],
      delay_seconds:  delay_seconds ?? 0,
      status:         'active',
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
