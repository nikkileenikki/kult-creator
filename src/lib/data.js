export const NICHES = [
  'Lifestyle & Wellness', 'Beauty', 'Skincare', 'Fashion', 'Food & Lifestyle',
  'Tech', 'Gaming', 'Fitness', 'Travel', 'Parenting', 'Finance', 'Education',
  'Entertainment', 'Automotive', 'Sports', 'Home & Decor', 'Pet', 'Music', 'Comedy',
]

export const BRAND_INDUSTRIES = [
  'Beauty & Skincare', 'E-commerce', 'FMCG', 'Tech', 'Gaming', 'F&B',
  'Fashion', 'Health & Wellness', 'Retail', 'Finance', 'Automotive', 'Other',
]

export const BRANDS = [
  { id: 'brand1', name: 'Wardah',    industry: 'Beauty & Skincare', color: '#8B5CF6', website: 'wardah.com' },
  { id: 'brand2', name: 'Shopee',    industry: 'E-commerce',        color: '#EE4D2D', website: 'shopee.my' },
  { id: 'brand3', name: 'Nestlé MY', industry: 'FMCG',              color: '#009FE3', website: 'nestle.com.my' },
]

export const PROJECTS = ['Ramadan Campaign', 'Brand Launch Q2', 'Skincare Series']
export const PICS = ['Sarah K.', 'Lina M.']
export const PLATFORMS = ['TikTok', 'YouTube', 'Instagram', 'X / Twitter', 'LinkedIn']
export const CONTACT_METHODS = ['WhatsApp', 'Email', 'Instagram DM', 'Discord', 'Telegram']
export const AVATAR_COLOR_OPTIONS = [
  { key: 'v', gradient: 'from-violet-600 to-violet-400', label: 'Violet' },
  { key: 'b', gradient: 'from-blue-600 to-blue-400',     label: 'Blue' },
  { key: 'g', gradient: 'from-emerald-600 to-emerald-400', label: 'Green' },
  { key: 'a', gradient: 'from-amber-600 to-amber-400',   label: 'Amber' },
  { key: 'r', gradient: 'from-rose-700 to-rose-400',     label: 'Rose' },
  { key: 't', gradient: 'from-teal-700 to-teal-400',     label: 'Teal' },
  { key: 'i', gradient: 'from-purple-700 to-purple-400', label: 'Purple' },
]

