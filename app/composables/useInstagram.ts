// composables/useInstagram.ts

export const useInstagram = () => {
  const profile = useState<any>('ig_profile', () => null)
  const media = useState<any[]>('ig_media', () => [])
  const loading = ref(false)
  const error = ref('')

  const fetchProfile = async () => {
    try {
      loading.value = true
      error.value = ''
      profile.value = await $fetch<any>('/api/instagram/me')
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to load profile'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const fetchMedia = async (afterCursor?: string) => {
    try {
      loading.value = true
      error.value = ''
      const res: any = await $fetch('/api/instagram/media', {
        params: afterCursor ? { after: afterCursor } : undefined
      })
      if (afterCursor) {
        media.value = [...media.value, ...(res.data || [])]
      } else {
        media.value = res.data || []
      }
      return res.paging
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to load media'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    media,
    loading,
    error,
    fetchProfile,
    fetchMedia
  }
}
