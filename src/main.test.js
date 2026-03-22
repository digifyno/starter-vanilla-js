import { describe, it, expect, beforeEach } from 'vitest'
import { store } from './store.js'
import { initApp } from './main.js'

describe('initApp', () => {
  let root, countSpan, counterBtn

  beforeEach(() => {
    store.reset()
    root = document.createElement('div')
    root.innerHTML = '<button id="counterBtn">Count: <span id="count">0</span></button>'
    counterBtn = root.querySelector('#counterBtn')
    countSpan = root.querySelector('#count')
  })

  it('renders initial count on mount', () => {
    initApp(root)
    expect(countSpan.textContent).toBe('0')
  })

  it('increments count on button click', () => {
    initApp(root)
    counterBtn.click()
    expect(countSpan.textContent).toBe('1')
  })

  it('shows loading indicator when loading is true', () => {
    initApp(root)
    store.set({ loading: true })
    expect(countSpan.textContent).toBe('...')
  })

  it('shows error indicator when error is set', () => {
    initApp(root)
    store.set({ error: new Error('oops'), loading: false })
    expect(countSpan.textContent).toBe('Error')
  })
})