export const CREATORS = [
  {
    id: '1', initials: 'SR', name: 'Siti Rania', platform: 'TikTok', secondaryPlatform: 'Instagram',
    niche: 'Lifestyle & Wellness', secondaryNiche: 'Fashion', followers: 520000, coins: 9200,
    tasksCompleted: 92, status: 'Active', pic: 'Sarah K.',
    contact: 'WhatsApp', joinedDate: '2024-01-15', avatarColor: 'v',
    contactNumber: '+60 12-345 6789', email: 'siti.rania@gmail.com', platformUsername: '@sitirania', dateOfBirth: '1998-03-22',
    persona: {
      contentStyle: 'Aesthetic & Inspirational',
      toneOfVoice: 'Soft-spoken, Warm, Relatable',
      brandFitTags: ['Halal', 'Wellness', 'Modest Fashion', 'Family-friendly', 'Eco-friendly', 'Budget-friendly'],
      audienceAgeRange: '18–34',
      audienceGender: '78% Female',
      audienceLocations: 'MY, SG, ID',
      engagementStyle: 'High comment interaction, frequent Q&A sessions, polls-driven content strategy',
      pastCollabs: ['Wardah', 'Shopee', 'Hana Tajima', 'Nestlé MY', 'Hijab House', 'Safi'],
      dos: ['Lifestyle integration briefs', 'Storytelling-style content', 'Ramadan & festive campaigns', 'Long-form TikTok series', 'Behind-the-scenes content'],
      donts: ['Hard-sell or pushy scripts', 'Political or controversial topics', 'Alcohol or non-halal products', 'Last-minute briefs under 1 week', 'Generic product shots only'],
      internalNotes: 'Prefers communication via WhatsApp only. Needs minimum 2 weeks lead time for video content. Has declined 2 alcohol-related briefs — do not send. Preferred shooting days: Tue–Thu.',
    },
  },
  {
    id: '2', initials: 'HZ', name: 'Hafiz Zaki', platform: 'YouTube', secondaryPlatform: 'Instagram',
    niche: 'Tech', secondaryNiche: 'Gaming', followers: 380000, coins: 6200,
    tasksCompleted: 62, status: 'Active', pic: 'Lina M.',
    contact: 'Email', joinedDate: '2023-08-20', avatarColor: 'b',
    contactNumber: '+60 11-234 5678', email: 'hafiz.zaki@gmail.com', platformUsername: '@hafizzaki', dateOfBirth: '1995-07-14',
    persona: {
      contentStyle: 'Educational & In-depth',
      toneOfVoice: 'Professional, Analytical, Witty',
      brandFitTags: ['Tech', 'Gaming', 'Premium', 'Youth', 'Male-skewed'],
      audienceAgeRange: '22–35',
      audienceGender: '82% Male',
      audienceLocations: 'MY, SG, BN',
      engagementStyle: 'Deep-dive comments, long watch time, community tab polls',
      pastCollabs: ['Samsung', 'Razer', 'Grab', 'Maxis'],
      dos: ['Long-form product reviews', 'Comparison videos', 'Tech unboxings', 'Sponsored segments with B-roll'],
      donts: ['Lifestyle or fashion content', 'Short-form only briefs', 'Overly scripted reads'],
      internalNotes: 'Prefers email for briefs. Very detail-oriented — always sends questions before shooting. Allow 3+ weeks for full reviews.',
    },
  },
  {
    id: '3', initials: 'AN', name: 'Aina Nadia', platform: 'Instagram', secondaryPlatform: 'TikTok',
    niche: 'Beauty', secondaryNiche: 'Skincare', followers: 210000, coins: 2700,
    tasksCompleted: 27, status: 'Active', pic: 'Sarah K.',
    contact: 'Instagram DM', joinedDate: '2024-03-10', avatarColor: 'g',
    contactNumber: '+60 10-987 6543', email: 'aina.nadia@gmail.com', platformUsername: '@ainanadia', dateOfBirth: '2001-11-05',
    persona: {
      contentStyle: 'Aesthetic & Tutorial-driven',
      toneOfVoice: 'Bubbly, Friendly, Encouraging',
      brandFitTags: ['Beauty', 'Skincare', 'Halal', 'Youth', 'Female-skewed'],
      audienceAgeRange: '16–28',
      audienceGender: '91% Female',
      audienceLocations: 'MY, ID',
      engagementStyle: 'Story polls, DM replies, save-worthy posts',
      pastCollabs: ['L\'Oreal MY', 'Guardian', 'Innisfree', 'Althea'],
      dos: ['GRWM content', 'Skincare routines', 'Product hauls', 'Tutorial reels'],
      donts: ['Non-halal beauty brands', 'Very corporate tone', 'Low quality props'],
      internalNotes: 'Responds quickly on Instagram DM. Very creative — give room to style the shot. Great for aesthetic flat-lays.',
    },
  },
  {
    id: '4', initials: 'FH', name: 'Farah Hana', platform: 'TikTok', secondaryPlatform: '',
    niche: 'Food & Lifestyle', secondaryNiche: 'Entertainment', followers: 145000, coins: 1100,
    tasksCompleted: 11, status: 'On Hold', pic: 'Lina M.',
    contact: 'WhatsApp', joinedDate: '2024-06-01', avatarColor: 'r',
    contactNumber: '+60 17-654 3210', email: 'farah.hana@gmail.com', platformUsername: '@farahhana.my', dateOfBirth: '1999-08-30',
    persona: {
      contentStyle: 'Raw & Authentic',
      toneOfVoice: 'Casual, Humorous, Relatable',
      brandFitTags: ['Food', 'Lifestyle', 'Budget-friendly', 'Family'],
      audienceAgeRange: '18–30',
      audienceGender: '65% Female',
      audienceLocations: 'MY',
      engagementStyle: 'Duet and stitch culture, comment banter, trend-hopping',
      pastCollabs: ['GrabFood', 'Jollibee MY', 'Brahim\'s'],
      dos: ['Food reviews', 'Day-in-my-life', 'Trending audio usage', 'Spontaneous content'],
      donts: ['Scripted dialogue', 'Long lead times', 'Heavily edited content'],
      internalNotes: 'Currently on hold due to personal commitments. Follow up in July 2026. Works best with short turnaround briefs.',
    },
  },
  {
    id: '5', initials: 'RI', name: 'Razif Idham', platform: 'YouTube', secondaryPlatform: 'TikTok',
    niche: 'Gaming', secondaryNiche: 'Tech', followers: 280000, coins: 800,
    tasksCompleted: 8, status: 'Active', pic: 'Sarah K.',
    contact: 'Discord', joinedDate: '2025-01-05', avatarColor: 't',
    contactNumber: '+60 16-888 9900', email: 'razif.idham@gmail.com', platformUsername: '@razifidham', dateOfBirth: '2000-02-18',
    persona: {
      contentStyle: 'Entertaining & Community-driven',
      toneOfVoice: 'Energetic, Gamer slang, Inclusive',
      brandFitTags: ['Gaming', 'Tech', 'Youth', 'Male-skewed', 'Energy drinks'],
      audienceAgeRange: '16–26',
      audienceGender: '78% Male',
      audienceLocations: 'MY, SG, PH',
      engagementStyle: 'Live stream chat, Discord community, YouTube membership',
      pastCollabs: ['Razer', 'Monster Energy', 'Logitech'],
      dos: ['In-game sponsored segments', 'Live stream integrations', 'Gaming peripheral reviews'],
      donts: ['Lifestyle content', 'Formal tone', 'Non-gaming categories'],
      internalNotes: 'Best reached on Discord. Very engaged community. Ideal for gaming peripheral and energy drink brands.',
    },
  },
  {
    id: '6', initials: 'NZ', name: 'Nur Zulaikha', platform: 'Instagram', secondaryPlatform: '',
    niche: 'Skincare', secondaryNiche: 'Beauty', followers: 94000, coins: 290,
    tasksCompleted: 3, status: 'Active', pic: 'Lina M.',
    contact: 'WhatsApp', joinedDate: '2025-11-20', avatarColor: 'i',
    contactNumber: '+60 13-456 7890', email: 'nur.zulaikha@gmail.com', platformUsername: '@nurzulaikha.skin', dateOfBirth: '2002-05-09',
    persona: {
      contentStyle: 'Educational & Clean',
      toneOfVoice: 'Calm, Trustworthy, Informative',
      brandFitTags: ['Skincare', 'Halal Beauty', 'Clean Beauty', 'Female-skewed'],
      audienceAgeRange: '20–32',
      audienceGender: '94% Female',
      audienceLocations: 'MY',
      engagementStyle: 'High saves, story Q&A, skincare quiz content',
      pastCollabs: ['Cetaphil', 'Simple MY'],
      dos: ['Ingredient deep-dives', 'Before/after content', 'Skincare routine reels'],
      donts: ['Non-halal beauty', 'Heavy makeup content', 'Fast fashion'],
      internalNotes: 'New creator — handle with care. Still building confidence on camera. Give detailed briefs with examples.',
    },
  },
]

