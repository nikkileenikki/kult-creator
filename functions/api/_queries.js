// All D1 SQL operations in one place — one function per action

export const creatorQ = {
  list: (db) =>
    db.prepare('SELECT * FROM creators ORDER BY coins DESC').all(),

  byId: (db, id) =>
    db.prepare('SELECT * FROM creators WHERE id = ?').bind(id).first(),

  create: (db, c) =>
    db.prepare(`
      INSERT INTO creators
        (id, initials, name, platform, niche, followers, coins, tasks_completed, status, pic, contact, joined_date, avatar_color, persona)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      c.id, c.initials, c.name, c.platform, c.niche,
      c.followers, c.coins, c.tasksCompleted, c.status,
      c.pic, c.contact, c.joinedDate, c.avatarColor,
      JSON.stringify(c.persona ?? {}),
    ).run(),

  patch: (db, id, fields) => {
    const colMap = {
      coins: 'coins', status: 'status', pic: 'pic', contact: 'contact',
      platform: 'platform', niche: 'niche', followers: 'followers',
      tasksCompleted: 'tasks_completed', avatarColor: 'avatar_color',
      persona: 'persona',
    }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) {
        sets.push(`${col} = ?`)
        vals.push(key === 'persona' ? JSON.stringify(fields[key]) : fields[key])
      }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE creators SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  },
}

export const taskQ = {
  list: (db, filters = {}) => {
    const wheres = [], vals = []
    if (filters.creatorId) { wheres.push('creator_id = ?'); vals.push(filters.creatorId) }
    if (filters.status)    { wheres.push('status = ?');     vals.push(filters.status) }
    if (filters.project)   { wheres.push('project = ?');    vals.push(filters.project) }
    const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : ''
    return db.prepare(`SELECT * FROM tasks ${where} ORDER BY due_date ASC`).bind(...vals).all()
  },

  create: (db, t) =>
    db.prepare(`
      INSERT INTO tasks
        (id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      t.id, t.creatorId ?? '', t.creatorName ?? 'Unassigned', t.platform ?? '', t.task,
      t.project, t.status, t.priority, t.pic, t.dueDate, t.coins, t.notes ?? '',
    ).run(),

  updateStatus: (db, id, status) =>
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').bind(status, id).run(),

  update: (db, id, fields) => {
    const colMap = { task:'task', project:'project', status:'status', priority:'priority', pic:'pic', dueDate:'due_date', coins:'coins', creatorId:'creator_id', creatorName:'creator_name', platform:'platform', notes:'notes' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  },
}

export const recruitQ = {
  list: (db) =>
    db.prepare('SELECT * FROM recruit_requests ORDER BY applied_date DESC').all(),

  updateStatus: (db, id, status) =>
    db.prepare('UPDATE recruit_requests SET status = ? WHERE id = ?').bind(status, id).run(),
}

export const campaignQ = {
  list: (db) =>
    db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all(),

  byId: (db, id) =>
    db.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first(),

  create: (db, c) =>
    db.prepare(`
      INSERT INTO campaigns (id, name, description, status, budget, start_date, end_date, color, brief)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(c.id, c.name, c.description ?? '', c.status ?? 'Planning', c.budget ?? 0, c.startDate ?? '', c.endDate ?? '', c.color ?? '#6C5CE7', c.brief ?? '').run(),

  patch: (db, id, fields) => {
    const colMap = { name:'name', description:'description', status:'status', budget:'budget', startDate:'start_date', endDate:'end_date', color:'color', brief:'brief' }
    const sets = [], vals = []
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) { sets.push(`${col} = ?`); vals.push(fields[key]) }
    }
    if (!sets.length) return null
    vals.push(id)
    return db.prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  },
}

export const analyticsQ = {
  dashboard: (db) =>
    db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM creators WHERE status = 'Active')                                   AS active_creators,
        (SELECT COUNT(*) FROM tasks WHERE status NOT IN ('Completed','Overdue'))                   AS due_this_week,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Overdue')                                     AS overdue,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Completed')                                   AS completed,
        (SELECT COUNT(*) FROM tasks)                                                               AS total_tasks,
        (SELECT COUNT(*) FROM recruit_requests WHERE status IN ('Pending','Under Review'))         AS pending_recruits
    `).first(),

  tiers: async (db) => {
    const { results } = await db.prepare('SELECT coins FROM creators').all()
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
