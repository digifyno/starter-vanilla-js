import './style.css'
import { store, createAsyncAction } from './store.js'

const dispatch = createAsyncAction(store.set.bind(store))

function appendMessage(messagesEl, role, text) {
  const div = document.createElement('div')
  div.className = `message ${role}`
  div.textContent = text
  messagesEl.appendChild(div)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

export function initApp(root) {
  const messagesEl = root.querySelector('#messages')
  const userInput = root.querySelector('#userInput')
  const sendBtn = root.querySelector('#sendBtn')
  const statusEl = root.querySelector('#status')

  const token = import.meta.env.VITE_RSI_HUB_TOKEN

  function render(state) {
    if (sendBtn) sendBtn.disabled = state.loading
    if (statusEl) {
      if (state.loading) {
        statusEl.textContent = 'Thinking...'
      } else if (state.error) {
        statusEl.textContent = `Error: ${state.error.message}`
      } else {
        statusEl.textContent = ''
      }
    }
  }

  async function sendMessage() {
    const text = userInput?.value?.trim()
    if (!text || store.get().loading) return

    if (userInput) userInput.value = ''
    if (messagesEl) appendMessage(messagesEl, 'user', text)

    const reply = await dispatch(() =>
      fetch('https://rsi.digify.no/hub/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `WorkerHub ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      }).then(r => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`)
        return r.json()
      })
    )

    if (reply !== undefined && messagesEl) {
      const responseText = reply.message ?? reply.response ?? reply.text ?? JSON.stringify(reply)
      appendMessage(messagesEl, 'ai', responseText)
    }
  }

  const unsub = store.subscribe(render)
  render(store.get())

  sendBtn?.addEventListener('click', sendMessage)
  userInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage()
  })

  return unsub
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('app')
  if (root) initApp(root)
}
