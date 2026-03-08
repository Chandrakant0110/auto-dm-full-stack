<template>
  <NuxtLayout name="dashboard">
    <div class="conversations-page animate-fade-in">

      <div class="page-header">
        <div>
          <h1 class="page-header__title">Conversations</h1>
          <p class="page-header__sub">All Instagram DM threads in one inbox</p>
        </div>
        <div class="header-actions">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="search" class="search-input" placeholder="Search conversations..." />
          </div>
        </div>
      </div>

      <div class="inbox">
        <!-- Thread list -->
        <div class="thread-list">
          <div class="thread-filters">
            <button
              v-for="f in filters"
              :key="f.value"
              class="filter-chip"
              :class="{ 'filter-chip--active': activeFilter === f.value }"
              @click="activeFilter = f.value"
            >{{ f.label }}</button>
          </div>

          <div class="threads">
            <div
              v-for="thread in filteredThreads"
              :key="thread.id"
              class="thread-item"
              :class="{ 'thread-item--active': selectedThread?.id === thread.id, 'thread-item--unread': thread.unread }"
              @click="selectedThread = thread"
            >
              <div class="thread-avatar">
                {{ thread.initials }}
                <span class="thread-avatar__online" v-if="thread.online"></span>
              </div>
              <div class="thread-info">
                <div class="thread-info__top">
                  <span class="thread-username">{{ thread.username }}</span>
                  <span class="thread-time">{{ thread.time }}</span>
                </div>
                <div class="thread-info__bottom">
                  <span class="thread-preview" :class="{ 'thread-preview--unread': thread.unread }">{{ thread.lastMessage }}</span>
                  <span v-if="thread.unread" class="unread-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat view -->
        <div class="chat-view" v-if="selectedThread">
          <!-- Chat header -->
          <div class="chat-header">
            <div class="chat-header__user">
              <div class="thread-avatar">{{ selectedThread.initials }}</div>
              <div>
                <div class="chat-header__name">{{ selectedThread.username }}</div>
                <div class="chat-header__sub">{{ selectedThread.online ? 'Online' : 'Last seen recently' }}</div>
              </div>
            </div>
            <div class="chat-header__actions">
              <span class="badge badge-purple">{{ selectedThread.source }}</span>
              <button class="btn btn-ghost btn-sm">Profile ↗</button>
            </div>
          </div>

          <!-- Messages -->
          <div class="chat-messages" ref="messagesEl">
            <div
              v-for="msg in selectedThread.messages"
              :key="msg.id"
              class="message"
              :class="msg.fromMe ? 'message--me' : 'message--them'"
            >
              <div class="message__bubble">{{ msg.text }}</div>
              <div class="message__meta">
                {{ msg.time }}
                <span v-if="msg.fromMe" class="message__status">{{ msg.read ? '✓✓' : '✓' }}</span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <div class="chat-input-wrapper">
              <textarea
                v-model="replyText"
                class="chat-input"
                placeholder="Type a message..."
                rows="1"
                @keydown.enter.exact.prevent="sendReply"
              ></textarea>
              <div class="chat-input-actions">
                <button class="btn btn-ghost btn-sm">📎</button>
                <button class="btn btn-ghost btn-sm">😊</button>
                <button
                  class="btn btn-primary btn-sm send-btn"
                  :disabled="!replyText.trim()"
                  @click="sendReply"
                >Send ↑</button>
              </div>
            </div>
            <p class="chat-input-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
          </div>
        </div>

        <!-- Empty chat -->
        <div class="chat-empty" v-else>
          <div class="chat-empty__icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a thread from the list to view messages</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Conversations — AutoDM' })

const search = ref('')
const activeFilter = ref('all')
const replyText = ref('')
const messagesEl = ref<HTMLElement>()

const filters = [
  { label: 'All',         value: 'all'      },
  { label: 'Unread',      value: 'unread'   },
  { label: 'Automated',   value: 'automated'},
  { label: 'Manual',      value: 'manual'   },
]

