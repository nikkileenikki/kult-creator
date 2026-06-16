// All D1 SQL operations in one place — one function per action

export const creatorQ = {
  list: (db) =>
    db.prepare('SELECT * FROM creators WHERE deleted_at IS NULL ORDER BY coins DESC').all(),

  byId: (db, id) =>
    db.prepare('SELECT * FROM creators WHERE id = ? AND deleted_at IS NULL').bind(id).first(),

  create: (db, c) =>
    db.prepare(`
      INSERT INTO creators
        (id, initials, name, platform, niche, secondary_niche, followers, coins, tasks_completed, status, pic, contact, joined_date, avatar_color, persona, contact_number, email, platform_username, date_of_birth)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      c.id, c.initials, c.name, c.platform, c.niche, c.secondaryNiche ?? '',
      c.followers, c.coins, c.tasksCompleted, c.status,
      c.pic, c.contact, c.joinedDate, c.avatarColor,
      JSON.stringify(c.persona ?? {}),
      c.contactNumber ?? '', c.email ?? '', c.platformUsername ?? '', c.dateOfBirth ?? '',
    ).run(),

  fullUpdate: (db, id, c) =>
    db.prepare(`
      UPDATE creators SET
        name = ?, initials = ?, platform = ?, niche = ?, secondary_niche = ?,
        followers = ?, coins = ?, tasks_completed = ?, status = ?,
        pic = ?, contact = ?, avatar_color = ?, persona = ?,
        contact_number = ?, email = ?, platform_username = ?, date_of_birth = ?
      WHERE id = ? AND deleted_at IS NULL
    `).bind(
      c.name, c.initials, c.platform, c.niche, c.secondaryNiche ?? '',
      c.followers, c.coins, c.tasksCompleted, c.status,
      c.pic, c.contact, c.avatarColor,
      typeof c.persona === 'string' ? c.persona : JSON.stringify(c.persona ?? {}),
      c.contactNumber ?? '', c.email ?? '', c.platformUsername ?? '', c.dateOfBirth ?? '',
      id,
    ).run(),
}

export const taskQ = {
  list: (db, filters = {}) => {
    const wheres = ['deleted_at IS NULL'], vals = []
    if (filters.creatorId) { wheres.push('creator_id = ?'); vals.push(filters.creatorId) }
    if (filters.status)    { wheres.push('status = ?');     vals.push(filters.status) }
    if (filters.project)   { wheres.push('project = ?');    vals.push(filters.project) }
    return db.prepare(`SELECT * FROM tasks WHERE ${wheres.join(' AND ')} ORDER BY due_date ASC`).bind(...vals).all()
  },

  create: (db, t) =>
    db.prepare(`
      INSERT INTO tasks
        (id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      t.id, t.creatorId ?? '', t.creatorName ?? 'Unassigned', t.platform ?? '', t.task,
      t.project, t.status, t.priority, t.pic, t.dueDate, t.coins,
    ).run(),

  updateStatus: (db, id, status) =>
    db.prepare('UPDATE tasks SET status = ? WHERE id = ? AND deleted_at IS NULL').bind(status, id).run(),

  update: (db, id, fields) => {
    const colMap = { task:'task', project:'project', status:'status', priority:'priority', pic:'pic', dueDate:'due_date', coins:'coins', creatorId:'creator_id', creatorName:'creator_name', platform:'platform', notes:'notes', rating:'rating', review:'review' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  },
}

export const recruitQ = {
  list: (db) =>
    db.prepare('SELECT * FROM recruit_requests ORDER BY applied_date DESC').all(),

  create: (db, r) =>
    db.prepare(`
      INSERT INTO recruit_requests
        (id, initials, name, platform, followers, engagement_rate, niche, tags,
         applied_date, source, pic, description, status, avatar_color,
         email, contact_number, tiktok_username, follower_range, live_experience, collab_preference, video_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      r.id, r.initials, r.name, r.platform, r.followers, r.engagementRate ?? 0,
      r.niche, JSON.stringify(r.tags ?? []), r.appliedDate, r.source,
      r.pic ?? 'Unassigned', r.description ?? '', r.status ?? 'Pending', r.avatarColor,
      r.email ?? '', r.contactNumber ?? '', r.tiktokUsername ?? '',
      r.followerRange ?? '', r.liveExperience ?? '',
      JSON.stringify(r.collabPreference ?? []),
      r.videoLink ?? '',
    ).run(),

  updateStatus: (db, id, status) =>
    db.prepare('UPDATE recruit_requests SET status = ? WHERE id = ?').bind(status, id).run(),

  patch: (db, id, fields) => {
    const colMap = { status: 'status', pic: 'pic', rejectionReason: 'description' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE recruit_requests SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  },
}

export const brandQ = {
  list: (db) =>
    db.prepare('SELECT * FROM brands WHERE deleted_at IS NULL ORDER BY name ASC').all(),

  byId: (db, id) =>
    db.prepare('SELECT * FROM brands WHERE id = ? AND deleted_at IS NULL').bind(id).first(),

  create: (db, b) =>
    db.prepare(`
      INSERT INTO brands (id, name, industry, color, website)
      VALUES (?, ?, ?, ?, ?)
    `).bind(b.id, b.name, b.industry ?? '', b.color ?? '#6C5CE7', b.website ?? '').run(),

  patch: (db, id, fields) => {
    const colMap = { name:'name', industry:'industry', color:'color', website:'website' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE brands SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  },
}

export const campaignQ = {
  list: (db) =>
    db.prepare('SELECT * FROM campaigns WHERE deleted_at IS NULL ORDER BY created_at DESC').all(),

  byId: (db, id) =>
    db.prepare('SELECT * FROM campaigns WHERE id = ? AND deleted_at IS NULL').bind(id).first(),

  create: (db, c) =>
    db.prepare(`
      INSERT INTO campaigns (id, name, description, status, budget, start_date, end_date, color, brand_id, brand_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(c.id, c.name, c.description ?? '', c.status ?? 'Planning', c.budget ?? 0, c.startDate ?? '', c.endDate ?? '', c.color ?? '#6C5CE7', c.brandId ?? '', c.brandName ?? '').run(),

  patch: (db, id, fields) => {
    const colMap = { name:'name', description:'description', status:'status', budget:'budget', startDate:'start_date', endDate:'end_date', color:'color', brief:'brief', brandId:'brand_id', brandName:'brand_name' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  },
}

export const analyticsQ = {
  dashboard: (db) =>
    db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM creators WHERE status = 'Active' AND deleted_at IS NULL)                          AS active_creators,
        (SELECT COUNT(*) FROM tasks WHERE status NOT IN ('Completed','Overdue') AND deleted_at IS NULL)          AS due_this_week,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Overdue' AND deleted_at IS NULL)                            AS overdue,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Completed' AND deleted_at IS NULL)                          AS completed,
        (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL)                                                   AS total_tasks,
        (SELECT COUNT(*) FROM recruit_requests WHERE status IN ('Pending','Under Review'))                      AS pending_recruits
    `).first(),

  tiers: async (db) => {
    const { results } = await db.prepare('SELECT coins FROM creators WHERE deleted_at IS NULL').all()
    const counts = { platinum: 0, diamond: 0, gold: 0, silver: 0, bronze: 0 }
    for (const { coins } of results) {
      if      (coins >= 10000) counts.platinum++
      else if (coins >= 7000)  counts.diamond++
      else if (coins >= 3000)  counts.gold++
      else if (coins >= 1000)  counts.silver++
      else                     counts.bronze++
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  },

  activity: (db) =>
    db.prepare('SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 10').all(),
}
