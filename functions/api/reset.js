import { json, err, opts, getDB } from './_helpers'

export const onRequestOptions = () => opts()

export async function onRequestPost({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)

  // Ensure columns exist before truncating
  const migrations = [
    `ALTER TABLE tasks    ADD COLUMN notes           TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE creators ADD COLUMN secondary_niche TEXT NOT NULL DEFAULT ''`,
  ]
  for (const sql of migrations) {
    try { await db.prepare(sql).run() } catch (_) { /* already exists */ }
  }

  // Truncate all tables
  const tables = ['tasks', 'recruit_requests', 'activity_feed', 'campaigns', 'creators']
  for (const t of tables) {
    await db.prepare(`DELETE FROM ${t}`).run()
  }

  // Seed creators
  const personas = {
    '1': JSON.stringify({ contentStyle:'Aesthetic & Inspirational', toneOfVoice:'Soft-spoken, Warm, Relatable', brandFitTags:['Halal','Wellness','Modest Fashion','Family-friendly','Eco-friendly','Budget-friendly'], audienceAgeRange:'18–34', audienceGender:'78% Female', audienceLocations:'MY, SG, ID', engagementStyle:'High comment interaction, frequent Q&A sessions, polls-driven content strategy', pastCollabs:['Wardah','Shopee','Hana Tajima','Nestlé MY','Hijab House','Safi'], dos:['Lifestyle integration briefs','Storytelling-style content','Ramadan & festive campaigns','Long-form TikTok series','Behind-the-scenes content'], donts:['Hard-sell or pushy scripts','Political or controversial topics','Alcohol or non-halal products','Last-minute briefs under 1 week','Generic product shots only'], internalNotes:"Prefers communication via WhatsApp only. Needs minimum 2 weeks lead time for video content. Has declined 2 alcohol-related briefs — do not send. Preferred shooting days: Tue–Thu." }),
    '2': JSON.stringify({ contentStyle:'Educational & In-depth', toneOfVoice:'Professional, Analytical, Witty', brandFitTags:['Tech','Gaming','Premium','Youth','Male-skewed'], audienceAgeRange:'22–35', audienceGender:'82% Male', audienceLocations:'MY, SG, BN', engagementStyle:'Deep-dive comments, long watch time, community tab polls', pastCollabs:['Samsung','Razer','Grab','Maxis'], dos:['Long-form product reviews','Comparison videos','Tech unboxings','Sponsored segments with B-roll'], donts:['Lifestyle or fashion content','Short-form only briefs','Overly scripted reads'], internalNotes:'Prefers email for briefs. Very detail-oriented — always sends questions before shooting. Allow 3+ weeks for full reviews.' }),
    '3': JSON.stringify({ contentStyle:'Aesthetic & Tutorial-driven', toneOfVoice:'Bubbly, Friendly, Encouraging', brandFitTags:['Beauty','Skincare','Halal','Youth','Female-skewed'], audienceAgeRange:'16–28', audienceGender:'91% Female', audienceLocations:'MY, ID', engagementStyle:'Story polls, DM replies, save-worthy posts', pastCollabs:["L'Oreal MY",'Guardian','Innisfree','Althea'], dos:['GRWM content','Skincare routines','Product hauls','Tutorial reels'], donts:['Non-halal beauty brands','Very corporate tone','Low quality props'], internalNotes:'Responds quickly on Instagram DM. Very creative — give room to style the shot. Great for aesthetic flat-lays.' }),
    '4': JSON.stringify({ contentStyle:'Raw & Authentic', toneOfVoice:'Casual, Humorous, Relatable', brandFitTags:['Food','Lifestyle','Budget-friendly','Family'], audienceAgeRange:'18–30', audienceGender:'65% Female', audienceLocations:'MY', engagementStyle:'Duet and stitch culture, comment banter, trend-hopping', pastCollabs:['GrabFood','Jollibee MY',"Brahim's"], dos:['Food reviews','Day-in-my-life','Trending audio usage','Spontaneous content'], donts:['Scripted dialogue','Long lead times','Heavily edited content'], internalNotes:'Currently on hold due to personal commitments. Follow up in July 2026. Works best with short turnaround briefs.' }),
    '5': JSON.stringify({ contentStyle:'Entertaining & Community-driven', toneOfVoice:'Energetic, Gamer slang, Inclusive', brandFitTags:['Gaming','Tech','Youth','Male-skewed','Energy drinks'], audienceAgeRange:'16–26', audienceGender:'78% Male', audienceLocations:'MY, SG, PH', engagementStyle:'Live stream chat, Discord community, YouTube membership', pastCollabs:['Razer','Monster Energy','Logitech'], dos:['In-game sponsored segments','Live stream integrations','Gaming peripheral reviews'], donts:['Lifestyle content','Formal tone','Non-gaming categories'], internalNotes:'Best reached on Discord. Very engaged community. Ideal for gaming peripheral and energy drink brands.' }),
    '6': JSON.stringify({ contentStyle:'Educational & Clean', toneOfVoice:'Calm, Trustworthy, Informative', brandFitTags:['Skincare','Halal Beauty','Clean Beauty','Female-skewed'], audienceAgeRange:'20–32', audienceGender:'94% Female', audienceLocations:'MY', engagementStyle:'High saves, story Q&A, skincare quiz content', pastCollabs:['Cetaphil','Simple MY'], dos:['Ingredient deep-dives','Before/after content','Skincare routine reels'], donts:['Non-halal beauty','Heavy makeup content','Fast fashion'], internalNotes:'New creator — handle with care. Still building confidence on camera. Give detailed briefs with examples.' }),
  }

  const creatorsData = [
    ['1','SR','Siti Rania',   'TikTok',    'Lifestyle & Wellness', 'Fashion',       520000, 9200, 92, 'Active',  'Sarah K.', 'WhatsApp',    '2024-01-15', 'v'],
    ['2','HZ','Hafiz Zaki',   'YouTube',   'Tech',                 'Gaming',        380000, 6200, 62, 'Active',  'Lina M.',  'Email',       '2023-08-20', 'b'],
    ['3','AN','Aina Nadia',   'Instagram', 'Beauty',               'Skincare',      210000, 2700, 27, 'Active',  'Sarah K.', 'Instagram DM','2024-03-10', 'g'],
    ['4','FH','Farah Hana',   'TikTok',    'Food & Lifestyle',     'Entertainment', 145000, 1100, 11, 'On Hold', 'Lina M.',  'WhatsApp',    '2024-06-01', 'r'],
    ['5','RI','Razif Idham',  'YouTube',   'Gaming',               'Tech',          280000,  800,  8, 'Active',  'Sarah K.', 'Discord',     '2025-01-05', 't'],
    ['6','NZ','Nur Zulaikha', 'Instagram', 'Skincare',             'Beauty',         94000,  290,  3, 'Active',  'Lina M.',  'WhatsApp',    '2025-11-20', 'i'],
  ]
  for (const [id, initials, name, platform, niche, secondary_niche, followers, coins, tasks_completed, status, pic, contact, joined_date, avatar_color] of creatorsData) {
    await db.prepare(
      `INSERT INTO creators (id,initials,name,platform,niche,secondary_niche,followers,coins,tasks_completed,status,pic,contact,joined_date,avatar_color,persona) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, initials, name, platform, niche, secondary_niche, followers, coins, tasks_completed, status, pic, contact, joined_date, avatar_color, personas[id]).run()
  }

  // Seed tasks
  const tasksData = [
    ['t1','1','Siti Rania',   'TikTok',    'Film Lifestyle Reel',   'Ramadan Campaign','In Progress', 'High',   'Sarah K.','2026-04-18',100],
    ['t2','2','Hafiz Zaki',   'YouTube',   'Submit Draft Caption',  'Brand Launch Q2', 'Under Review','Medium', 'Lina M.', '2026-04-16',100],
    ['t3','3','Aina Nadia',   'Instagram', 'Post IG Reel',          'Skincare Series', 'Completed',   'Low',    'Sarah K.','2026-04-12',100],
    ['t4','4','Farah Hana',   'TikTok',    'Record TikTok GRWM',    'Ramadan Campaign','Overdue',     'Urgent', 'Lina M.', '2026-04-10',100],
    ['t5','5','Razif Idham',  'YouTube',   'Brand Mention in Vlog', 'Brand Launch Q2', 'Not Started', 'Medium', 'Sarah K.','2026-04-25',100],
    ['t6','6','Nur Zulaikha', 'Instagram', 'Skincare GRWM Video',   'Skincare Series', 'In Progress', 'High',   'Lina M.', '2026-04-20',100],
  ]
  for (const [id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins] of tasksData) {
    await db.prepare(
      `INSERT INTO tasks (id,creator_id,creator_name,platform,task,project,status,priority,pic,due_date,coins) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, creator_id, creator_name, platform, task, project, status, priority, pic, due_date, coins).run()
  }

  // Seed recruits
  const recruitsData = [
    ['r1','RI','Razif Idham', 'YouTube',  280000, 8.2, 'Gaming', '["YouTube","Gaming","Tech"]',             '2026-04-13','Link in Bio','Unassigned','Specialises in mobile gaming content. Portfolio includes Samsung and Razer collabs. Strong community engagement with regular live streams.','Pending',      't'],
    ['r2','NZ','Nur Zulaikha','Instagram', 94000,12.0, 'Skincare','["Instagram","Skincare","Halal Beauty"]','2026-04-11','Referral',   'Lina M.',  'Focuses on halal and clean beauty. Audience predominantly female 20–30. Very high story engagement. Strong skincare product reviews.',       'Under Review', 'i'],
    ['r3','AM','Aqil Mukhriz','TikTok',    51000, 9.2, 'Fitness','["TikTok","Fitness","Wellness"]',         '2026-04-14','Referral',   'Unassigned','Active fitness creator posting daily workout challenges. Strong Gen-Z following. Interested in health supplement and sportswear brand deals.','Pending',      'g'],
  ]
  for (const [id, initials, name, platform, followers, engagement_rate, niche, tags, applied_date, source, pic, description, status, avatar_color] of recruitsData) {
    await db.prepare(
      `INSERT INTO recruit_requests (id,initials,name,platform,followers,engagement_rate,niche,tags,applied_date,source,pic,description,status,avatar_color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, initials, name, platform, followers, engagement_rate, niche, tags, applied_date, source, pic, description, status, avatar_color).run()
  }

  // Seed activity
  const activityData = [
    ['a1','green', '<strong>Aina Nadia</strong> completed Post IG Reel — <strong>+100 coins</strong>','2h ago'],
    ['a2','amber', "<strong>Hafiz Zaki</strong>'s draft moved to Under Review",                       '4h ago'],
    ['a3','blue',  '<strong>Nur Zulaikha</strong> recruit approved — Bronze tier',                    'Yesterday'],
    ['a4','red',   "<strong>Farah Hana</strong>'s task is now overdue",                               'Yesterday'],
    ['a5','purple','<strong>Siti Rania</strong> reached Platinum tier 👑',                            '3 days ago'],
  ]
  for (const [id, color, text, time] of activityData) {
    await db.prepare(
      `INSERT INTO activity_feed (id,color,text,time) VALUES (?,?,?,?)`
    ).bind(id, color, text, time).run()
  }

  // Seed campaigns
  const campaignsData = [
    ['camp1','Ramadan Campaign','Eid season promotion across social platforms','Active',  15000,'2025-02-15','2025-04-05','#6C5CE7'],
    ['camp2','Brand Launch Q2', 'New product line launch with key creators',   'Active',  25000,'2025-04-01','2025-06-30','#0891B2'],
    ['camp3','Skincare Series', 'Ongoing skincare content series',             'Planning', 8000,'2025-05-01','2025-07-31','#D97706'],
  ]
  for (const [id, name, description, status, budget, start_date, end_date, color] of campaignsData) {
    await db.prepare(
      `INSERT INTO campaigns (id,name,description,status,budget,start_date,end_date,color) VALUES (?,?,?,?,?,?,?,?)`
    ).bind(id, name, description, status, budget, start_date, end_date, color).run()
  }

  return json({ success: true, message: 'All tables truncated and reseeded with demo data' })
}