const threads = ref([
  {
    id: 1, username: '@johndoe',   initials: 'JD', online: true,  unread: true,  time: '2m',  source: 'Keyword DM',   lastMessage: "What's the price for the course?",
    messages: [
      { id: 1, fromMe: false, text: "Hey! What's the price for the course?", time: '2:14 PM', read: true },
      { id: 2, fromMe: true,  text: "Hi John! The course is $49. You can grab it at the link in bio 🔗", time: '2:15 PM', read: true },
      { id: 3, fromMe: false, text: "Perfect, thanks! Does it include lifetime access?", time: '2:16 PM', read: false },
    ],
  },
  {
    id: 2, username: '@mary_k',    initials: 'MK', online: false, unread: true,  time: '8m',  source: 'Story Reply',  lastMessage: 'Thanks for replying so fast!',
    messages: [
      { id: 1, fromMe: false, text: 'Loved your story about productivity tips!', time: '2:08 PM', read: true },
      { id: 2, fromMe: true,  text: 'Thank you so much Mary! 🥰 Check out our free guide in bio', time: '2:09 PM', read: true },
      { id: 3, fromMe: false, text: 'Thanks for replying so fast!', time: '2:10 PM', read: false },
    ],
  },
  {
    id: 3, username: '@alex_lens',  initials: 'AL', online: true,  unread: false, time: '15m', source: 'New Follower', lastMessage: 'DM sent: welcome message',
    messages: [
      { id: 1, fromMe: true,  text: 'Hey Alex! Thanks for the follow 🙏 Welcome to the community! Drop "INFO" to get started.', time: '2:00 PM', read: true },
    ],
  },
  {
    id: 4, username: '@riya_b',     initials: 'RB', online: false, unread: false, time: '22m', source: 'Post Comment', lastMessage: 'Sure, count me in!',
    messages: [
      { id: 1, fromMe: true,  text: 'Hey Riya! Saw your comment — want more details on our upcoming webinar?', time: '1:50 PM', read: true },
      { id: 2, fromMe: false, text: 'Sure, count me in!', time: '1:55 PM', read: true },
      { id: 3, fromMe: true,  text: "Amazing! I've sent you the registration link 🎉", time: '1:56 PM', read: true },
    ],
  },
  {
    id: 5, username: '@tomn',       initials: 'TN', online: false, unread: false, time: '1h',  source: 'Story Reply',  lastMessage: 'Will check it out!',
    messages: [
      { id: 1, fromMe: false, text: 'Saw your reel, loved it!', time: '1:00 PM', read: true },
      { id: 2, fromMe: true,  text: 'Thank you Tom! 🙌 Full tutorial is dropping this week — stay tuned!', time: '1:01 PM', read: true },
      { id: 3, fromMe: false, text: 'Will check it out!', time: '1:02 PM', read: true },
    ],
  },
])

const selectedThread  = ref<any>(threads.value[0])

const filteredThreads = computed(() => {
  let list = threads.value
  if (activeFilter.value === 'unread')    list = list.filter(t => t.unread)
  if (activeFilter.value === 'automated') list = list.filter(t => t.source !== 'Manual')
  if (search.value) list = list.filter(t => t.username.includes(search.value) || t.lastMessage.toLowerCase().includes(search.value.toLowerCase()))
  return list
})

function sendReply() {
  if (!replyText.value.trim() || !selectedThread.value) return
  selectedThread.value.messages.push({
    id: Date.now(),
    fromMe: true,
    text: replyText.value.trim(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    read: false,
  })
  selectedThread.value.lastMessage = replyText.value.trim()
  selectedThread.value.unread = false
  replyText.value = ''
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
.page-header__title { font-size: 1.75rem; margin-bottom: 0.25rem; }
.page-header__sub   { color: var(--color-text-muted); font-size: 0.9rem; }

.search-bar { display: flex; align-items: center; gap: 0.5rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); padding: 0.5rem 1rem; }
.search-icon { font-size: 0.85rem; }
.search-input { background: none; border: none; outline: none; color: var(--color-text); font-size: 0.9rem; width: 200px; }
.search-input::placeholder { color: var(--color-text-faint); }

.inbox {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 240px);
  min-height: 500px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
}

