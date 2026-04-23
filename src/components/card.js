/**
 * Card component factory — returns a DOM element with a title and body.
 * Uses createElement/textContent instead of innerHTML to prevent XSS.
 *
 * @param {{ title: string, body: string }} options
 * @returns {HTMLDivElement}
 */
export function createCard({ title = '', body = '' } = {}) {
  const card = document.createElement('div')
  card.className = 'card'

  const h2 = document.createElement('h2')
  h2.textContent = title ?? ''
  card.appendChild(h2)

  const p = document.createElement('p')
  p.textContent = body ?? ''
  card.appendChild(p)

  return card
}
