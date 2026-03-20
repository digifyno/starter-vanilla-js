import './style.css'
import { store } from './store.js'

const counterBtn = document.getElementById('counterBtn')
const countSpan = document.getElementById('count')

function render({ count }) {
  if (countSpan) countSpan.textContent = count
}

store.subscribe(render)
render(store.get())

counterBtn?.addEventListener('click', () => {
  store.set({ count: store.get().count + 1 })
})
