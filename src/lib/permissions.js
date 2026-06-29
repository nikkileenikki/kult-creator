export const ROLE_PERMISSIONS = {
  admin:   ['users.manage', 'contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve'],
  manager: ['contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve'],
  pic:     ['contacts.view_assigned', 'creators.edit'],
  viewer:  [],
  creator: ['creator.self'],
}

export const ROLES = [
  { key: 'admin',   label: 'Admin',   color: 'amber',  desc: 'Full access including user management' },
  { key: 'manager', label: 'Manager', color: 'violet', desc: 'Full access except user management' },
  { key: 'pic',     label: 'PIC',     color: 'blue',   desc: 'Manage assigned creators, view their contacts' },
  { key: 'viewer',  label: 'Viewer',  color: 'gray',   desc: 'Read-only, no contact info' },
  { key: 'creator', label: 'Creator', color: 'emerald', desc: 'Creator portal — own profile and tasks only' },
]

export const PERMISSIONS = [
  { key: 'users.manage',           label: 'User Management',        group: 'System',    desc: 'Create, edit, delete users' },
  { key: 'contacts.view_all',      label: 'View All Contacts',      group: 'Privacy',   desc: 'See phone & email of any creator' },
  { key: 'contacts.view_assigned', label: 'View Assigned Contacts', group: 'Privacy',   desc: 'See phone & email of assigned creators only' },
  { key: 'creators.edit',          label: 'Edit Creators',          group: 'Creators',  desc: 'Add and update creator profiles' },
  { key: 'campaigns.manage',       label: 'Manage Campaigns',       group: 'Campaigns', desc: 'Create and edit campaigns' },
  { key: 'brands.manage',          label: 'Manage Brands',          group: 'Brands',    desc: 'Create and edit brands' },
  { key: 'recruits.approve',       label: 'Approve Recruits',       group: 'Recruit',   desc: 'Approve or reject recruit requests' },
]

export const ROLE_COLOR = {
  admin:   { bg: 'bg-amber-400/12   border-amber-400/20   text-amber-300'   },
  manager: { bg: 'bg-violet-400/12  border-violet-400/20  text-violet-300'  },
  pic:     { bg: 'bg-blue-400/12    border-blue-400/20    text-blue-300'    },
  viewer:  { bg: 'bg-white/5        border-white/10       text-white/40'    },
  creator: { bg: 'bg-emerald-400/12 border-emerald-400/20 text-emerald-300' },
}
