import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStore, createAsyncAction, store } from './store.js'

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

  it('subscribe() does not call fn immediately at registration', () => {
    const s = createStore({ count: 42 })
    const calls = []
    s.subscribe(state => calls.push(state))
    // No set() called — fn should not have been invoked yet
    expect(calls).toHaveLength(0)
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

  it('set({}) with empty patch still notifies subscribers with current state', () => {
    const s = createStore({ count: 5 })
    const calls = []
    s.subscribe(state => calls.push(state.count))
    s.set({})
    expect(calls).toHaveLength(1)
    expect(calls[0]).toBe(5)
  })

  it('subscribe() delivers isolated copy — subscriber mutations do not affect store', () => {
    const s = createStore({ count: 0 })
    s.subscribe(state => {
      state.count = 999  // mutate received state
    })
    s.set({ count: 1 })
    expect(s.get().count).toBe(1)  // internal state unaffected
  })

  it('each concurrent subscriber receives an independent state copy', () => {
    const s = createStore({ count: 0 })
    let bReceivedCount = -1

    // Subscriber A: mutates its copy aggressively
    s.subscribe(state => {
      state.count = 999
    })
    // Subscriber B: reads its copy after A has run
    s.subscribe(state => {
      bReceivedCount = state.count
    })

    s.set({ count: 1 })
    expect(bReceivedCount).toBe(1)  // B got the original value, not 999
  })

  it('subscribing the same function twice registers it only once', () => {
    const s = createStore({ count: 0 })
    const calls = []
    const fn = state => calls.push(state.count)
    s.subscribe(fn)
    s.subscribe(fn)  // second subscribe — same reference
    s.set({ count: 1 })
    expect(calls).toHaveLength(1)  // fired only once, not twice
  })

  it('unsubscribing one of two identical subscriptions removes the function entirely', () => {
    const s = createStore({ count: 0 })
    const calls = []
    const fn = state => calls.push(state.count)
    const unsub1 = s.subscribe(fn)
    s.subscribe(fn)
    unsub1()  // removes fn from the Set
    s.set({ count: 1 })
    expect(calls).toHaveLength(0)  // fn no longer in listeners
  })
})

describe('createAsyncAction', () => {
  let s

  beforeEach(() => {
    s = createStore({ loading: false, error: null })
  })

  it('sets loading true during async action', async () => {
    const states = []
    s.subscribe(state => states.push({ ...state }))
    const dispatch = createAsyncAction(s.set.bind(s))
    await dispatch(() => Promise.resolve())
    expect(states[0].loading).toBe(true)
    expect(states[1].loading).toBe(false)
  })

  it('sets error on async action failure', async () => {
    const err = new Error('oops')
    const dispatch = createAsyncAction(s.set.bind(s))
    await dispatch(() => Promise.reject(err))
    expect(s.get().error).toBe(err)
  })

  it('clears error on subsequent successful action', async () => {
    s.set({ error: 'previous error' })
    const dispatch = createAsyncAction(s.set.bind(s))
    await dispatch(() => Promise.resolve())
    expect(s.get().error).toBeNull()
  })

  it('returns the resolved value from the action', async () => {
    const dispatch = createAsyncAction(s.set.bind(s))
    const result = await dispatch(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('does not re-throw on failure — resolves to undefined instead', async () => {
    const dispatch = createAsyncAction(s.set.bind(s))
    const result = await dispatch(() => Promise.reject(new Error('fail')))
    expect(result).toBeUndefined()
    expect(s.get().error).toBeInstanceOf(Error)
    expect(s.get().error.message).toBe('fail')
  })

  it('sets loading:true before thunk and loading:false with error:null after success', async () => {
    const states = []
    const dispatch = createAsyncAction(s.set.bind(s))
    s.subscribe(state => states.push({ ...state }))
    await dispatch(() => Promise.resolve('data'))
    expect(states[0].loading).toBe(true)
    expect(states[0].error).toBeNull()
    expect(states[1].loading).toBe(false)
    expect(states[1].error).toBeNull()
  })

  it('sets error state to the Error object and returns undefined on rejection', async () => {
    const err = new Error('fetch failed')
    const dispatch = createAsyncAction(s.set.bind(s))
    const result = await dispatch(() => Promise.reject(err))
    expect(result).toBeUndefined()
    const state = s.get()
    expect(state.loading).toBe(false)
    expect(state.error).toBe(err)
  })
})


describe('store (default instance)', () => {
  beforeEach(() => store.reset())

  it('exports a default store with loading and error properties', () => {
    expect(store.get()).toHaveProperty('loading', false)
    expect(store.get()).toHaveProperty('error', null)
  })

  it('exports a default store with a count property', () => {
    expect(store.get()).toHaveProperty('count')
  })
})


describe('reset', () => {
  let s

  beforeEach(() => {
    s = createStore({ count: 0, loading: false, error: null })
  })

  it('clears state set after initialization', () => {
    s.set({ count: 42, extra: 'hello' })
    s.reset()
    const state = s.get()
    expect(state.count).toBe(0)
    expect(state.extra).toBeUndefined()
  })

  it('restores default loading/error fields if present in initial state', () => {
    s.set({ loading: true, error: new Error('oops') })
    s.reset()
    const state = s.get()
    expect(state.loading).toBeFalsy()
    expect(state.error).toBeFalsy()
  })

  it('notifies subscribers after reset', () => {
    // reset() clears listeners without notifying them; a subscriber added
    // after reset() should still receive subsequent set() calls
    const spy = vi.fn()
    s.reset()
    s.subscribe(spy)
    s.set({ count: 1 })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('silently drops subscribers registered before reset()', () => {
    const spy = vi.fn()
    s.subscribe(spy)
    s.reset()
    s.set({ count: 99 })
    expect(spy).not.toHaveBeenCalled()
  })
})
describe('subscribe error isolation', () => {
  beforeEach(() => store.reset())
  afterEach(() => {
    store.reset()
    vi.restoreAllMocks()
  })

  it('continues notifying remaining subscribers if one throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const secondCalled = vi.fn()

    store.subscribe(() => { throw new Error('subscriber error') })
    store.subscribe(secondCalled)

    expect(() => store.set({ x: 1 })).not.toThrow()
    expect(secondCalled).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledOnce()
  })
})
