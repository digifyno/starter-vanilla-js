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

describe('createCard edge cases', () => {
  it('renders empty string when title is omitted', () => {
    const card = createCard({ body: 'Only body' })
    expect(card.querySelector('h2').textContent).toBe('')
  })

  it('renders empty string when body is omitted', () => {
    const card = createCard({ title: 'Only title' })
    expect(card.querySelector('p').textContent).toBe('')
  })

  it('sets empty string for null title and body', () => {
    const card = createCard({ title: null, body: null })
    expect(card.querySelector('h2').textContent).toBe('')
    expect(card.querySelector('p').textContent).toBe('')
  })

  it('handles no arguments without throwing', () => {
    const card = createCard()
    expect(card.querySelector('h2').textContent).toBe('')
    expect(card.querySelector('p').textContent).toBe('')
  })
})
