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

  const counterBtn = document.createElement('button')
  counterBtn.id = 'counterBtn'
  root.appendChild(counterBtn)

  const countSpan = document.createElement('span')
  countSpan.id = 'count'
  root.appendChild(countSpan)

  return root
}

describe('initApp()', () => {
  let root
  let unsub

  beforeEach(() => {
    // Reset store to a clean state before each test
    store.reset()
    // Re-seed the default initial state that main.js expects
    store.set({ count: 0, loading: false, error: null })
    root = createRoot()
  })

  afterEach(() => {
    unsub?.()
  })

  it('renders the initial count value from the store into #count', () => {
    unsub = initApp(root)
    const countSpan = root.querySelector('#count')
    expect(countSpan.textContent).toBe('0')
  })

  it('increments the count when the counter button is clicked', () => {
    unsub = initApp(root)
    const counterBtn = root.querySelector('#counterBtn')
    const countSpan = root.querySelector('#count')

    counterBtn.click()
    expect(countSpan.textContent).toBe('1')

    counterBtn.click()
    expect(countSpan.textContent).toBe('2')
  })

  it('shows "..." in #count while the store is in loading state', () => {
    unsub = initApp(root)
    store.set({ loading: true })
    const countSpan = root.querySelector('#count')
    expect(countSpan.textContent).toBe('...')
  })

  it('shows "Error" in #count when the store has an error', () => {
    unsub = initApp(root)
    store.set({ loading: false, error: new Error('boom') })
    const countSpan = root.querySelector('#count')
    expect(countSpan.textContent).toBe('Error')
  })

  it('does not throw when root has no #counterBtn', () => {
    const bareRoot = document.createElement('div')
    const countSpan = document.createElement('span')
    countSpan.id = 'count'
    bareRoot.appendChild(countSpan)
    expect(() => { unsub = initApp(bareRoot) }).not.toThrow()
  })

  it('does not throw when root has no #count span', () => {
    const bareRoot = document.createElement('div')
    const btn = document.createElement('button')
    btn.id = 'counterBtn'
    bareRoot.appendChild(btn)
    expect(() => { unsub = initApp(bareRoot) }).not.toThrow()
  })

  it('unsub stops DOM updates after being called', () => {
    unsub = initApp(root)
    const countSpan = root.querySelector('#count')
    unsub()
    store.set({ count: 99 })
    expect(countSpan.textContent).toBe('0')
  })
})
