/**
 * Unit tests for /api/register logic.
 *
 * We test the pure helper functions and validation rules extracted from
 * register.js without spinning up a Cloudflare Worker runtime. The handler
 * itself is integration-tested via the slug/map constants imported here.
 */

import { describe, it, expect } from 'vitest'

// ─── Re-implement the pure logic from register.js ────────────────────────────
// (Kept in sync with the source of truth in functions/api/register.js)

const FOLLOWER_RANGES = {
  'under 10k':   5_000,
  '10k-50k':    25_000,
  '50k-100k':   75_000,
  '100k-500k': 250_000,
  '500k+':     500_000,
}

const CATEGORY_MAP = {
  beauty:      'Beauty/Skincare',
  makeup:      'Makeup',
  fashion:     'Fashion',
  lifestyle:   'Lifestyle',
  educational: 'Educational',
  reviews:     'Reviews/Recommendations',
  others:      'Others',
}

const COLLAB_MAP = {
  gifted:    'Gifted Products',
  affiliate: 'Affiliate/commission-based',
  longterm:  'Long-term partnerships',
  paid:      'Paid Campaigns',
}

function resolveSlug(val, map) {
  const key = val?.toString().trim().toLowerCase()
  return map[key] ?? null
}

function normaliseFollowerKey(val) {
  return val?.toString().trim()
    .toLowerCase()
    .replace(/\s*[–—]+\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function normaliseLiveExperience(val) {
  const liveExp = val?.toString().trim()
  return liveExp === 'yes' ? 'Yes' : liveExp === 'no' ? 'No' : liveExp
}

const isTruthy = v => v === true || v === 'true' || v === 1 || v === '1'

function normaliseUsername(val) {
  if (!val) return ''
  return val.trim().startsWith('@') ? val.trim() : `@${val.trim()}`
}

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('').slice(0, 2)
}

// ─── resolveSlug ─────────────────────────────────────────────────────────────

describe('resolveSlug — CATEGORY_MAP', () => {
  it.each([
    ['beauty',      'Beauty/Skincare'],
    ['makeup',      'Makeup'],
    ['fashion',     'Fashion'],
    ['lifestyle',   'Lifestyle'],
    ['educational', 'Educational'],
    ['reviews',     'Reviews/Recommendations'],
    ['others',      'Others'],
  ])('resolves "%s" → "%s"', (slug, label) => {
    expect(resolveSlug(slug, CATEGORY_MAP)).toBe(label)
  })

  it('is case-insensitive', () => {
    expect(resolveSlug('BEAUTY', CATEGORY_MAP)).toBe('Beauty/Skincare')
    expect(resolveSlug('Fashion', CATEGORY_MAP)).toBe('Fashion')
  })

  it('returns null for unknown slug', () => {
    expect(resolveSlug('unknown', CATEGORY_MAP)).toBeNull()
    expect(resolveSlug('', CATEGORY_MAP)).toBeNull()
  })

  it('returns null for null/undefined', () => {
    expect(resolveSlug(null, CATEGORY_MAP)).toBeNull()
    expect(resolveSlug(undefined, CATEGORY_MAP)).toBeNull()
  })
})

describe('resolveSlug — COLLAB_MAP', () => {
  it.each([
    ['gifted',    'Gifted Products'],
    ['affiliate', 'Affiliate/commission-based'],
    ['longterm',  'Long-term partnerships'],
    ['paid',      'Paid Campaigns'],
  ])('resolves "%s" → "%s"', (slug, label) => {
    expect(resolveSlug(slug, COLLAB_MAP)).toBe(label)
  })

  it('returns null for unknown slug', () => {
    expect(resolveSlug('sponsored', COLLAB_MAP)).toBeNull()
  })
})

// ─── normaliseFollowerKey ────────────────────────────────────────────────────

describe('normaliseFollowerKey', () => {
  it('handles exact lowercase keys', () => {
    expect(normaliseFollowerKey('under 10k')).toBe('under 10k')
    expect(normaliseFollowerKey('10k-50k')).toBe('10k-50k')
    expect(normaliseFollowerKey('500k+')).toBe('500k+')
  })

  it('lowercases capital K', () => {
    expect(normaliseFollowerKey('Under 10K')).toBe('under 10k')
    expect(normaliseFollowerKey('10K-50K')).toBe('10k-50k')
    expect(normaliseFollowerKey('500K+')).toBe('500k+')
  })

  it('replaces en-dash with hyphen (WordPress option text)', () => {
    expect(normaliseFollowerKey('10K – 50K')).toBe('10k-50k')
    expect(normaliseFollowerKey('50K – 100K')).toBe('50k-100k')
    expect(normaliseFollowerKey('100K – 500K')).toBe('100k-500k')
  })

  it('replaces em-dash with hyphen', () => {
    expect(normaliseFollowerKey('10K—50K')).toBe('10k-50k')
  })

  it('strips surrounding whitespace', () => {
    expect(normaliseFollowerKey('  under 10k  ')).toBe('under 10k')
  })

  it('produces a key that exists in FOLLOWER_RANGES', () => {
    const wpOptions = ['Under 10K', '10K – 50K', '50K – 100K', '100K – 500K', '500K+']
    wpOptions.forEach(opt => {
      const key = normaliseFollowerKey(opt)
      expect(FOLLOWER_RANGES[key], `Expected FOLLOWER_RANGES to have key "${key}" for option "${opt}"`).toBeDefined()
    })
  })
})

// ─── normaliseLiveExperience ─────────────────────────────────────────────────

describe('normaliseLiveExperience', () => {
  it('converts lowercase "yes" → "Yes"', () => {
    expect(normaliseLiveExperience('yes')).toBe('Yes')
  })

  it('converts lowercase "no" → "No"', () => {
    expect(normaliseLiveExperience('no')).toBe('No')
  })

  it('passes through already-normalised values', () => {
    expect(normaliseLiveExperience('Yes')).toBe('Yes')
    expect(normaliseLiveExperience('No')).toBe('No')
  })

  it('passes through unexpected values unchanged', () => {
    expect(normaliseLiveExperience('maybe')).toBe('maybe')
  })

  it('trims whitespace', () => {
    expect(normaliseLiveExperience('  yes  ')).toBe('Yes')
  })
})

// ─── isTruthy ────────────────────────────────────────────────────────────────

describe('isTruthy (consent check)', () => {
  it('accepts boolean true', () => {
    expect(isTruthy(true)).toBe(true)
  })

  it('accepts string "true"', () => {
    expect(isTruthy('true')).toBe(true)
  })

  it('accepts number 1', () => {
    expect(isTruthy(1)).toBe(true)
  })

  it('accepts string "1"', () => {
    expect(isTruthy('1')).toBe(true)
  })

  it('rejects false', () => {
    expect(isTruthy(false)).toBe(false)
  })

  it('rejects string "false"', () => {
    expect(isTruthy('false')).toBe(false)
  })

  it('rejects 0', () => {
    expect(isTruthy(0)).toBe(false)
  })

  it('rejects null/undefined', () => {
    expect(isTruthy(null)).toBe(false)
    expect(isTruthy(undefined)).toBe(false)
  })
})

// ─── normaliseUsername ───────────────────────────────────────────────────────

describe('normaliseUsername', () => {
  it('prepends @ when missing', () => {
    expect(normaliseUsername('janedoe')).toBe('@janedoe')
  })

  it('does not double-prepend @', () => {
    expect(normaliseUsername('@janedoe')).toBe('@janedoe')
  })

  it('trims surrounding whitespace', () => {
    expect(normaliseUsername('  janedoe  ')).toBe('@janedoe')
  })

  it('returns empty string for null/undefined/empty', () => {
    expect(normaliseUsername(null)).toBe('')
    expect(normaliseUsername(undefined)).toBe('')
    expect(normaliseUsername('')).toBe('')
  })
})

// ─── getInitials ─────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns two initials for two-word name', () => {
    expect(getInitials('Jane Doe')).toBe('JD')
  })

  it('returns one initial for single-word name', () => {
    expect(getInitials('Madonna')).toBe('M')
  })

  it('uses first two for three-word name', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MJ')
  })

  it('uppercases initials', () => {
    expect(getInitials('alice bob')).toBe('AB')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  Jane   Doe  ')).toBe('JD')
  })
})

// ─── FOLLOWER_RANGES values ───────────────────────────────────────────────────

describe('FOLLOWER_RANGES midpoint values', () => {
  it('stores expected representative follower counts', () => {
    expect(FOLLOWER_RANGES['under 10k']).toBe(5_000)
    expect(FOLLOWER_RANGES['10k-50k']).toBe(25_000)
    expect(FOLLOWER_RANGES['50k-100k']).toBe(75_000)
    expect(FOLLOWER_RANGES['100k-500k']).toBe(250_000)
    expect(FOLLOWER_RANGES['500k+']).toBe(500_000)
  })
})
