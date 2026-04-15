import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { store } from './store.js'
import { initApp } from './main.js'

function createRoot() {
  const root = document.createElement('div')
  root.id = 'app'

  const messages = document.createElement('div')
  messages.id = 'messages'
  root.appendChild(messages)

  const inputRow = document.createElement('div')
  inputRow.className = 'input-row'

  const userInput = document.createElement('input')
  userInput.id = 'userInput'
  userInput.type = 'text'
  inputRow.appendChild(userInput)

  const sendBtn = document.createElement('button')
  sendBtn.id = 'sendBtn'
  sendBtn.type = 'button'
  inputRow.appendChild(sendBtn)

  root.appendChild(inputRow)

  const status = document.createElement('div')
  status.id = 'status'
  root.appendChild(status)

  return root
}

describe('initApp()', () => {
  let root
  let unsub

  beforeEach(() => {
    store.reset()
    store.set({ messages: [], loading: false, error: null })
    root = createRoot()
  })

  afterEach(() => {
    unsub?.()
    vi.restoreAllMocks()
    delete global.fetch
  })

  it('renders input and send button', () => {
    unsub = initApp(root)
    expect(root.querySelector('#userInput')).not.toBeNull()
    expect(root.querySelector('#sendBtn')).not.toBeNull()
  })

  it('send button is enabled initially', () => {
    unsub = initApp(root)
    expect(root.querySelector('#sendBtn').disabled).toBe(false)
  })

  it('disables send button while store is in loading state', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    expect(root.querySelector('#sendBtn').disabled).toBe(true)
  })

  it('re-enables send button when loading ends', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    store.set({ loading: false })
    expect(root.querySelector('#sendBtn').disabled).toBe(false)
  })

  it('shows thinking text in #status while loading', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    expect(root.querySelector('#status').textContent).toBe('Thinking...')
  })

  it('shows error message in #status when store has an error', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: new Error('Network failure') })
    expect(root.querySelector('#status').textContent).toBe('Error: Network failure')
  })

  it('clears #status when loading ends without error', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    store.set({ loading: false, error: null })
    expect(root.querySelector('#status').textContent).toBe('')
  })

  it('appends user and AI messages on successful send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from AI' }),
    })

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')
    const messagesEl = root.querySelector('#messages')

    userInput.value = 'Hello'
    sendBtn.click()

    await vi.waitFor(() => {
      expect(messagesEl.querySelectorAll('.message')).toHaveLength(2)
    })

    const msgs = messagesEl.querySelectorAll('.message')
    expect(msgs[0].classList.contains('user')).toBe(true)
    expect(msgs[0].textContent).toBe('Hello')
    expect(msgs[1].classList.contains('ai')).toBe(true)
    expect(msgs[1].textContent).toBe('Hello from AI')
  })

  it('clears input after send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'response' }),
    })

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')

    userInput.value = 'test message'
    sendBtn.click()

    await vi.waitFor(() => {
      expect(userInput.value).toBe('')
    })
  })

  it('appends user message and shows error when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')
    const messagesEl = root.querySelector('#messages')
    const statusEl = root.querySelector('#status')

    userInput.value = 'Hi'
    sendBtn.click()

    await vi.waitFor(() => {
      expect(statusEl.textContent).toContain('Error')
    })

    expect(messagesEl.querySelectorAll('.message.user')).toHaveLength(1)
    expect(messagesEl.querySelectorAll('.message.ai')).toHaveLength(0)
  })

  it('does not send when input is empty', () => {
    global.fetch = vi.fn()

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')

    userInput.value = '   '
    sendBtn.click()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('unsub stops DOM updates after being called', () => {
    unsub = initApp(root)
    const sendBtn = root.querySelector('#sendBtn')
    unsub()
    store.set({ loading: true })
    expect(sendBtn.disabled).toBe(false)
  })
})
