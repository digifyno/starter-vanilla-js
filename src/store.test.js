import { describe, it, expect } from 'vitest'
import { createStore, store } from './store.js'

describe('createStore', () => {
  it('get() returns initial state', () => {
    const s = createStore({ count: 0 })
    expect(s.get()).toEqual({ count: 0 })
  })

  it('set() merges patch into state without clobbering other keys', () => {
    const s = createStore({ count: 0, name: 'test' })
    s.set({ count: 5 })
    expect(s.get()).toEqual({ count: 5, name: 'test' })
  })

  it('subscribe() receives updated state when set() is called', () => {
    const s = createStore({ count: 0 })
    const calls = []
    s.subscribe(state => calls.push(state))
    s.set({ count: 1 })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({ count: 1 })
  })

  it('unsubscribe() stops receiving further updates', () => {
    const s = createStore({ count: 0 })
    const calls = []
    const unsub = s.subscribe(state => calls.push(state))
    s.set({ count: 1 })
    unsub()
    s.set({ count: 2 })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({ count: 1 })
  })

  it('get() returns a shallow copy (mutations do not affect store)', () => {
    const s = createStore({ count: 0 })
    const state = s.get()
    state.count = 99
    expect(s.get().count).toBe(0)
  })

  it('notifies all active subscribers on each set()', () => {
    const s = createStore({ x: 0 })
    const a = []
    const b = []
    s.subscribe(state => a.push(state.x))
    s.subscribe(state => b.push(state.x))
    s.set({ x: 7 })
    expect(a).toEqual([7])
    expect(b).toEqual([7])
  })
})

describe('store (default instance)', () => {
  it('exports a default store with a count property', () => {
    expect(store.get()).toHaveProperty('count')
  })
})
