import './style.css'

// Counter demo
let count = 0
const counterBtn = document.getElementById('counterBtn')
const countSpan = document.getElementById('count')

counterBtn?.addEventListener('click', () => {
  count++
  if (countSpan) {
    countSpan.textContent = count
  }
})

console.log('Vanilla JS app initialized!')
