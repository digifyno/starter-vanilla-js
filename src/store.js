/**
 * Minimal observable store for shared application state.
 * Usage:
 *   import { store } from './store.js'
 *   store.subscribe(state => renderUI(state))
 *   store.set({ user: { name: 'Alice' } })
 */
export function createStore(initialState = {}) {
  let state = { ...initialState }
  const listeners = new Set()

  return {
    get: () => ({ ...state }),
    set(patch) {
      state = { ...state, ...patch }
      listeners.forEach(fn => fn(state))
    },
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    reset() {
      state = { ...initialState }
      listeners.clear()
    },
  }
}

/**
 * Async action helper — wraps an async function and manages loading/error state.
 * Usage:
 *   const dispatch = createAsyncAction(store.set.bind(store))
 *   const data = await dispatch(() => fetch('/api/data').then(r => r.json()))
 */
export function createAsyncAction(storeFn) {
  return async function(actionFn) {
    storeFn({ loading: true, error: null })
    try {
      const result = await actionFn()
      storeFn({ loading: false })
      return result
    } catch (err) {
      storeFn({ loading: false, error: err })
      throw err
    }
  }
}

export const store = createStore({ count: 0, loading: false, error: null })
