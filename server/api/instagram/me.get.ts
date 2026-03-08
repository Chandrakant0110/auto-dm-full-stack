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

  try {
    const igRes = await $fetch<any>('https://graph.instagram.com/v23.0/me', {
      query: {
        fields: 'id,username,account_type,media_count,profile_picture_url,biography,website,name,followers_count,follows_count',
        access_token: account.access_token
      }
    })
    return igRes
  } catch (err: any) {
    console.error('Failed to fetch Instagram profile:', err.data || err)
    throw createError({ statusCode: 500, message: 'Failed to fetch Instagram profile' })
  }
})
