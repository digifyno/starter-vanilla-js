import './style.css'
import { store } from './store.js'

const counterBtn = document.getElementById('counterBtn')
const countSpan = document.getElementById('count')

store.subscribe(({ count }) => {
  if (countSpan) countSpan.textContent = count
})

if (countSpan) countSpan.textContent = store.get().count

counterBtn?.addEventListener('click', () => {
  store.set({ count: store.get().count + 1 })
})

