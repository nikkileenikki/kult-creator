import { describe, it, expect } from 'vitest'
import { mapCreator, mapTask, mapRecruit, mapCampaign } from '../functions/api/_helpers.js'

// ─── mapCreator ──────────────────────────────────────────────────────────────

describe('mapCreator', () => {
  const baseRow = {
    id: 'c1',
    initials: 'AB',
    name: 'Alice Blue',
    platform: 'TikTok',
    niche: 'Fashion',
    secondary_niche: 'Lifestyle',
    followers: 50000,
    coins: 1200,
    tasks_completed: 5,
    status: 'Active',
    pic: 'Sarah',
    contact: 'alice@example.com',
    joined_date: '2024-01-01',
    avatar_color: '#6C5CE7',
    persona: '{"bio":"hello"}',
    contact_number: '+601234567890',
    email: 'alice@example.com',
    platform_username: '@aliceblue',
    date_of_birth: '1995-05-20',
  }

  it('maps all fields correctly', () => {
    const c = mapCreator(baseRow)
    expect(c.id).toBe('c1')
    expect(c.name).toBe('Alice Blue')
    expect(c.niche).toBe('Fashion')
    expect(c.secondaryNiche).toBe('Lifestyle')
    expect(c.followers).toBe(50000)
    expect(c.coins).toBe(1200)
    expect(c.tasksCompleted).toBe(5)
    expect(c.persona).toEqual({ bio: 'hello' })
    expect(c.contactNumber).toBe('+601234567890')
    expect(c.email).toBe('alice@example.com')
    expect(c.platformUsername).toBe('@aliceblue')
    expect(c.dateOfBirth).toBe('1995-05-20')
  })

  it('returns null for null row', () => {
    expect(mapCreator(null)).toBeNull()
  })

  it('falls back to empty strings for optional fields', () => {
    const c = mapCreator({ ...baseRow, secondary_niche: undefined, contact_number: undefined, email: undefined, platform_username: undefined, date_of_birth: undefined })
    expect(c.secondaryNiche).toBe('')
    expect(c.contactNumber).toBe('')
    expect(c.email).toBe('')
    expect(c.platformUsername).toBe('')
    expect(c.dateOfBirth).toBe('')
  })

  it('parses persona JSON', () => {
    const c = mapCreator({ ...baseRow, persona: '{"rejectionReason":"Not a fit"}' })
    expect(c.persona.rejectionReason).toBe('Not a fit')
  })

  it('falls back to empty object when persona JSON is invalid', () => {
    const c = mapCreator({ ...baseRow, persona: 'not-json' })
    expect(c.persona).toEqual({})
  })

  it('falls back to empty object when persona is null', () => {
    const c = mapCreator({ ...baseRow, persona: null })
    expect(c.persona).toEqual({})
  })
})

// ─── mapTask ─────────────────────────────────────────────────────────────────

describe('mapTask', () => {
  const baseRow = {
    id: 't1',
    creator_id: 'c1',
    creator_name: 'Alice Blue',
    platform: 'TikTok',
    task: 'Post video',
    project: 'Summer Campaign',
    status: 'In Progress',
    priority: 'High',
    pic: 'Lina',
    due_date: '2024-06-30',
    coins: 100,
    notes: 'Include hashtag',
    rating: 4,
    review: 'Great work',
  }

  it('maps all fields correctly', () => {
    const t = mapTask(baseRow)
    expect(t.id).toBe('t1')
    expect(t.creatorId).toBe('c1')
    expect(t.creatorName).toBe('Alice Blue')
    expect(t.task).toBe('Post video')
    expect(t.coins).toBe(100)
    expect(t.notes).toBe('Include hashtag')
    expect(t.rating).toBe(4)
    expect(t.review).toBe('Great work')
  })

  it('returns null for null row', () => {
    expect(mapTask(null)).toBeNull()
  })

  it('falls back to defaults for optional fields', () => {
    const t = mapTask({ ...baseRow, notes: undefined, rating: undefined, review: undefined })
    expect(t.notes).toBe('')
    expect(t.rating).toBe(0)
    expect(t.review).toBe('')
  })
})

