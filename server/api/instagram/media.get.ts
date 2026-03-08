import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event): Promise<any> => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = await serverSupabaseClient<any>(event)
  const { data: account, error } = await client
    .from('instagram_accounts')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  if (error || !account) {
    throw createError({ statusCode: 404, message: 'Instagram account not linked' })
  }

  // Support pagination via cursor 'after' if needed
  const query = getQuery(event)
  
  try {
    const reqQuery: Record<string, string> = {
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
      access_token: account.access_token
    }
    
    if (query.after) {
      reqQuery.after = String(query.after)
    }

    const igRes = await $fetch<any>('https://graph.instagram.com/v23.0/me/media', {
      query: reqQuery
    })
    return igRes
  } catch (err: any) {
    console.error('Failed to fetch Instagram media:', err.data || err)
    throw createError({ statusCode: 500, message: 'Failed to fetch Instagram media' })
  }
})
