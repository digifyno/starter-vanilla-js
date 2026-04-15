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

  const input = document.createElement('input')
  input.id = 'userInput'
  root.appendChild(input)

  const sendBtn = document.createElement('button')
  sendBtn.id = 'sendBtn'
  root.appendChild(sendBtn)

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

  it('disables the send button while loading', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    expect(root.querySelector('#sendBtn').disabled).toBe(true)
  })

  it('enables the send button when not loading', () => {
    unsub = initApp(root)
    store.set({ loading: false })
    expect(root.querySelector('#sendBtn').disabled).toBe(false)
  })

  it('shows loading text in #status while loading', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    expect(root.querySelector('#status').textContent).toBe('Waiting for response...')
  })

  it('shows error message in #status on failure', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: new Error('Network error') })
    expect(root.querySelector('#status').textContent).toBe('Error: Network error')
  })

  it('clears #status when no loading and no error', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: null })
    expect(root.querySelector('#status').textContent).toBe('')
  })

  it('appends user and AI messages on successful send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from AI' }),
    })

    unsub = initApp(root)
    const input = root.querySelector('#userInput')
    const sendBtn = root.querySelector('#sendBtn')

    input.value = 'Hello'
    sendBtn.click()

    // flush microtasks
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    const msgs = root.querySelectorAll('.message')
    expect(msgs.length).toBe(2)
    expect(msgs[0].classList.contains('user')).toBe(true)
    expect(msgs[0].textContent).toBe('Hello')
    expect(msgs[1].classList.contains('ai')).toBe(true)
    expect(msgs[1].textContent).toBe('Hello from AI')
  })

  it('clears input after send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'OK' }),
    })

    unsub = initApp(root)
    const input = root.querySelector('#userInput')
    input.value = 'Test message'
    root.querySelector('#sendBtn').click()

    expect(input.value).toBe('')
  })

  it('does not send when input is empty', () => {
    global.fetch = vi.fn()

    unsub = initApp(root)
    const input = root.querySelector('#userInput')
    input.value = '   '
    root.querySelector('#sendBtn').click()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows error in #status on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    unsub = initApp(root)
    const input = root.querySelector('#userInput')
    input.value = 'Hello'
    root.querySelector('#sendBtn').click()

    // flush microtasks
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(root.querySelector('#status').textContent).toBe('Error: Network error')
  })

  it('unsub stops DOM updates after being called', () => {
    unsub = initApp(root)
    const statusEl = root.querySelector('#status')
    unsub()
    store.set({ loading: true })
    expect(statusEl.textContent).toBe('')
  })
})
