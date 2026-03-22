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
export function createAsyncAction(setState) {
  return async function dispatch(thunk) {
    setState({ loading: true, error: null })
    try {
      const result = await thunk()
      setState({ loading: false, error: null })
      return result
    } catch (err) {
      setState({ loading: false, error: err })
      // Do NOT re-throw — store.error is the contract
      return undefined
    }
  }
}

export const store = createStore({ count: 0, loading: false, error: null })
