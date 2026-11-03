import { describe, it, expect } from 'vitest'
import { toMinor, formatBDT } from './money'

describe('money', () => {
  it('converts to integer minor units without float drift', () => {
    expect(toMinor(0.1) + toMinor(0.2)).toBe(toMinor(0.3))
  })
  it('formats BDT', () => {
    expect(formatBDT(125050)).toContain('1,250.50')
  })
})