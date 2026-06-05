import { describe, it, expect } from 'vitest'
import {
  getTier,
  getNextTier,
  getProgress,
  coinsToNextTier,
  TIERS,
} from '../src/lib/tierUtils.js'

describe('getTier', () => {
  it('returns Bronze at 0 coins', () => {
    expect(getTier(0).name).toBe('Bronze')
  })

  it('returns Bronze at upper boundary (499)', () => {
    expect(getTier(499).name).toBe('Bronze')
  })

  it('returns Silver at 500', () => {
    expect(getTier(500).name).toBe('Silver')
  })

  it('returns Silver at upper boundary (1499)', () => {
    expect(getTier(1499).name).toBe('Silver')
  })

  it('returns Gold at 1500', () => {
    expect(getTier(1500).name).toBe('Gold')
  })

  it('returns Gold at upper boundary (3999)', () => {
    expect(getTier(3999).name).toBe('Gold')
  })

  it('returns Diamond at 4000', () => {
    expect(getTier(4000).name).toBe('Diamond')
  })

  it('returns Diamond at upper boundary (7999)', () => {
    expect(getTier(7999).name).toBe('Diamond')
  })

  it('returns Platinum at 8000', () => {
    expect(getTier(8000).name).toBe('Platinum')
  })

  it('returns Platinum at very high coins', () => {
    expect(getTier(999999).name).toBe('Platinum')
  })
})

describe('getNextTier', () => {
  it('returns Silver as next after Bronze', () => {
    expect(getNextTier(0).name).toBe('Silver')
    expect(getNextTier(499).name).toBe('Silver')
  })

  it('returns Gold as next after Silver', () => {
    expect(getNextTier(500).name).toBe('Gold')
  })

  it('returns Diamond as next after Gold', () => {
    expect(getNextTier(1500).name).toBe('Diamond')
  })

  it('returns Platinum as next after Diamond', () => {
    expect(getNextTier(4000).name).toBe('Platinum')
  })

  it('returns null at Platinum (max tier)', () => {
    expect(getNextTier(8000)).toBeNull()
    expect(getNextTier(999999)).toBeNull()
  })
})

describe('getProgress', () => {
  it('returns 0% at tier minimum', () => {
    expect(getProgress(0)).toBe(0)    // Bronze min
    expect(getProgress(500)).toBe(0)  // Silver min
  })

  it('returns 100% at Platinum (max tier)', () => {
    expect(getProgress(8000)).toBe(100)
    expect(getProgress(999999)).toBe(100)
  })

  it('returns ~50% at midpoint of Bronze (0–499)', () => {
    // midpoint is 249; range is 500, progress = 249 → 49.8% rounds to 50
    expect(getProgress(249)).toBe(50)
  })

  it('returns ~50% at midpoint of Silver (500–1499)', () => {
    // midpoint is 999; range 1000, progress 499 → 49.9% rounds to 50
    expect(getProgress(999)).toBe(50)
  })

  it('is clamped within 0–100', () => {
    const val = getProgress(0)
    expect(val).toBeGreaterThanOrEqual(0)
    expect(val).toBeLessThanOrEqual(100)
  })
})

describe('coinsToNextTier', () => {
  it('returns 500 from 0 coins (Bronze → Silver at 500)', () => {
    expect(coinsToNextTier(0)).toBe(500)
  })

  it('returns 1 from 499 coins', () => {
    expect(coinsToNextTier(499)).toBe(1)
  })

  it('returns 1000 from 500 coins (Silver → Gold at 1500)', () => {
    expect(coinsToNextTier(500)).toBe(1000)
  })

  it('returns 0 at Platinum (no next tier)', () => {
    expect(coinsToNextTier(8000)).toBe(0)
    expect(coinsToNextTier(999999)).toBe(0)
  })

  it('returns exact gap for Gold → Diamond', () => {
    expect(coinsToNextTier(1500)).toBe(2500) // 4000 - 1500
  })
})
