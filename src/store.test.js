import { describe, it, expect, beforeEach } from 'vitest'
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
  it('exports a default store with loading and error properties', () => {
    expect(store.get()).toHaveProperty('loading', false)
    expect(store.get()).toHaveProperty('error', null)
  })

  it('exports a default store with a count property', () => {
    expect(store.get()).toHaveProperty('count')
  })
})
