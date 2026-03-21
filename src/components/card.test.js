import { describe, it, expect, beforeEach } from 'vitest'
import { createCard } from './card.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('createCard', () => {
  it('renders title and body text', () => {
    const card = createCard({ title: 'Test', body: 'Body text' })
    expect(card.querySelector('h2').textContent).toBe('Test')
    expect(card.querySelector('p').textContent).toBe('Body text')
  })

  it('does not use innerHTML for title/body (XSS safety)', () => {
    const card = createCard({ title: '<script>alert(1)</script>', body: 'safe' })
    expect(card.innerHTML).not.toContain('<script>')
    expect(card.querySelector('h2').textContent).toBe('<script>alert(1)</script>')
  })

  it('returns a div element', () => {
    const card = createCard({ title: 'A', body: 'B' })
    expect(card.tagName).toBe('DIV')
  })

  it('applies card class to wrapper element', () => {
    const card = createCard({ title: 'A', body: 'B' })
    expect(card.classList.contains('card')).toBe(true)
  })
})
