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
  }
}

export const store = createStore({ count: 0 })
