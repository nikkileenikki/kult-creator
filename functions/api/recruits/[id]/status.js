import { json, err, opts, getDB } from '../../_helpers'
import { recruitQ, creatorQ } from '../../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const { status, pic, rejectionReason } = body
  if (!status) return err('status is required')

  const patch = { status }
  if (pic) patch.pic = pic
  if (rejectionReason !== undefined) patch.rejectionReason = rejectionReason
  await recruitQ.patch(db, params.id, patch)

  if (status === 'Approved' || status === 'Rejected') {
    const recruit = await db.prepare('SELECT * FROM recruit_requests WHERE id = ?').bind(params.id).first()
    const existing = await db.prepare('SELECT id FROM creators WHERE id = ?').bind(`c_r_${params.id}`).first()
    if (!existing && recruit) {
      await creatorQ.create(db, {
        id:             `c_r_${params.id}`,
        initials:       recruit.initials,
        name:           recruit.name,
        platform:       recruit.platform,
        niche:          recruit.niche,
        followers:      recruit.followers,
        coins:          0,
        tasksCompleted: 0,
        status:         status === 'Approved' ? 'Active' : 'Rejected',
        pic:            recruit.pic !== 'Unassigned' ? recruit.pic : '',
        contact:        'WhatsApp',
        joinedDate:     new Date().toISOString().split('T')[0],
        avatarColor:    recruit.avatar_color,
        persona:        {},
      })
    }
  }

  return json({ id: params.id, status })
}
