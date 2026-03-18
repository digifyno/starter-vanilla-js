import { describe, it, expect, vi } from 'vitest'
import { clamp, formatCurrency, debounce } from './utils.js'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })

  it('clamps to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats other currencies', () => {
    expect(formatCurrency(99, 'EUR')).toContain('99')
  })
})

describe('debounce', () => {
  it('delays function execution', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('only fires once after rapid calls', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})
