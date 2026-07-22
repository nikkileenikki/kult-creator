export const ROLE_PERMISSIONS = {
  admin:   ['users.manage', 'contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve', 'projects.manage', 'reports.manage'],
  manager: ['contacts.view_all', 'creators.edit', 'campaigns.manage', 'brands.manage', 'recruits.approve', 'projects.manage', 'reports.manage'],
  pic:     ['contacts.view_assigned', 'creators.edit', 'projects.manage'],
  viewer:  [],
}