export const TASKS = [
  { id: 't1', creatorId: '1', creatorName: 'Siti Rania', platform: 'TikTok', task: 'Film Lifestyle Reel', project: 'Ramadan Campaign', status: 'In Progress', pic: 'Sarah K.', dueDate: '2026-04-18', priority: 'High', coins: 100 },
  { id: 't2', creatorId: '2', creatorName: 'Hafiz Zaki', platform: 'YouTube', task: 'Submit Draft Caption', project: 'Brand Launch Q2', status: 'Under Review', pic: 'Lina M.', dueDate: '2026-04-16', priority: 'Medium', coins: 100 },
  { id: 't3', creatorId: '3', creatorName: 'Aina Nadia', platform: 'Instagram', task: 'Post IG Reel', project: 'Skincare Series', status: 'Completed', pic: 'Sarah K.', dueDate: '2026-04-12', priority: 'Low', coins: 100, rating: 5, review: 'Delivered on time, great quality reel. Engagement was above average.' },
  { id: 't4', creatorId: '4', creatorName: 'Farah Hana', platform: 'TikTok', task: 'Record TikTok GRWM', project: 'Ramadan Campaign', status: 'Overdue', pic: 'Lina M.', dueDate: '2026-04-10', priority: 'Urgent', coins: 100 },
  { id: 't5', creatorId: '5', creatorName: 'Razif Idham', platform: 'YouTube', task: 'Brand Mention in Vlog', project: 'Brand Launch Q2', status: 'Not Started', pic: 'Sarah K.', dueDate: '2026-04-25', priority: 'Medium', coins: 100 },
  { id: 't6', creatorId: '6', creatorName: 'Nur Zulaikha', platform: 'Instagram', task: 'Skincare GRWM Video', project: 'Skincare Series', status: 'In Progress', pic: 'Lina M.', dueDate: '2026-04-20', priority: 'High', coins: 100 },
]

