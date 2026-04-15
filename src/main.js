import './style.css'
import { store, createAsyncAction } from './store.js'

const token = import.meta.env.VITE_RSI_HUB_TOKEN
const dispatch = createAsyncAction(store.set.bind(store))

export function initApp(root) {
  const messagesEl = root.querySelector('#messages')
  const userInput = root.querySelector('#userInput')
  const sendBtn = root.querySelector('#sendBtn')
  const statusEl = root.querySelector('#status')

  function render(state) {
    if (sendBtn) sendBtn.disabled = state.loading

    if (statusEl) {
      if (state.loading) {
        statusEl.textContent = 'Waiting for response...'
      } else if (state.error) {
        statusEl.textContent = `Error: ${state.error.message}`
      } else {
        statusEl.textContent = ''
      }
    }
  }

  function appendMessage(role, text) {
    if (!messagesEl) return
    const div = document.createElement('div')
    div.className = `message ${role}`
    div.textContent = text
    messagesEl.appendChild(div)
    messagesEl.scrollTop = messagesEl.scrollHeight
  }

  async function sendMessage() {
    const text = userInput?.value.trim()
    if (!text || store.get().loading) return

    if (userInput) userInput.value = ''
    appendMessage('user', text)

    const data = await dispatch(() =>
      fetch('https://rsi.digify.no/hub/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `WorkerHub ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
    )

    if (data !== undefined) {
      appendMessage('ai', data.message ?? data.response ?? JSON.stringify(data))
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
