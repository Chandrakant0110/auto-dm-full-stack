// server/api/automations/[id].delete.ts
// DELETE /api/automations/:id

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('automations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