export const CAMPAIGNS = [
  { id: 'camp1', name: 'Ramadan Campaign', description: 'Eid season promotion across social platforms', status: 'Active',   budget: 15000, startDate: '2025-02-15', endDate: '2025-04-05', color: '#6C5CE7', brandId: 'brand1', brandName: 'Wardah' },
  { id: 'camp2', name: 'Brand Launch Q2',  description: 'New product line launch with key creators',    status: 'Active',   budget: 25000, startDate: '2025-04-01', endDate: '2025-06-30', color: '#0891B2', brandId: 'brand2', brandName: 'Shopee' },
  { id: 'camp3', name: 'Skincare Series',  description: 'Ongoing skincare content series',              status: 'Planning', budget: 8000,  startDate: '2025-05-01', endDate: '2025-07-31', color: '#D97706', brandId: 'brand1', brandName: 'Wardah' },
]

export const RECRUIT_REQUESTS = [
  {
    id: 'r1', initials: 'HS', name: 'Hanis Sofea', platform: 'TikTok',
    followers: 78000, engagementRate: 11.4, niche: 'Fashion',
    tags: ['TikTok', 'Fashion', 'Modest Wear'], appliedDate: '2026-04-13',
    source: 'Link in Bio', pic: 'Unassigned',
    description: 'Modest fashion creator known for outfit styling videos. Strong Gen-Z audience. Previous collabs with local modest wear brands and Zalora MY.',
    status: 'Pending', avatarColor: 'v',
  },
  {
    id: 'r2', initials: 'DA', name: 'Danial Amir', platform: 'Instagram',
    followers: 42000, engagementRate: 9.8, niche: 'Food & Lifestyle',
    tags: ['Instagram', 'Food', 'Lifestyle'], appliedDate: '2026-04-11',
    source: 'Referral', pic: 'Lina M.',
    description: 'Food and lifestyle creator based in KL. Specialises in restaurant reviews and recipe reels. High save rate on food content. Very consistent posting schedule.',
    status: 'Under Review', avatarColor: 'r',
  },
  {
    id: 'r3', initials: 'AM', name: 'Aqil Mukhriz', platform: 'TikTok',
    followers: 51000, engagementRate: 9.2, niche: 'Fitness',
    tags: ['TikTok', 'Fitness', 'Wellness'], appliedDate: '2026-04-14',
    source: 'Referral', pic: 'Unassigned',
    description: 'Active fitness creator posting daily workout challenges. Strong Gen-Z following. Interested in health supplement and sportswear brand deals.',
    status: 'Pending', avatarColor: 'g',
  },
]

export const ACTIVITY_FEED = [
  { id: 'a1', color: 'green',  text: '<strong>Aina Nadia</strong> completed Post IG Reel — <strong>+100 coins</strong>', time: '2h ago' },
  { id: 'a2', color: 'amber',  text: '<strong>Hafiz Zaki</strong>\'s draft moved to Under Review', time: '4h ago' },
  { id: 'a3', color: 'blue',   text: '<strong>Nur Zulaikha</strong> recruit approved — Bronze tier', time: 'Yesterday' },
  { id: 'a4', color: 'red',    text: '<strong>Farah Hana</strong>\'s task is now overdue', time: 'Yesterday' },
  { id: 'a5', color: 'purple', text: '<strong>Siti Rania</strong> reached Platinum tier 👑', time: '3 days ago' },
]
