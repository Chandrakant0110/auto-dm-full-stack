// server/api/automations/index.get.ts
// GET /api/automations – list all automations for the current user

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user   = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('automations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
