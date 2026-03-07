// stores/useAutomationStore.ts
import { defineStore } from 'pinia'

export interface Automation {
  id: string
  name: string
  trigger: 'new_follower' | 'story_reply' | 'keyword_dm' | 'post_comment' | 'reel_comment'
  status: 'active' | 'paused' | 'stopped'
  message_template: string
  keywords?: string[]
  delay_seconds?: number
  created_at: string
  updated_at: string
  stats?: {
    sent: number
    opened: number
    replied: number
  }
}

export const useAutomationStore = defineStore('automations', () => {
  const automations = ref<Automation[]>([])
  const loading     = ref(false)
  const error       = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const data = await $fetch<Automation[]>('/api/automations')
      automations.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Automation>) {
    const data = await $fetch<Automation>('/api/automations', {
      method: 'POST',
      body: payload,
    })
    automations.value.push(data)
    return data
  }

  async function update(id: string, payload: Partial<Automation>) {
    const data = await $fetch<Automation>(`/api/automations/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    const idx = automations.value.findIndex(a => a.id === id)
    if (idx !== -1) automations.value[idx] = data
    return data
  }

  async function remove(id: string) {
    await $fetch(`/api/automations/${id}`, { method: 'DELETE' })
    automations.value = automations.value.filter(a => a.id !== id)
  }

  async function toggle(id: string) {
    const auto = automations.value.find(a => a.id === id)
    if (!auto) return
    const newStatus = auto.status === 'active' ? 'paused' : 'active'
    return update(id, { status: newStatus })
  }

  return { automations, loading, error, fetchAll, create, update, remove, toggle }
})
