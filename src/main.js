import './style.css'
import { store } from './store.js'

export function initApp(root) {
  const counterBtn = root.querySelector('#counterBtn')
  const countSpan = root.querySelector('#count')

  function render(state) {
    if (state.loading) {
      if (countSpan) countSpan.textContent = '...'
      return
    }
    if (state.error) {
      if (countSpan) countSpan.textContent = 'Error'
      return
    }
    if (countSpan) countSpan.textContent = state.count
  }

  const unsub = store.subscribe(render)
  render(store.get())

  counterBtn?.addEventListener('click', () => {
    store.set({ count: store.get().count + 1 })
  })

  return unsub
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('app')
  if (root) initApp(root)
}
