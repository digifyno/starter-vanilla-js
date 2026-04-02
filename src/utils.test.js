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

  it('clamps to min when min === max', () => {
    expect(clamp(5, 10, 10)).toBe(10)
  })

  it('handles min > max gracefully (does not throw)', () => {
    expect(() => clamp(5, 10, 5)).not.toThrow()
  })
})

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats other currencies', () => {
    expect(formatCurrency(99, 'EUR')).toContain('99')
  })

  it('formats negative amounts', () => {
    const result = formatCurrency(-1.50)
    expect(result).toMatch(/-/)
    expect(result).toContain('1.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBeTruthy()
  })

  it('does not throw on NaN', () => {
    expect(() => formatCurrency(NaN)).not.toThrow()
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
  it('fires after zero delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 0)
    debounced()
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('resets the timer on repeated calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    debounced()             // resets the 300ms window
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()  // would have fired if timer wasn't reset
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
  })
})