// ─── mapRecruit ──────────────────────────────────────────────────────────────

describe('mapRecruit', () => {
  const baseRow = {
    id: 'reg_abc',
    initials: 'JD',
    name: 'Jane Doe',
    platform: 'TikTok',
    followers: 25000,
    engagement_rate: 3.5,
    niche: 'Beauty/Skincare',
    tags: '["Beauty/Skincare","Makeup"]',
    applied_date: '2024-05-01',
    source: 'Registration Form',
    pic: 'Unassigned',
    description: '',
    status: 'Pending',
    avatar_color: '#0891B2',
    email: 'jane@example.com',
    contact_number: '+60111234567',
    tiktok_username: '@janedoe',
    follower_range: '10k-50k',
    live_experience: 'Yes',
    collab_preference: '["Gifted Products","Paid Campaigns"]',
    video_link: 'https://tiktok.com/@janedoe/video/1',
  }

  it('maps all fields correctly', () => {
    const r = mapRecruit(baseRow)
    expect(r.id).toBe('reg_abc')
    expect(r.name).toBe('Jane Doe')
    expect(r.followers).toBe(25000)
    expect(r.tags).toEqual(['Beauty/Skincare', 'Makeup'])
    expect(r.email).toBe('jane@example.com')
    expect(r.tiktokUsername).toBe('@janedoe')
    expect(r.followerRange).toBe('10k-50k')
    expect(r.liveExperience).toBe('Yes')
    expect(r.collabPreference).toEqual(['Gifted Products', 'Paid Campaigns'])
    expect(r.videoLink).toBe('https://tiktok.com/@janedoe/video/1')
  })

  it('returns null for null row', () => {
    expect(mapRecruit(null)).toBeNull()
  })

  it('falls back to empty array when tags JSON is invalid', () => {
    const r = mapRecruit({ ...baseRow, tags: 'bad-json' })
    expect(r.tags).toEqual([])
  })

  it('falls back to empty array when collab_preference JSON is invalid', () => {
    const r = mapRecruit({ ...baseRow, collab_preference: null })
    expect(r.collabPreference).toEqual([])
  })

  it('falls back to empty strings for optional fields', () => {
    const r = mapRecruit({ ...baseRow, email: undefined, contact_number: undefined, tiktok_username: undefined, follower_range: undefined, live_experience: undefined, video_link: undefined })
    expect(r.email).toBe('')
    expect(r.contactNumber).toBe('')
    expect(r.tiktokUsername).toBe('')
    expect(r.followerRange).toBe('')
    expect(r.liveExperience).toBe('')
    expect(r.videoLink).toBe('')
  })
})

// ─── mapCampaign ─────────────────────────────────────────────────────────────

describe('mapCampaign', () => {
  const baseRow = {
    id: 'camp1',
    name: 'Summer Launch',
    description: 'Big summer push',
    status: 'Active',
    budget: 5000,
    start_date: '2024-06-01',
    end_date: '2024-08-31',
    color: '#DC2626',
    brand_id: 'brand1',
    brand_name: 'Acme',
  }

  it('maps all fields correctly', () => {
    const c = mapCampaign(baseRow)
    expect(c.id).toBe('camp1')
    expect(c.name).toBe('Summer Launch')
    expect(c.budget).toBe(5000)
    expect(c.brandName).toBe('Acme')
  })

  it('returns null for null row', () => {
    expect(mapCampaign(null)).toBeNull()
  })

  it('falls back to defaults for optional fields', () => {
    const c = mapCampaign({ ...baseRow, description: undefined, budget: undefined, start_date: undefined, end_date: undefined, color: undefined, brand_id: undefined, brand_name: undefined })
    expect(c.description).toBe('')
    expect(c.budget).toBe(0)
    expect(c.startDate).toBe('')
    expect(c.endDate).toBe('')
    expect(c.color).toBe('#6C5CE7')
    expect(c.brandId).toBe('')
    expect(c.brandName).toBe('')
  })
})