/* Thread list */
.thread-list { border-right: 1px solid var(--color-border); display: flex; flex-direction: column; overflow: hidden; }
.thread-filters  { display: flex; gap: 0.35rem; padding: 0.75rem; border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
.filter-chip {
  padding: 0.3rem 0.65rem; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 500;
  background: none; border: 1px solid var(--color-border); color: var(--color-text-muted); cursor: pointer; transition: all var(--transition);
}
.filter-chip:hover          { border-color: var(--color-accent); color: var(--color-text); }
.filter-chip--active        { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); color: var(--color-accent); }

.threads { overflow-y: auto; flex: 1; }
.thread-item {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.9rem 1rem; cursor: pointer; border-bottom: 1px solid var(--color-border);
  transition: background var(--transition);
}
.thread-item:hover        { background: var(--color-surface-2); }
.thread-item--active      { background: rgba(139,92,246,0.1); border-left: 3px solid var(--color-accent); }
.thread-item--unread      { background: rgba(139,92,246,0.05); }

.thread-avatar {
  position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--grad-brand);
  display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.thread-avatar__online {
  position: absolute; width: 10px; height: 10px; bottom: 0; right: 0;
  background: var(--color-success); border-radius: 50%; border: 2px solid var(--color-surface);
}

.thread-info { flex: 1; min-width: 0; }
.thread-info__top   { display: flex; justify-content: space-between; margin-bottom: 0.2rem; }
.thread-username    { font-size: 0.88rem; font-weight: 600; }
.thread-time        { font-size: 0.72rem; color: var(--color-text-faint); }
.thread-info__bottom{ display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.thread-preview     { font-size: 0.78rem; color: var(--color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px; }
.thread-preview--unread { color: var(--color-text); font-weight: 600; }
.unread-dot         { width: 8px; height: 8px; background: var(--color-accent); border-radius: 50%; flex-shrink: 0; }

/* Chat */
.chat-view { display: flex; flex-direction: column; overflow: hidden; }
.chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 0.75rem; color: var(--color-text-muted); }
.chat-empty__icon { font-size: 3rem; opacity: 0.4; }

.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
.chat-header__user { display: flex; align-items: center; gap: 0.75rem; }
.chat-header__name { font-size: 0.95rem; font-weight: 700; }
.chat-header__sub  { font-size: 0.75rem; color: var(--color-success); }
.chat-header__actions { display: flex; align-items: center; gap: 0.75rem; }

.chat-messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.message { display: flex; flex-direction: column; max-width: 70%; }
.message--me   { align-self: flex-end; align-items: flex-end; }
.message--them { align-self: flex-start; align-items: flex-start; }
.message__bubble {
  padding: 0.65rem 0.9rem; border-radius: var(--radius-lg); font-size: 0.88rem; line-height: 1.5;
  max-width: 100%;
}
.message--me   .message__bubble { background: var(--grad-brand); color: #fff; border-bottom-right-radius: 4px; }
.message--them .message__bubble { background: var(--color-surface-2); color: var(--color-text); border-bottom-left-radius: 4px; }
.message__meta { font-size: 0.7rem; color: var(--color-text-faint); margin-top: 0.2rem; display: flex; gap: 0.3rem; }
.message__status { color: var(--color-accent); }

.chat-input-area { padding: 0.75rem 1rem; border-top: 1px solid var(--color-border); background: var(--color-surface); }
.chat-input-wrapper { display: flex; align-items: flex-end; gap: 0.5rem; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 0.6rem 0.75rem; }
.chat-input { flex: 1; background: none; border: none; outline: none; color: var(--color-text); font-family: var(--font-body); font-size: 0.9rem; resize: none; max-height: 120px; line-height: 1.5; }
.chat-input::placeholder { color: var(--color-text-faint); }
.chat-input-actions { display: flex; align-items: center; gap: 0.3rem; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
.chat-input-hint { font-size: 0.7rem; color: var(--color-text-faint); margin-top: 0.4rem; }
.chat-input-hint kbd { background: var(--color-surface-2); border: 1px solid var(--color-border); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.65rem; }

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
</style>
