<template>
  <div class="messages-container">
    <h1>Message History</h1>
    <div v-if="loading" class="loading">
      Loading messages...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="messages.length === 0" class="no-messages">
      No messages found.
    </div>
    <div v-else class="messages-list">
      <div v-for="message in messages" :key="message.id" class="message-card">
        <div class="message-header">
          <span class="message-timestamp">{{ formatTimestamp(message.createdAt) }}</span>
        </div>
        <div class="message-content">
          <div class="message-item system">
            <strong>System:</strong> {{ message.messages[0].content }}
          </div>
          <div class="message-item user">
            <strong>User:</strong> {{ message.messages[1].content }}
          </div>
          <div class="message-item response">
            <strong>Response:</strong>
            <pre>{{ formatResponse(message.messages[2].content) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDb } from '@/firebase'
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'

interface Message {
  id: string
  createdAt: Timestamp
  messages: Array<{
    role: string
    content: string
  }>
}

const messages = ref<Message[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await fetchMessages()
  } catch (err) {
    error.value = 'Failed to load messages: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    loading.value = false
  }
})

async function fetchMessages() {
  const db = getDb()
  const messagesCollection = collection(db, 'messages')
  const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(20))
  
  const querySnapshot = await getDocs(q)
  messages.value = querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      createdAt: data.createdAt,
      messages: data.messages
    }
  })
}

function formatTimestamp(timestamp: Timestamp | null) {
  if (!timestamp) return 'Unknown time'
  return format(timestamp.toDate(), 'MMM d, yyyy HH:mm:ss')
}

function formatResponse(content: string) {
  try {
    const jsonObj = JSON.parse(content)
    return JSON.stringify(jsonObj, null, 2)
  } catch (e) {
    return content
  }
}
</script>

<style lang="scss" scoped>
.messages-container {
  padding: 1rem;
  max-width: 100%;
  
  h1 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  .loading, .error, .no-messages {
    padding: 1rem;
    text-align: center;
  }
  
  .error {
    color: #e74c3c;
  }
  
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .message-card {
    border: 1px solid #444;
    border-radius: 4px;
    padding: 1rem;
    background-color: #2d2d2d;
    color: #e0e0e0;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #aaa;
    }
    
    .message-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .message-item {
        padding: 0.5rem;
        border-radius: 4px;
        
        &.system {
          background-color: #1a3a5a;
          color: #e0e0e0;
        }
        
        &.user {
          background-color: #2a472a;
          color: #e0e0e0;
        }
        
        &.response {
          background-color: #4a3928;
          color: #e0e0e0;
          
          pre {
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0.5rem 0 0;
            font-family: monospace;
            font-size: 0.9rem;
            max-height: 200px;
            overflow-y: auto;
            background-color: #333;
            padding: 0.5rem;
            border-radius: 3px;
            color: #e0e0e0;
          }
        }
      }
    }
  }
}
</style>
