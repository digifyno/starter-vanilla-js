import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { store } from './store.js'
import { initApp } from './main.js'

/**
 * Helper: build a minimal DOM root that mirrors the structure in index.html
 * without using innerHTML.
 */
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

  it('renders the input and send button', () => {
    unsub = initApp(root)
    expect(root.querySelector('#userInput')).not.toBeNull()
    expect(root.querySelector('#sendBtn')).not.toBeNull()
  })

  it('send button is enabled by default', () => {
    unsub = initApp(root)
    const sendBtn = root.querySelector('#sendBtn')
    expect(sendBtn.disabled).toBe(false)
  })

  it('disables send button while store is in loading state', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    const sendBtn = root.querySelector('#sendBtn')
    expect(sendBtn.disabled).toBe(true)
  })

  it('re-enables send button when loading finishes', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    store.set({ loading: false })
    const sendBtn = root.querySelector('#sendBtn')
    expect(sendBtn.disabled).toBe(false)
  })

  it('shows loading text in status while loading', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    const statusEl = root.querySelector('#status')
    expect(statusEl.textContent).toBe('Waiting for response...')
  })

  it('shows error message in status on failure', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: new Error('Network error') })
    const statusEl = root.querySelector('#status')
    expect(statusEl.textContent).toBe('Error: Network error')
  })

  it('clears status when not loading and no error', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: null })
    const statusEl = root.querySelector('#status')
    expect(statusEl.textContent).toBe('')
  })

  it('appends user message and AI response on successful send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from AI' }),
    })

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')

    userInput.value = 'Hello'
    sendBtn.click()

    await vi.waitFor(() => {
      const msgs = root.querySelectorAll('.message')
      expect(msgs.length).toBe(2)
    })

    const msgs = root.querySelectorAll('.message')
    expect(msgs[0].classList.contains('user')).toBe(true)
    expect(msgs[0].textContent).toBe('Hello')
    expect(msgs[1].classList.contains('ai')).toBe(true)
    expect(msgs[1].textContent).toBe('Hello from AI')
  })

  it('clears input after send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'ok' }),
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

  it('shows error in status when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')

    userInput.value = 'Hello'
    sendBtn.click()

    await vi.waitFor(() => {
      const statusEl = root.querySelector('#status')
      expect(statusEl.textContent).toBe('Error: Network error')
    })
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

  it('sends on Enter key press', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'pong' }),
    })

    unsub = initApp(root)
    const userInput = root.querySelector('#userInput')

    userInput.value = 'ping'
    userInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await vi.waitFor(() => {
      const msgs = root.querySelectorAll('.message')
      expect(msgs.length).toBe(2)
    })
  })

  it('unsub stops DOM updates after being called', () => {
    unsub = initApp(root)
    const sendBtn = root.querySelector('#sendBtn')
    unsub()
    store.set({ loading: true })
    expect(sendBtn.disabled).toBe(false)
  })
})
