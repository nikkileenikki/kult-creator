import { encryptField } from './_crypto'
import { hashPassword } from './_passwords'

export async function onRequestGet({ env }) {
  const DB = env.DB
  if (!DB) {
    return Response.json({ error: 'DB binding not found. Add D1 binding named "DB" in Cloudflare Pages settings.' }, { status: 500 })
  }

  const results = []

  const steps = [
    {
      name: 'Create creators table',
      sql: `CREATE TABLE IF NOT EXISTS creators (
        id              TEXT PRIMARY KEY,
        initials        TEXT NOT NULL,
        name            TEXT NOT NULL,
        platform        TEXT NOT NULL,
        niche           TEXT NOT NULL,
        followers       INTEGER NOT NULL DEFAULT 0,
        coins           INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        status          TEXT NOT NULL DEFAULT 'Active',
        pic             TEXT NOT NULL,
        contact         TEXT NOT NULL,
        joined_date     TEXT NOT NULL,
        avatar_color    TEXT NOT NULL DEFAULT 'v',
        persona         TEXT NOT NULL DEFAULT '{}'
      )`,
    },
    {
      name: 'Create tasks table',
      sql: `CREATE TABLE IF NOT EXISTS tasks (
        id           TEXT PRIMARY KEY,
        creator_id   TEXT NOT NULL,
        creator_name TEXT NOT NULL,
        platform     TEXT NOT NULL,
        task         TEXT NOT NULL,
        project      TEXT NOT NULL,
        status       TEXT NOT NULL DEFAULT 'Not Started',
        priority     TEXT NOT NULL DEFAULT 'Medium',
        pic          TEXT NOT NULL,
        due_date     TEXT NOT NULL,
        coins        INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (creator_id) REFERENCES creators(id)
      )`,
    },
    {
      name: 'Create recruit_requests table',
      sql: `CREATE TABLE IF NOT EXISTS recruit_requests (
        id              TEXT PRIMARY KEY,
        initials        TEXT NOT NULL,
        name            TEXT NOT NULL,
        platform        TEXT NOT NULL,
        followers       INTEGER NOT NULL DEFAULT 0,
        engagement_rate REAL NOT NULL DEFAULT 0,
        niche           TEXT NOT NULL,
        tags            TEXT NOT NULL DEFAULT '[]',
        applied_date    TEXT NOT NULL,
        source          TEXT NOT NULL,
        pic             TEXT NOT NULL,
        description     TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'Pending',
        avatar_color    TEXT NOT NULL DEFAULT 'v'
      )`,
    },
    {
      name: 'Create activity_feed table',
      sql: `CREATE TABLE IF NOT EXISTS activity_feed (
        id         TEXT PRIMARY KEY,
        color      TEXT NOT NULL,
        text       TEXT NOT NULL,
        time       TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      name: 'Create campaigns table',
      sql: `CREATE TABLE IF NOT EXISTS campaigns (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status      TEXT NOT NULL DEFAULT 'Planning',
        budget      REAL NOT NULL DEFAULT 0,
        start_date  TEXT NOT NULL DEFAULT '',
        end_date    TEXT NOT NULL DEFAULT '',
        color       TEXT NOT NULL DEFAULT '#6C5CE7',
        brief       TEXT NOT NULL DEFAULT '',
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      name: 'Add notes column to tasks',
      sql: `ALTER TABLE tasks ADD COLUMN notes TEXT NOT NULL DEFAULT ''`,
    },
    {
      name: 'Add secondary_niche column to creators',
      sql: `ALTER TABLE creators ADD COLUMN secondary_niche TEXT NOT NULL DEFAULT ''`,
    },
    {
      name: 'Add brief column to campaigns',
      sql: `ALTER TABLE campaigns ADD COLUMN brief TEXT NOT NULL DEFAULT ''`,
    },
    { name: 'Add contact_number to creators',    sql: `ALTER TABLE creators ADD COLUMN contact_number    TEXT NOT NULL DEFAULT ''` },
    { name: 'Add email to creators',             sql: `ALTER TABLE creators ADD COLUMN email             TEXT NOT NULL DEFAULT ''` },
    { name: 'Add platform_username to creators', sql: `ALTER TABLE creators ADD COLUMN platform_username TEXT NOT NULL DEFAULT ''` },
    { name: 'Add date_of_birth to creators',     sql: `ALTER TABLE creators ADD COLUMN date_of_birth     TEXT NOT NULL DEFAULT ''` },
    { name: 'Add rating to tasks',               sql: `ALTER TABLE tasks    ADD COLUMN rating             INTEGER NOT NULL DEFAULT 0` },
    { name: 'Add review to tasks',               sql: `ALTER TABLE tasks    ADD COLUMN review             TEXT NOT NULL DEFAULT ''` },
    {
      name: 'Create brands table',
      sql: `CREATE TABLE IF NOT EXISTS brands (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        industry   TEXT NOT NULL DEFAULT '',
        color      TEXT NOT NULL DEFAULT '#6C5CE7',
        website    TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      name: 'Add brand_id column to campaigns',
      sql: `ALTER TABLE campaigns ADD COLUMN brand_id TEXT NOT NULL DEFAULT ''`,
    },
    {
      name: 'Add brand_name column to campaigns',
      sql: `ALTER TABLE campaigns ADD COLUMN brand_name TEXT NOT NULL DEFAULT ''`,
    },
    {
      name: 'Create users table',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        display_name  TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'viewer',
        permissions   TEXT NOT NULL DEFAULT '[]',
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    { name: 'Add email to recruit_requests',             sql: `ALTER TABLE recruit_requests ADD COLUMN email             TEXT NOT NULL DEFAULT ''` },
    { name: 'Add contact_number to recruit_requests',    sql: `ALTER TABLE recruit_requests ADD COLUMN contact_number    TEXT NOT NULL DEFAULT ''` },
    { name: 'Add tiktok_username to recruit_requests',   sql: `ALTER TABLE recruit_requests ADD COLUMN tiktok_username   TEXT NOT NULL DEFAULT ''` },
    { name: 'Add follower_range to recruit_requests',    sql: `ALTER TABLE recruit_requests ADD COLUMN follower_range    TEXT NOT NULL DEFAULT ''` },
    { name: 'Add live_experience to recruit_requests',   sql: `ALTER TABLE recruit_requests ADD COLUMN live_experience   TEXT NOT NULL DEFAULT ''` },
    { name: 'Add collab_preference to recruit_requests', sql: `ALTER TABLE recruit_requests ADD COLUMN collab_preference TEXT NOT NULL DEFAULT '[]'` },
    { name: 'Add video_link to recruit_requests',        sql: `ALTER TABLE recruit_requests ADD COLUMN video_link        TEXT NOT NULL DEFAULT ''` },
    { name: 'Add disabled to users',        sql: `ALTER TABLE users ADD COLUMN disabled         INTEGER NOT NULL DEFAULT 0` },
    { name: 'Add token_version to users',   sql: `ALTER TABLE users ADD COLUMN token_version    INTEGER NOT NULL DEFAULT 0` },
    { name: 'Add last_login_at to users',   sql: `ALTER TABLE users ADD COLUMN last_login_at    TEXT` },
    { name: 'Add last_login_ip to users',   sql: `ALTER TABLE users ADD COLUMN last_login_ip    TEXT` },
    { name: 'Add last_login_device to users', sql: `ALTER TABLE users ADD COLUMN last_login_device TEXT` },
    { name: 'Add last_login_country to users', sql: `ALTER TABLE users ADD COLUMN last_login_country TEXT` },
    { name: 'Add last_login_city to users', sql: `ALTER TABLE users ADD COLUMN last_login_city  TEXT` },
  ]

  for (const step of steps) {
    try {
      await DB.prepare(step.sql).run()
      results.push({ step: step.name, status: 'ok' })
    } catch (e) {
      results.push({ step: step.name, status: 'error', error: e.message })
    }
  }

  // Seed only if creators table is empty
  const { results: existing } = await DB.prepare('SELECT COUNT(*) as count FROM creators').all()
  const count = existing[0]?.count ?? 0

  if (count === 0) {
    const persona = {
      '1': JSON.stringify({ contentStyle:'Aesthetic & Inspirational', toneOfVoice:'Soft-spoken, Warm, Relatable', brandFitTags:['Halal','Wellness','Modest Fashion','Family-friendly','Eco-friendly','Budget-friendly'], audienceAgeRange:'18–34', audienceGender:'78% Female', audienceLocations:'MY, SG, ID', engagementStyle:'High comment interaction, frequent Q&A sessions, polls-driven content strategy', pastCollabs:['Wardah','Shopee','Hana Tajima','Nestlé MY','Hijab House','Safi'], dos:['Lifestyle integration briefs','Storytelling-style content','Ramadan & festive campaigns','Long-form TikTok series','Behind-the-scenes content'], donts:['Hard-sell or pushy scripts','Political or controversial topics','Alcohol or non-halal products','Last-minute briefs under 1 week','Generic product shots only'], internalNotes:"Prefers communication via WhatsApp only. Needs minimum 2 weeks lead time for video content. Has declined 2 alcohol-related briefs — do not send. Preferred shooting days: Tue–Thu." }),
      '2': JSON.stringify({ contentStyle:'Educational & In-depth', toneOfVoice:'Professional, Analytical, Witty', brandFitTags:['Tech','Gaming','Premium','Youth','Male-skewed'], audienceAgeRange:'22–35', audienceGender:'82% Male', audienceLocations:'MY, SG, BN', engagementStyle:'Deep-dive comments, long watch time, community tab polls', pastCollabs:['Samsung','Razer','Grab','Maxis'], dos:['Long-form product reviews','Comparison videos','Tech unboxings','Sponsored segments with B-roll'], donts:['Lifestyle or fashion content','Short-form only briefs','Overly scripted reads'], internalNotes:'Prefers email for briefs. Very detail-oriented — always sends questions before shooting. Allow 3+ weeks for full reviews.' }),
      '3': JSON.stringify({ contentStyle:'Aesthetic & Tutorial-driven', toneOfVoice:'Bubbly, Friendly, Encouraging', brandFitTags:['Beauty','Skincare','Halal','Youth','Female-skewed'], audienceAgeRange:'16–28', audienceGender:'91% Female', audienceLocations:'MY, ID', engagementStyle:'Story polls, DM replies, save-worthy posts', pastCollabs:["L'Oreal MY",'Guardian','Innisfree','Althea'], dos:['GRWM content','Skincare routines','Product hauls','Tutorial reels'], donts:['Non-halal beauty brands','Very corporate tone','Low quality props'], internalNotes:'Responds quickly on Instagram DM. Very creative — give room to style the shot. Great for aesthetic flat-lays.' }),
      '4': JSON.stringify({ contentStyle:'Raw & Authentic', toneOfVoice:'Casual, Humorous, Relatable', brandFitTags:['Food','Lifestyle','Budget-friendly','Family'], audienceAgeRange:'18–30', audienceGender:'65% Female', audienceLocations:'MY', engagementStyle:'Duet and stitch culture, comment banter, trend-hopping', pastCollabs:['GrabFood','Jollibee MY',"Brahim's"], dos:['Food reviews','Day-in-my-life','Trending audio usage','Spontaneous content'], donts:['Scripted dialogue','Long lead times','Heavily edited content'], internalNotes:'Currently on hold due to personal commitments. Follow up in July 2026. Works best with short turnaround briefs.' }),
      '5': JSON.stringify({ contentStyle:'Entertaining & Community-driven', toneOfVoice:'Energetic, Gamer slang, Inclusive', brandFitTags:['Gaming','Tech','Youth','Male-skewed','Energy drinks'], audienceAgeRange:'16–26', audienceGender:'78% Male', audienceLocations:'MY, SG, PH', engagementStyle:'Live stream chat, Discord community, YouTube membership', pastCollabs:['Razer','Monster Energy','Logitech'], dos:['In-game sponsored segments','Live stream integrations','Gaming peripheral reviews'], donts:['Lifestyle content','Formal tone','Non-gaming categories'], internalNotes:'Best reached on Discord. Very engaged community. Ideal for gaming peripheral and energy drink brands.' }),
      '6': JSON.stringify({ contentStyle:'Educational & Clean', toneOfVoice:'Calm, Trustworthy, Informative', brandFitTags:['Skincare','Halal Beauty','Clean Beauty','Female-skewed'], audienceAgeRange:'20–32', audienceGender:'94% Female', audienceLocations:'MY', engagementStyle:'High saves, story Q&A, skincare quiz content', pastCollabs:['Cetaphil','Simple MY'], dos:['Ingredient deep-dives','Before/after content','Skincare routine reels'], donts:['Non-halal beauty','Heavy makeup content','Fast fashion'], internalNotes:'New creator — handle with care. Still building confidence on camera. Give detailed briefs with examples.' }),
    }

    const creatorsData = [
      ['1','SR','Siti Rania',   'TikTok',    'Lifestyle & Wellness, Fashion','', 520000,9200,92,'Active', 'Sarah K.','WhatsApp',    '2024-01-15','v','+60 12-345 6789','siti.rania@gmail.com',   '@sitirania',        '1998-03-22'],
      ['2','HZ','Hafiz Zaki',   'YouTube',   'Tech, Gaming',              '',  380000,6200,62,'Active', 'Lina M.', 'Email',       '2023-08-20','b','+60 11-234 5678','hafiz.zaki@gmail.com',   '@hafizzaki',        '1995-07-14'],
      ['3','AN','Aina Nadia',   'Instagram', 'Beauty, Skincare',           '',  210000,2700,27,'Active', 'Sarah K.','Instagram DM','2024-03-10','g','+60 10-987 6543','aina.nadia@gmail.com',   '@ainanadia',        '2001-11-05'],
      ['4','FH','Farah Hana',   'TikTok',    'Food & Lifestyle, Entertainment','',145000,1100,11,'Pending to sign','Lina M.', 'WhatsApp',    '2024-06-01','r','+60 17-654 3210','farah.hana@gmail.com',   '@farahhana.my',     '1999-08-30'],
      ['5','RI','Razif Idham',  'YouTube',   'Gaming, Tech',               '',  280000, 800, 8,'Active', 'Sarah K.','Discord',     '2025-01-05','t','+60 16-888 9900','razif.idham@gmail.com',  '@razifidham',       '2000-02-18'],
      ['6','NZ','Nur Zulaikha', 'Instagram', 'Skincare, Beauty',           '',   94000, 290, 3,'Active', 'Lina M.', 'WhatsApp',    '2025-11-20','i','+60 13-456 7890','nur.zulaikha@gmail.com', '@nurzulaikha.skin', '2002-05-09'],
    ]

    for (const [id, initials, name, platform, niche, secondary_niche, followers, coins, tasks_completed, status, pic, contact, joined_date, avatar_color, contact_number, email, platform_username, date_of_birth] of creatorsData) {
      const enc_contact_number = await encryptField(contact_number, env)
      const enc_email          = await encryptField(email, env)
      await DB.prepare(
        `INSERT OR IGNORE INTO creators (id,initials,name,platform,niche,secondary_niche,followers,coins,tasks_completed,status,pic,contact,joined_date,avatar_color,persona,contact_number,email,platform_username,date_of_birth) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(id,initials,name,platform,niche,secondary_niche,followers,coins,tasks_completed,status,pic,contact,joined_date,avatar_color,persona[id],enc_contact_number,enc_email,platform_username,date_of_birth).run()
    }

    const tasksData = [
      ['t1','1','Siti Rania','TikTok','Film Lifestyle Reel','Ramadan Campaign','In Progress','High','Sarah K.','2026-04-18',100],
      ['t2','2','Hafiz Zaki','YouTube','Submit Draft Caption','Brand Launch Q2','Under Review','Medium','Lina M.','2026-04-16',100],
      ['t3','3','Aina Nadia','Instagram','Post IG Reel','Skincare Series','Completed','Low','Sarah K.','2026-04-12',100],
      ['t4','4','Farah Hana','TikTok','Record TikTok GRWM','Ramadan Campaign','Overdue','Urgent','Lina M.','2026-04-10',100],
      ['t5','5','Razif Idham','YouTube','Brand Mention in Vlog','Brand Launch Q2','Not Started','Medium','Sarah K.','2026-04-25',100],
      ['t6','6','Nur Zulaikha','Instagram','Skincare GRWM Video','Skincare Series','In Progress','High','Lina M.','2026-04-20',100],
    ]

    for (const [id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins] of tasksData) {
      await DB.prepare(
        `INSERT OR IGNORE INTO tasks (id,creator_id,creator_name,platform,task,project,status,priority,pic,due_date,coins) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins).run()
    }

    const recruitsData = [
      ['r1','HS','Hanis Sofea', 'TikTok',   78000,11.4,'Fashion, Lifestyle',  '["Fashion","Lifestyle"]',     '2026-04-13','Registration Form','Unassigned','','Pending',      'v','hanis.sofea@gmail.com', '+60 11-456 7890','@hanissofea',        '50k-100k','Yes','["Gifted Products","Paid Campaigns"]',                       'tiktok.com/@hanissofea/video/7380124956'],
      ['r2','DA','Danial Amir', 'TikTok',   42000, 9.8,'Food & Lifestyle',    '["Food & Lifestyle"]',        '2026-04-11','Registration Form','Unassigned','','Under Review','r','danial.amir@gmail.com', '+60 12-789 0123','@danial.amir',        '10k-50k', 'No','["Affiliate/commission-based","Long-term partnerships"]',   'tiktok.com/@danial.amir/video/6942038571'],
      ['r3','AM','Aqil Mukhriz','TikTok',   51000, 9.2,'Fitness, Lifestyle',  '["Fitness","Lifestyle"]',     '2026-04-14','Registration Form','Unassigned','','Pending',      'g','aqil.mukhriz@gmail.com','+60 19-234 5678','@aqilmukhriz',        '50k-100k','Yes','["Gifted Products","Affiliate/commission-based"]',          'tiktok.com/@aqilmukhriz/video/8015623490'],
    ]

    for (const [id, initials, name, platform, followers, engagement_rate, niche, tags, applied_date, source, pic, description, status, avatar_color, email, contact_number, tiktok_username, follower_range, live_experience, collab_preference, video_link] of recruitsData) {
      await DB.prepare(
        `INSERT OR IGNORE INTO recruit_requests (id,initials,name,platform,followers,engagement_rate,niche,tags,applied_date,source,pic,description,status,avatar_color,email,contact_number,tiktok_username,follower_range,live_experience,collab_preference,video_link) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(id,initials,name,platform,followers,engagement_rate,niche,tags,applied_date,source,pic,description,status,avatar_color,email,contact_number,tiktok_username,follower_range,live_experience,collab_preference,video_link).run()
    }

    const activityData = [
      ['a1','green','<strong>Aina Nadia</strong> completed Post IG Reel — <strong>+100 coins</strong>','2h ago'],
      ['a2','amber',"<strong>Hafiz Zaki</strong>'s draft moved to Under Review",'4h ago'],
      ['a3','blue','<strong>Nur Zulaikha</strong> recruit approved — Bronze tier','Yesterday'],
      ['a4','red',"<strong>Farah Hana</strong>'s task is now overdue",'Yesterday'],
      ['a5','purple','<strong>Siti Rania</strong> reached Platinum tier 👑','3 days ago'],
    ]

    for (const [id, color, text, time] of activityData) {
      await DB.prepare(
        `INSERT OR IGNORE INTO activity_feed (id,color,text,time) VALUES (?,?,?,?)`
      ).bind(id, color, text, time).run()
    }

    const brandsData = [
      ['brand1', 'Wardah',    'Beauty & Skincare', '#8B5CF6', 'wardah.com'],
      ['brand2', 'Shopee',    'E-commerce',        '#EE4D2D', 'shopee.my'],
      ['brand3', 'Nestlé MY', 'FMCG',              '#009FE3', 'nestle.com.my'],
    ]

    for (const [id, name, industry, color, website] of brandsData) {
      await DB.prepare(
        `INSERT OR IGNORE INTO brands (id,name,industry,color,website) VALUES (?,?,?,?,?)`
      ).bind(id, name, industry, color, website).run()
    }

    const campaignsData = [
      ['camp1', 'Ramadan Campaign',  'Eid season promotion across social platforms', 'Active',   15000, '2025-02-15', '2025-04-05', '#6C5CE7', 'brand1', 'Wardah'],
      ['camp2', 'Brand Launch Q2',   'New product line launch with key creators',    'Active',   25000, '2025-04-01', '2025-06-30', '#0891B2', 'brand2', 'Shopee'],
      ['camp3', 'Skincare Series',   'Ongoing skincare content series',              'Planning',  8000, '2025-05-01', '2025-07-31', '#D97706', 'brand1', 'Wardah'],
    ]

    for (const [id, name, description, status, budget, start_date, end_date, color, brand_id, brand_name] of campaignsData) {
      await DB.prepare(
        `INSERT OR IGNORE INTO campaigns (id,name,description,status,budget,start_date,end_date,color,brand_id,brand_name) VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).bind(id, name, description, status, budget, start_date, end_date, color, brand_id, brand_name).run()
    }

    results.push({ step: 'Seed data', status: 'ok', inserted: 'creators, tasks, recruits, activity, campaigns, brands' })
  } else {
    results.push({ step: 'Seed data', status: 'skipped', reason: `${count} creators already exist` })
  }

  // Seed default users if none exist
  const { results: existingUsers } = await DB.prepare('SELECT COUNT(*) as count FROM users').all()
  if ((existingUsers[0]?.count ?? 0) === 0) {
    const defaultUsers = [
      { id: 'u1', username: 'admin',  displayName: 'Admin',    password: 'admin123',  role: 'admin',
        permissions: ['users.manage','contacts.view_all','creators.edit','campaigns.manage','brands.manage','recruits.approve'] },
      { id: 'u2', username: 'sarah',  displayName: 'Sarah K.', password: 'sarah123',  role: 'pic',
        permissions: ['contacts.view_assigned','creators.edit'] },
      { id: 'u3', username: 'lina',   displayName: 'Lina M.',  password: 'lina123',   role: 'pic',
        permissions: ['contacts.view_assigned','creators.edit'] },
    ]
    for (const u of defaultUsers) {
      const hash = await hashPassword(u.password)
      await DB.prepare(`INSERT OR IGNORE INTO users (id,username,display_name,password_hash,role,permissions) VALUES (?,?,?,?,?,?)`)
        .bind(u.id, u.username, u.displayName, hash, u.role, JSON.stringify(u.permissions)).run()
    }
    results.push({ step: 'Seed users', status: 'ok', inserted: defaultUsers.map(u => u.username).join(', ') })
  } else {
    results.push({ step: 'Seed users', status: 'skipped', reason: 'users already exist' })
  }

  return Response.json({ success: true, results }, { status: 200 })
}
