import './style.css'
import { store } from './store.js'

const counterBtn = document.getElementById('counterBtn')
const countSpan = document.getElementById('count')

store.subscribe(({ count }) => {
  if (countSpan) countSpan.textContent = count
})

counterBtn?.addEventListener('click', () => {
  store.set({ count: store.get().count + 1 })
})

console.log('Vanilla JS app initialized!')
