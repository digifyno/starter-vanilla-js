import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not call fn before delay elapses', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()
  })

  it('calls fn once after delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes the latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    debounced('b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('b')
  })
})
